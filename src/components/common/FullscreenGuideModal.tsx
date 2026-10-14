import React, { useState } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Smartphone,
  Share2,
  MoreVertical,
  PlusSquare,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface FullscreenGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  canInstall?: boolean;
  onInstall?: () => void;
}

export const FullscreenGuideModal: React.FC<FullscreenGuideModalProps> = ({
  isOpen,
  onClose,
  isFullscreen,
  onToggleFullscreen,
  canInstall = false,
  onInstall,
}) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'instant'>('instant');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href.includes('ais-dev')
        ? window.location.href.replace('ais-dev', 'ais-pre')
        : window.location.href
      : 'https://ais-pre-lju3ick2lp5enghcaqed4c-846571065204.asia-southeast1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenDirect = () => {
    window.open(currentUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Smartphone className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                Cara Tampilan Full di Layar HP
              </h3>
              <p className="text-xs text-emerald-100">
                Layar penuh tanpa bilah browser (Full Screen Standalone)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'instant'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>1-Klik Full</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android (Chrome)</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>iPhone (Safari)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* TAB 1: 1-KLIK FULLSCREEN */}
          {activeTab === 'instant' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Aktifkan Langsung di Browser Sekarang</span>
                </div>
                <p className="text-emerald-950 text-xs leading-relaxed">
                  Sentuh tombol di bawah untuk langsung memperluas aplikasi ke seluruh layar HP Anda tanpa bilah atas browser:
                </p>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      onToggleFullscreen();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-700/20 transition-all"
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-4 h-4" />
                        <span>Kembali dari Layar Penuh</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4" />
                        <span>Sentuh Di Sini untuk Layar Penuh HP</span>
                      </>
                    )}
                  </button>

                  {canInstall && onInstall && (
                    <button
                      onClick={() => {
                        onInstall();
                        onClose();
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-emerald-400 font-bold flex items-center justify-center gap-2 text-xs border border-emerald-500/30 shadow-md transition-all"
                    >
                      <PlusSquare className="w-4 h-4 text-emerald-400" />
                      <span>Pasang ke Layar Utama HP (1-Klik Install)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Direct Link Section */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Buka Tautan Langsung (Tanpa Frame Editor)</span>
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Jika saat ini Anda membuka aplikasi di dalam pratinjau AI Studio, buka tautan langsung agar tidak terhalang bingkai AI Studio:
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Link Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleOpenDirect}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka di Tab Baru</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PANDUAN ANDROID */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl text-sky-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-sky-800">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Jadikan Aplikasi Layar Penuh di Android (Chrome)</span>
                </span>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  Dengan memasang aplikasi ke Layar Utama, aplikasi akan terbuka 100% full screen layaknya aplikasi dari Play Store tanpa address bar.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Buka di Google Chrome
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Buka tautan website aplikasi di browser Google Chrome pada HP Android Anda.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5 flex items-center gap-1">
                      <span>Ketuk Menu Titik Tiga</span>
                      <MoreVertical className="w-3.5 h-3.5 text-slate-700 inline" />
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Ketuk ikon titik tiga di sudut kanan atas layar Chrome.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Pilih "Tambahkan ke Layar Utama" / "Instal Aplikasi"
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Pilih opsi <strong>Tambahkan ke Layar Utama</strong> (Add to Home screen) atau <strong>Instal Aplikasi</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    4
                  </span>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Buka Ikon Kas Masjid dari Layar Utama HP
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Aplikasi kini muncul di beranda HP Anda dan otomatis tampil <strong>100% Full Layar</strong> tanpa bilah alamat browser!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PANDUAN IPHONE */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-amber-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Share2 className="w-4 h-4 text-amber-600" />
                  <span>Jadikan Aplikasi Layar Penuh di iPhone & iPad (Safari)</span>
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Safari iOS mendukung Web App Standalone. Begitu dipasang ke Homescreen, bilah atas dan bawah Safari akan otomatis hilang.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Buka di Safari iPhone
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Pastikan Anda membuka website aplikasi menggunakan browser bawaan <strong>Safari</strong> di iOS.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5 flex items-center gap-1">
                      <span>Ketuk Tombol Bagikan (Share)</span>
                      <Share2 className="w-3.5 h-3.5 text-blue-600 inline" />
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Ketuk tombol Bagikan (ikon kotak dengan panah ke atas) di bilah navigasi bawah Safari.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5 flex items-center gap-1">
                      <span>Pilih "Add to Home Screen"</span>
                      <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" />
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Gulir ke bawah dan ketuk opsi <strong>"Add to Home Screen"</strong> (Tambahkan ke Layar Utama).
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    4
                  </span>
                  <div>
                    <strong className="block text-slate-900 font-bold mb-0.5">
                      Ketuk "Add" (Tambah) di Pojok Kanan Atas
                    </strong>
                    <span className="text-slate-500 text-[11px]">
                      Selesai! Buka aplikasi dari homescreen iPhone Anda untuk menikmati tampilan bersih layar penuh tanpa batas.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400">
            PWA Standalone & Fullscreen Mode Aktif
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
