import { appStorage } from './storage';
import {
  MosqueProfile,
  BankAccount,
  Transaction,
  DutySchedule,
  MeetingRecord,
  QurbanParticipant,
  MosqueAsset,
  AssetLoan,
  AuditLog,
  UserAccount,
  GoogleDriveConfig,
} from '../types';

export interface AppFullState {
  profile: MosqueProfile;
  accounts: BankAccount[];
  transactions: Transaction[];
  duties: DutySchedule[];
  meetings: MeetingRecord[];
  qurban: QurbanParticipant[];
  assets: MosqueAsset[];
  loans: AssetLoan[];
  auditLogs: AuditLog[];
  users: UserAccount[];
  driveConfig?: GoogleDriveConfig;
  updatedAt?: string;
  serverVersion?: number;
}

export type SyncStatusType = 'synced' | 'syncing' | 'offline' | 'error';
type SyncListener = (state: AppFullState) => void;
type StatusListener = (status: SyncStatusType, lastSyncTime?: string, isRealtimeActive?: boolean) => void;

class SyncService {
  private lastServerVersion: number = 0;
  private lastUpdatedAt: string = '';
  private syncListeners: Set<SyncListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private isSyncing: boolean = false;
  private pollingTimer: any = null;
  private debounceTimer: any = null;
  private channel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  private currentStatus: SyncStatusType = 'synced';
  private lastSyncTime: string = '';
  private isRealtimeConnected: boolean = false;
  private sseReconnectTimeout: any = null;

  constructor() {
    // 1. Cross-tab synchronization via BroadcastChannel
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('masjid_state_sync_channel');
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'STATE_UPDATED' && event.data?.state) {
            this.notifySync(event.data.state);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported or blocked:', e);
      }
    }

    // 2. Offline / Online event listeners for Automatic Background Sync
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncService] Device is back ONLINE. Triggering auto-sync...');
        this.handleNetworkOnline();
      });

      window.addEventListener('offline', () => {
        console.log('[SyncService] Device went OFFLINE. Running in offline-first cached mode.');
        this.isRealtimeConnected = false;
        this.setStatus('offline');
        window.dispatchEvent(new CustomEvent('masjid_offline_event', { detail: { isOffline: true } }));
      });
    }
  }

  public subscribe(listener: SyncListener) {
    this.syncListeners.add(listener);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  public subscribeStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.currentStatus, this.lastSyncTime, this.isRealtimeConnected);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private setStatus(status: SyncStatusType) {
    this.currentStatus = status;
    if (status === 'synced') {
      this.lastSyncTime = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    this.statusListeners.forEach((l) => l(status, this.lastSyncTime, this.isRealtimeConnected));
  }

  private notifySync(state: AppFullState) {
    this.syncListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  /**
   * Initializes sync when app loads:
   * 1. Hydrates from server or pushes local seed.
   * 2. Establishes Server-Sent Events (SSE) for zero-latency 2-way real-time sync.
   * 3. Sets up fallback polling.
   */
  public async initSync(): Promise<AppFullState | null> {
    try {
      this.setStatus('syncing');

      // Check if there are pending offline mutations from a previous offline session
      const hasPendingOffline = localStorage.getItem('masjid_has_offline_pending') === 'true';

      const res = await fetch('/api/state', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const serverState: AppFullState = json.data;

          if (hasPendingOffline) {
            // Push offline changes if local data is fresher
            const localState = appStorage.getFullState();
            await this.pushStateToServer(localState, true);
            localStorage.removeItem('masjid_has_offline_pending');
          } else {
            this.lastServerVersion = serverState.serverVersion || 1;
            this.lastUpdatedAt = serverState.updatedAt || '';
            appStorage.setFullState(serverState);
          }

          this.setStatus('synced');
          this.initRealtimeStream();
          this.startPolling();
          return appStorage.getFullState();
        } else {
          // Server is empty or fresh, seed server with current local data
          const localState = appStorage.getFullState();
          await this.pushStateToServer(localState, true);
          this.setStatus('synced');
          this.initRealtimeStream();
          this.startPolling();
          return localState;
        }
      } else {
        this.setStatus('offline');
      }
    } catch (err) {
      console.warn('[Sync] Cannot reach backend server, operating in offline/localStorage mode:', err);
      this.setStatus('offline');
    }

    this.initRealtimeStream();
    this.startPolling();
    return null;
  }

  /**
   * Establishes Server-Sent Events (SSE) for instant real-time synchronization
   */
  private initRealtimeStream() {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;

    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {
        // ignore
      }
      this.eventSource = null;
    }

    try {
      this.eventSource = new EventSource('/api/realtime');

      this.eventSource.addEventListener('connected', (_e) => {
        this.isRealtimeConnected = true;
        if (this.currentStatus !== 'syncing') {
          this.setStatus('synced');
        }
      });

      this.eventSource.addEventListener('state_update', (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.state) {
            const incomingState: AppFullState = parsed.state;
            const incomingVer = parsed.serverVersion || incomingState.serverVersion || 0;

            if (incomingVer > this.lastServerVersion) {
              this.lastServerVersion = incomingVer;
              this.lastUpdatedAt = incomingState.updatedAt || new Date().toISOString();
              appStorage.setFullState(incomingState);
              this.notifySync(incomingState);
              this.setStatus('synced');
            }
          }
        } catch (err) {
          console.error('[Sync] Error processing realtime state update:', err);
        }
      });

      this.eventSource.onerror = () => {
        this.isRealtimeConnected = false;
        // Reconnection handled automatically by browser EventSource, but we track status
        if (navigator.onLine) {
          // Temporarily offline stream
          if (this.sseReconnectTimeout) clearTimeout(this.sseReconnectTimeout);
          this.sseReconnectTimeout = setTimeout(() => {
            if (navigator.onLine && !this.isRealtimeConnected) {
              this.initRealtimeStream();
            }
          }, 5000);
        } else {
          this.setStatus('offline');
        }
      };
    } catch (err) {
      console.warn('[Sync] Failed to initialize SSE stream:', err);
      this.isRealtimeConnected = false;
    }
  }

  /**
   * Automatically triggered when device reconnects to internet
   */
  public async handleNetworkOnline() {
    this.setStatus('syncing');

    // Re-establish real-time SSE stream
    this.initRealtimeStream();

    const hasPendingOffline = localStorage.getItem('masjid_has_offline_pending') === 'true';
    if (hasPendingOffline) {
      const localState = appStorage.getFullState();
      const success = await this.pushStateToServer(localState, true);
      if (success) {
        localStorage.removeItem('masjid_has_offline_pending');
        window.dispatchEvent(
          new CustomEvent('masjid_sync_success_event', {
            detail: { message: 'Koneksi online pulih: Data offline berhasil disinkronkan ke server!' },
          })
        );
      }
    } else {
      await this.checkForServerUpdates();
      window.dispatchEvent(
        new CustomEvent('masjid_sync_success_event', {
          detail: { message: 'Terhubung kembali ke server realtime.' },
        })
      );
    }
  }

  /**
   * Starts periodic polling and focus triggers
   */
  private startPolling() {
    if (typeof window === 'undefined') return;

    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }

    // Check periodically (every 5s) to catch up if SSE stream paused
    this.pollingTimer = setInterval(() => {
      this.checkForServerUpdates();
    }, 5000);

    // Also check immediately when tab gains focus or screen turns on
    window.addEventListener('focus', () => {
      this.checkForServerUpdates();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForServerUpdates();
        if (!this.isRealtimeConnected && navigator.onLine) {
          this.initRealtimeStream();
        }
      }
    });
  }

  /**
   * Check lightweight /api/sync endpoint
   */
  public async checkForServerUpdates(): Promise<boolean> {
    if (this.isSyncing) return false;
    try {
      const res = await fetch('/api/sync', { cache: 'no-store' });
      if (!res.ok) {
        if (!navigator.onLine) this.setStatus('offline');
        return false;
      }
      const data = await res.json();

      if (data.exists && data.serverVersion > this.lastServerVersion) {
        // Newer version exists on server! Fetch full state
        const stateRes = await fetch('/api/state', { cache: 'no-store' });
        if (stateRes.ok) {
          const stateJson = await stateRes.json();
          if (stateJson.success && stateJson.data) {
            const newState: AppFullState = stateJson.data;
            this.lastServerVersion = newState.serverVersion || data.serverVersion;
            this.lastUpdatedAt = newState.updatedAt || data.updatedAt;
            appStorage.setFullState(newState);
            this.notifySync(newState);
            this.setStatus('synced');
            return true;
          }
        }
      }
      if (this.currentStatus === 'offline' && navigator.onLine) {
        this.setStatus('synced');
      }
    } catch (e) {
      if (!navigator.onLine && this.currentStatus !== 'offline') {
        this.setStatus('offline');
      }
    }
    return false;
  }

  /**
   * Push full state or partial updates to server with debounce.
   * If offline, stores locally and queues background sync on reconnect.
   */
  public pushStateToServer(state: AppFullState, immediate: boolean = false): Promise<boolean> {
    // 1. Save to local storage first (instant responsiveness, offline-first)
    appStorage.setFullState(state);

    // 2. Broadcast to other open tabs on this browser
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'STATE_UPDATED', state });
      } catch (e) {
        // ignore
      }
    }

    // 3. If offline, record pending sync flag
    if (!navigator.onLine) {
      localStorage.setItem('masjid_has_offline_pending', 'true');
      this.setStatus('offline');
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      const doSend = async () => {
        try {
          this.isSyncing = true;
          this.setStatus('syncing');

          const payload = {
            ...state,
            serverVersion: this.lastServerVersion,
          };

          const res = await fetch('/api/state', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const resJson = await res.json();
            if (resJson.success) {
              this.lastServerVersion = resJson.serverVersion || this.lastServerVersion + 1;
              this.lastUpdatedAt = resJson.updatedAt;
              localStorage.removeItem('masjid_has_offline_pending');
              this.setStatus('synced');
              resolve(true);
              return;
            }
          }

          // If fetch fails or network dropped
          localStorage.setItem('masjid_has_offline_pending', 'true');
          this.setStatus('offline');
          resolve(false);
        } catch (err) {
          console.warn('[Sync] Failed to push state to server (device may be offline):', err);
          localStorage.setItem('masjid_has_offline_pending', 'true');
          this.setStatus('offline');
          resolve(false);
        } finally {
          this.isSyncing = false;
        }
      };

      if (immediate) {
        doSend();
      } else {
        this.debounceTimer = setTimeout(doSend, 250);
      }
    });
  }

  public getStatus() {
    return {
      status: this.currentStatus,
      lastSyncTime: this.lastSyncTime,
      version: this.lastServerVersion,
      isRealtimeConnected: this.isRealtimeConnected,
    };
  }
}

export const syncService = new SyncService();
