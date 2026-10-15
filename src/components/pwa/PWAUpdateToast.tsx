import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, Sparkles, X, CheckCircle, WifiOff, Wifi } from 'lucide-react';

export const PWAUpdateToast: React.FC = () => {
  const [offlineToast, setOfflineToast] = useState<{ visible: boolean; type: 'offline' | 'online'; message: string }>({
    visible: false,
    type: 'online',
    message: '',
  });

  // Service worker registration from vite-plugin-pwa
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log(`[PWA] Service Worker registered at: ${swUrl}`);
      if (r) {
        // Poll for updates in the background every 60 seconds
        setInterval(() => {
          console.log('[PWA] Checking for background service worker update...');
          r.update().catch((err) => console.warn('[PWA] SW update check error:', err));
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('[PWA] Service Worker registration failed:', error);
    },
  });

  // Listen to custom online/offline events dispatched by syncService
  useEffect(() => {
    const handleOffline = () => {
      setOfflineToast({
        visible: true,
        type: 'offline',
        message: 'Mode Offline Aktif — Data tersimpan lokal di HP dan akan otomatis disinkronkan saat online kembali.',
      });
      setTimeout(() => {
        setOfflineToast((prev) => ({ ...prev, visible: false }));
      }, 5000);
    };

    const handleSyncSuccess = (e: any) => {
      setOfflineToast({
        visible: true,
        type: 'online',
        message: e?.detail?.message || 'Koneksi kembali online! Data otomatis disinkronkan.',
      });
      setTimeout(() => {
        setOfflineToast((prev) => ({ ...prev, visible: false }));
      }, 4000);
    };

    window.addEventListener('masjid_offline_event', handleOffline);
    window.addEventListener('masjid_sync_success_event', handleSyncSuccess);

    return () => {
      window.removeEventListener('masjid_offline_event', handleOffline);
      window.removeEventListener('masjid_sync_success_event', handleSyncSuccess);
    };
  }, []);

  const handleApplyUpdate = () => {
    // skipWaiting & refresh
    updateServiceWorker(true);
  };

  return (
    <>
      {/* 1. Interactive Update Toast (Pembaruan Versi Baru Terdeteksi) */}
      {needRefresh && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-auto animate-in slide-in-from-bottom duration-300">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/40 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span>Versi Baru Tersedia!</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-900 font-black">
                    Update
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Aset & pembaruan sistem telah diunduh di latar belakang.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleApplyUpdate}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Perbarui Sekarang</span>
              </button>
              <button
                onClick={() => setNeedRefresh(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Offline Ready Feedback Toast */}
      {offlineReady && (
        <div className="fixed bottom-5 left-5 z-50 max-w-sm animate-in slide-in-from-bottom duration-300">
          <div className="bg-slate-900/95 text-white rounded-2xl p-3.5 shadow-xl border border-slate-700/80 backdrop-blur-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-xs text-slate-200">
                <strong>Aplikasi Siap Offline:</strong> Aset telah dicache, aplikasi tetap dapat dibuka tanpa sinyal internet.
              </p>
            </div>
            <button
              onClick={() => setOfflineReady(false)}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Offline / Online Connectivity Notification Toast */}
      {offlineToast.visible && (
        <div className="fixed top-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] sm:w-auto animate-in slide-in-from-top duration-300">
          <div
            className={`rounded-2xl p-3.5 shadow-2xl border backdrop-blur-md flex items-center justify-between gap-3 ${
              offlineToast.type === 'offline'
                ? 'bg-amber-950/90 text-amber-100 border-amber-600/40'
                : 'bg-emerald-950/90 text-emerald-100 border-emerald-600/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {offlineToast.type === 'offline' ? (
                <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <Wifi className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <p className="text-xs leading-snug">{offlineToast.message}</p>
            </div>
            <button
              onClick={() => setOfflineToast((prev) => ({ ...prev, visible: false }))}
              className="p-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
