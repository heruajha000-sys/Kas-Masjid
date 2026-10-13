import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export interface DeleteConfirmDetail {
  label: string;
  value: string | number;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode | string;
  itemDetails?: DeleteConfirmDetail[];
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isProcessing?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  itemDetails,
  confirmLabel = 'Ya, Hapus Sekarang',
  cancelLabel = 'Batal',
  isDanger = true,
  isProcessing = false,
  onConfirm,
  onClose,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDanger
                  ? 'bg-rose-100 text-rose-600 ring-4 ring-rose-50'
                  : 'bg-amber-100 text-amber-600 ring-4 ring-amber-50'
              }`}
            >
              {isDanger ? (
                <Trash2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konfirmasi penghapusan data
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs text-slate-600">
          <div className="leading-relaxed text-slate-700 font-medium">
            {message}
          </div>

          {itemDetails && itemDetails.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              {itemDetails.map((detail, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-0.5"
                >
                  <span className="text-slate-500">{detail.label}:</span>
                  <span className="font-bold text-slate-800 text-right truncate ml-2">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Tindakan ini akan menghapus data secara permanen dari sistem penyimpanan lokal masjid.
            </span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-xs"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-xs ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 active:bg-rose-800'
                : 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 active:bg-amber-800'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
