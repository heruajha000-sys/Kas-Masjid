import React from 'react';
import {
  Download,
  Share2,
  PlusSquare,
  Smartphone,
  CheckCircle,
  X,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md p-1.5 flex items-center justify-center border border-white/25 shadow-inner">
              <img src="/icon.svg" alt="App Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Pasang Aplikasi Masjid</h2>
              <p className="text-xs text-emerald-100 font-medium">
                Akses instan dari Layar Utama HP / PC tanpa mengetik link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status banner */}
          {isInstalled ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Aplikasi Sudah Terpasang</h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Aplikasi Kas & Mading Masjid saat ini sudah berjalan dalam mode standalone di perangkat Anda.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Pemasangan 1-Klik Tersedia</span>
              </div>
              <p className="text-xs text-emerald-700">
                Browser Anda mendukung pemasangan otomatis langsung ke layar utama ponsel atau desktop.
              </p>
              <button
                onClick={handleNativeInstall}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Pasang ke Layar Utama Sekarang</span>
              </button>
            </div>
          ) : null}

          {/* iOS Safari Guide */}
          <div className={`p-4 rounded-2xl border transition-all ${isIOS ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Petunjuk untuk iPhone / iPad (Safari)</span>
              {isIOS && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold ml-auto">
                  Perangkat Anda
                </span>
              )}
            </div>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Buka link ini di browser <strong>Safari</strong> (bukan Chrome di iOS).
              </li>
              <li>
                Ketuk tombol <strong>Bagikan (Share)</strong>{' '}
                <Share2 className="w-3.5 h-3.5 inline text-blue-600 align-middle" /> di bilah navigasi bawah Safari.
              </li>
              <li>
                Gulir ke bawah dan pilih opsi{' '}
                <strong className="text-slate-900">
                  <PlusSquare className="w-3.5 h-3.5 inline text-emerald-600 align-middle" /> Tambahkan ke Layar Utama (Add to Home Screen)
                </strong>.
              </li>
              <li>
                Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon aplikasi akan langsung muncul di layar utama HP Anda!
              </li>
            </ol>
          </div>

          {/* Android Chrome Guide */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Petunjuk untuk Android (Google Chrome / Brave)</span>
            </div>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Buka aplikasi di <strong>Google Chrome</strong>.
              </li>
              <li>
                Ketuk ikon titik tiga (<strong>⋮</strong>) di pojok kanan atas browser.
              </li>
              <li>
                Pilih menu <strong>Tambahkan ke Layar Utama</strong> atau <strong>Pasang Aplikasi</strong>.
              </li>
              <li>
                Aplikasi siap digunakan secara penuh layar (layar penuh tanpa bilah URL browser).
              </li>
            </ol>
          </div>

          {/* Desktop Guide */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-2">
              <Laptop className="w-4 h-4 text-emerald-600" />
              <span>Petunjuk untuk Laptop & Komputer (PC / Mac)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pada bilah alamat (URL bar) Chrome atau Edge, ketuk ikon{' '}
              <strong>Pasang Aplikasi / Install</strong>{' '}
              <Download className="w-3.5 h-3.5 inline text-emerald-600 align-middle" /> di sebelah kanan tombol bookmark bintang.
            </p>
          </div>

          {/* Benefits Info */}
          <div className="p-3.5 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Mendukung Mode Offline & Sinkronisasi Realtime
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
