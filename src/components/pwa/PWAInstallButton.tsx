import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'tv' | 'minimal';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  // If already installed as standalone PWA and variant is minimal, hide it
  if (isInstalled && variant === 'minimal') {
    return null;
  }

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer border border-emerald-500/30 ${className}`}
          title="Pasang Aplikasi ke Layar Utama HP / Desktop"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pasang Aplikasi</span>
          <span className="sm:hidden">Pasang</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all ${className}`}
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Pasang ke Layar HP (PWA)</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
            {isInstalled ? 'Aktif' : 'Install'}
          </span>
        </button>
      )}

      {variant === 'tv' && (
        <button
          onClick={handleClick}
          className={`px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all backdrop-blur-md ${className}`}
          title="Pasang Aplikasi ke Layar Utama (PWA)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pasang App (PWA)</span>
        </button>
      )}

      {variant === 'minimal' && (
        <button
          onClick={handleClick}
          className={`p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ${className}`}
          title="Pasang Aplikasi ke Layar Utama"
        >
          <Download className="w-4 h-4 text-emerald-600" />
        </button>
      )}

      <PWAInstallModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
