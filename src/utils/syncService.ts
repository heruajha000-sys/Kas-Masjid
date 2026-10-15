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

type SyncListener = (state: AppFullState) => void;
type StatusListener = (status: 'synced' | 'syncing' | 'offline' | 'error', lastSyncTime?: string) => void;

class SyncService {
  private lastServerVersion: number = 0;
  private lastUpdatedAt: string = '';
  private syncListeners: Set<SyncListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private isSyncing: boolean = false;
  private pollingTimer: any = null;
  private debounceTimer: any = null;
  private channel: BroadcastChannel | null = null;
  private currentStatus: 'synced' | 'syncing' | 'offline' | 'error' = 'synced';
  private lastSyncTime: string = '';

  constructor() {
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
  }

  public subscribe(listener: SyncListener) {
    this.syncListeners.add(listener);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  public subscribeStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.currentStatus, this.lastSyncTime);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private setStatus(status: 'synced' | 'syncing' | 'offline' | 'error') {
    this.currentStatus = status;
    if (status === 'synced') {
      this.lastSyncTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    this.statusListeners.forEach((l) => l(status, this.lastSyncTime));
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
   * 1. Fetches server state.
   * 2. If server has data, applies it.
   * 3. If server has no data, pushes local state to server.
   * 4. Starts periodic polling so other devices' changes reflect automatically.
   */
  public async initSync(): Promise<AppFullState | null> {
    try {
      this.setStatus('syncing');
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const serverState: AppFullState = json.data;
          this.lastServerVersion = serverState.serverVersion || 1;
          this.lastUpdatedAt = serverState.updatedAt || '';
          
          // Apply to local storage
          appStorage.setFullState(serverState);
          this.setStatus('synced');
          this.startPolling();
          return serverState;
        } else {
          // Server is empty or has no state yet, seed server with current local data
          const localState = appStorage.getFullState();
          await this.pushStateToServer(localState);
          this.setStatus('synced');
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

    this.startPolling();
    return null;
  }

  /**
   * Starts periodic polling and focus triggers
   */
  private startPolling() {
    if (typeof window === 'undefined') return;

    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }

    // Poll server every 4 seconds to check if another device changed data
    this.pollingTimer = setInterval(() => {
      this.checkForServerUpdates();
    }, 4000);

    // Also check immediately when tab gains focus
    window.addEventListener('focus', () => {
      this.checkForServerUpdates();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForServerUpdates();
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
      if (!res.ok) return false;
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
      if (this.currentStatus === 'offline') {
        this.setStatus('synced');
      }
    } catch (e) {
      // Offline or network error
      if (this.currentStatus !== 'offline') {
        this.setStatus('offline');
      }
    }
    return false;
  }

  /**
   * Push full state or partial updates to server with debounce
   */
  public pushStateToServer(state: AppFullState, immediate: boolean = false): Promise<boolean> {
    // Save to local storage first (instant responsiveness)
    appStorage.setFullState(state);

    // Broadcast to other open tabs on this machine
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'STATE_UPDATED', state });
      } catch (e) {
        // ignore
      }
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
              this.setStatus('synced');
              resolve(true);
              return;
            }
          }
          this.setStatus('offline');
          resolve(false);
        } catch (err) {
          console.warn('[Sync] Failed to push state to server:', err);
          this.setStatus('offline');
          resolve(false);
        } finally {
          this.isSyncing = false;
        }
      };

      if (immediate) {
        doSend();
      } else {
        this.debounceTimer = setTimeout(doSend, 300);
      }
    });
  }

  public getStatus() {
    return {
      status: this.currentStatus,
      lastSyncTime: this.lastSyncTime,
      version: this.lastServerVersion,
    };
  }
}

export const syncService = new SyncService();
