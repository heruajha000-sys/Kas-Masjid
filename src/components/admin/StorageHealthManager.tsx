import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { appStorage, formatRupiah } from '../../utils/storage';
import { MosqueProfile, UserAccount } from '../../types';

interface StorageHealthManagerProps {
  profile: MosqueProfile;
  currentUser: UserAccount;
  onDataRestored: () => void;
}

export const StorageHealthManager: React.FC<StorageHealthManagerProps> = ({
  profile,
  currentUser,
  onDataRestored,
}) => {
  const [health, setHealth] = useState(() => appStorage.getStorageHealth());
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const refreshHealth = () => {
    setHealth(appStorage.getStorageHealth());
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  // Export Complete Backup JSON
  const handleDownloadFullBackup = () => {
    const jsonStr = appStorage.exportCompleteDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    const cleanName = profile.name.replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `backup_lengkap_${cleanName}_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Unduh Cadangan JSON Lengkap',
      details: 'Pengurus mengekspor seluruh database masjid ke berkas JSON',
      category: 'sistem',
    });
  };

  // Restore JSON File
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = appStorage.importCompleteDatabaseJSON(content);
        if (res.success) {
          appStorage.addAuditLog({
            userName: currentUser.name,
            userRole: currentUser.role,
            action: 'Pemulihan Database (Restore JSON)',
            details: `Berhasil memulihkan data dari berkas: ${file.name}`,
            category: 'sistem',
          });
          setImportStatus({
            success: true,
            message: `Data masjid berhasil dipulihkan secara utuh dari berkas "${file.name}"!`,
          });
          refreshHealth();
          onDataRestored();
        } else {
          setImportStatus({
            success: false,
            message: `Format berkas tidak valid: ${res.error}`,
          });
        }
      } catch (err) {
        setImportStatus({
          success: false,
          message: `Gagal membaca berkas cadangan: ${(err as Error).message}`,
        });
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setImportStatus({
        success: false,
        message: 'Gagal membaca berkas cadangan.',
      });
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleCleanAuditLogs = () => {
    if (confirm('Bersihkan log audit lama untuk menghemat kapasitas penyimpanan?')) {
      appStorage.resetAuditLogsOnly(currentUser.name, currentUser.role);
      refreshHealth();
      onDataRestored();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Kesehatan Penyimpanan & Cadangan Data</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                Penyimpanan Aman
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau kapasitas memori lokal, ekspor cadangan rutin, serta pulihkan data masjid tanpa resiko
            </p>
          </div>
        </div>

        <button
          onClick={refreshHealth}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Segarkan Status</span>
        </button>
      </div>

      {/* Storage Health Gauge Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
          <span>Indikator Kuota Penyimpanan Perangkat (LocalStorage)</span>
          <span className="text-xs font-mono font-semibold text-slate-600">
            {health.totalKB.toLocaleString()} KB / {health.quotaKB.toLocaleString()} KB ({health.usagePercent}%)
          </span>
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden mb-3 border border-slate-200">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              health.usagePercent > 80
                ? 'bg-rose-500'
                : health.usagePercent > 60
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(health.usagePercent, 3)}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px]">Status Memori</span>
            <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
              {health.isNearLimit ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-600">Perlu Dioptimalkan</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-700">Sangat Sehat & Ringan</span>
                </>
              )}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px]">Sisa Ruang Bebas</span>
            <span className="font-bold font-mono text-slate-800 mt-0.5 block">
              {(health.quotaKB - health.totalKB).toLocaleString()} KB
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px]">Proteksi Kompresi Gambar</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Canvas JPEG Aktif (Hemat ~90%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Backup and Restore Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Download Full Backup */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Cadangkan Seluruh Data (Ekspor JSON)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Unduh salinan arsip digital lengkap mencakup seluruh mutasi kas, rekening bank, inventaris barang,
              jadwal imam & khatib, peserta qurban, profil DKM, dan log audit pengurus ke satu berkas aman.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Direkomendasikan setiap akhir bulan</span>
            <button
              onClick={handleDownloadFullBackup}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas Cadangan</span>
            </button>
          </div>
        </div>

        {/* Card 2: Restore from Backup */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Pulihkan Data dari Berkas (Impor JSON)</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Pindahkan data ke laptop/komputer baru atau pulihkan pembukuan masjid yang telah dicadangkan sebelumnya.
              Sistem akan memverifikasi struktur file secara otomatis sebelum menerapkan pemulihan.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Pilih berkas format .json</span>
            <label className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{isProcessing ? 'Memproses...' : 'Pilih Berkas JSON'}</span>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                disabled={isProcessing}
                onChange={handleFileImport}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Notification banner on import */}
      {importStatus && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-3 ${
            importStatus.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {importStatus.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Storage Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Rincian Ukuran Data per Modul</h3>
            <p className="text-xs text-slate-500">Melihat konsumsi memori setiap bagian pembukuan</p>
          </div>

          <button
            onClick={handleCleanAuditLogs}
            className="px-3 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Bersihkan Log Lama</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {health.itemBreakdown.map((item) => (
            <div key={item.key} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700 capitalize">{item.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({item.key})</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="font-semibold text-slate-800">{item.sizeKB} KB</span>
                <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(item.sizeKB * 2, 5))}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

          {health.itemBreakdown.length === 0 && (
            <div className="p-6 text-center text-slate-400">
              Belum ada data masjid tersimpan di peramban ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
