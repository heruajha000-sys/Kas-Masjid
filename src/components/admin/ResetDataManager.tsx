import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  Download,
  CheckCircle2,
  RefreshCw,
  Wallet,
  Users,
  HeartHandshake,
  Calendar,
  Package,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  Transaction,
  BankAccount,
  MeetingRecord,
  QurbanParticipant,
  DutySchedule,
  AssetLoan,
  AuditLog,
  MosqueProfile,
  UserAccount,
} from '../../types';
import { appStorage, formatRupiah } from '../../utils/storage';

interface ResetDataManagerProps {
  profile: MosqueProfile;
  accounts: BankAccount[];
  transactions: Transaction[];
  meetings: MeetingRecord[];
  qurbanList: QurbanParticipant[];
  duties: DutySchedule[];
  loans: AssetLoan[];
  logs: AuditLog[];
  currentUser: UserAccount;
  onDataReset: () => void;
}

export const ResetDataManager: React.FC<ResetDataManagerProps> = ({
  profile,
  accounts,
  transactions,
  meetings,
  qurbanList,
  duties,
  loans,
  logs,
  currentUser,
  onDataReset,
}) => {
  // Granular checkbox selections
  const [resetCash, setResetCash] = useState(true);
  const [zeroBalances, setZeroBalances] = useState(true);
  const [resetMeetings, setResetMeetings] = useState(true);
  const [resetQurban, setResetQurban] = useState(true);
  const [resetDuties, setResetDuties] = useState(false);
  const [resetLoans, setResetLoans] = useState(false);
  const [resetAuditLogs, setResetAuditLogs] = useState(false);
  const [resetCategories, setResetCategories] = useState(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resetMode, setResetMode] = useState<'selected' | 'all_financial' | 'factory_fresh'>('selected');
  const [confirmInput, setConfirmInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalSaldo = accounts.reduce((sum, a) => sum + a.balance, 0);

  // Helper to backup before reset
  const handleDownloadBackup = () => {
    const jsonStr = appStorage.exportCompleteDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `backup_sebelum_reset_${profile.name.replace(/\s+/g, '_')}_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Open confirmation for selected reset
  const openConfirmSelected = () => {
    if (
      !resetCash &&
      !zeroBalances &&
      !resetMeetings &&
      !resetQurban &&
      !resetDuties &&
      !resetLoans &&
      !resetAuditLogs &&
      !resetCategories
    ) {
      setErrorMessage('Pilih minimal satu kategori data yang ingin direset.');
      return;
    }
    setErrorMessage(null);
    setResetMode('selected');
    setConfirmInput('');
    setShowConfirmModal(true);
  };

  // Open confirmation for only financial reset
  const openConfirmFinancialOnly = () => {
    setErrorMessage(null);
    setResetMode('all_financial');
    setConfirmInput('');
    setShowConfirmModal(true);
  };

  // Open confirmation for complete factory reset (keep profile)
  const openConfirmFactoryFresh = () => {
    setErrorMessage(null);
    setResetMode('factory_fresh');
    setConfirmInput('');
    setShowConfirmModal(true);
  };

  const handleExecuteReset = () => {
    if (confirmInput.trim().toUpperCase() !== 'RESET') {
      setErrorMessage('Ketik kata "RESET" dengan huruf kapital untuk mengonfirmasi.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    setTimeout(() => {
      try {
        if (resetMode === 'all_financial') {
          appStorage.resetFinancialData(true, currentUser.name, currentUser.role);
          setSuccessMessage('Semua data keuangan dan mutasi kas berhasil dihapus. Saldo kas kini Rp 0.');
        } else if (resetMode === 'factory_fresh') {
          appStorage.resetSelectedData(
            {
              cashTransactions: true,
              zeroCashBalances: true,
              meetings: true,
              qurban: true,
              duties: true,
              loans: true,
              auditLogs: true,
              customCategories: true,
            },
            currentUser.name,
            currentUser.role
          );
          setSuccessMessage(
            'Sistem telah dibersihkan sepenuhnya untuk pembukuan baru. Identitas masjid tetap tersimpan rapi.'
          );
        } else {
          // Selected items
          appStorage.resetSelectedData(
            {
              cashTransactions: resetCash,
              zeroCashBalances: zeroBalances,
              meetings: resetMeetings,
              qurban: resetQurban,
              duties: resetDuties,
              loans: resetLoans,
              auditLogs: resetAuditLogs,
              customCategories: resetCategories,
            },
            currentUser.name,
            currentUser.role
          );
          setSuccessMessage('Data terpilih berhasil dibersihkan dan diperbarui.');
        }

        // Trigger reactivity in App.tsx
        onDataReset();
        setShowConfirmModal(false);
      } catch (err) {
        setErrorMessage('Terjadi kesalahan saat mereset data: ' + (err as Error).message);
      } finally {
        setIsProcessing(false);
      }
    }, 400);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Reset & Bersihkan Data Masjid</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                Pembersihan Data
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Hapus catatan transaksi kas, saldo kas awal, absensi rapat, serta data contoh untuk memulai pembukuan baru
            </p>
          </div>
        </div>

        {/* Download Backup Button */}
        <button
          onClick={handleDownloadBackup}
          className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 transition-all shadow-xs self-start md:self-auto"
          title="Unduh file backup database JSON"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Cadangkan Data (Backup JSON)</span>
        </button>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="block text-xs font-bold">Proses Berhasil!</strong>
              <p className="text-xs text-emerald-800">{successMessage}</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Current Data Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kas Masuk/Keluar</span>
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {transactions.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Saldo: {formatRupiah(totalSaldo)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Daftar Rapat</span>
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {meetings.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Arsip agenda & notula
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
            <span>Peserta Qurban</span>
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {qurbanList.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Shohibul qurban
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Jadwal Petugas</span>
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {duties.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Imam & Khatib Jumat
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
            <Package className="w-3.5 h-3.5 text-purple-600" />
            <span>Pinjam Aset</span>
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {loans.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Riwayat peminjaman
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
            <span>Log Audit</span>
          </div>
          <div className="text-base font-extrabold text-slate-900">
            {logs.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Aktivitas digital
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Option 1: Reset Keuangan Saja */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-rose-300 transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Reset Semua Keuangan & Kas Saja
                </h3>
                <span className="text-[11px] text-slate-400">
                  Menghapus mutasi kas dan mengosongkan saldo kas
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan menghapus <strong>{transactions.length} catatan kas masuk & keluar</strong>, serta mengatur ulang saldo di seluruh buku kas ({accounts.map((a) => a.name).join(', ')}) menjadi <strong>Rp 0</strong>. Jadwal, rapat, dan data masjid lainnya tetap aman.
            </p>
          </div>

          <button
            onClick={openConfirmFinancialOnly}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Wallet className="w-4 h-4" />
            <span>Hapus Semua Keuangan (Nol-kan Kas)</span>
          </button>
        </div>

        {/* Quick Option 2: Reset Bersih Total (Fresh Start) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-rose-300 transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Mulai Pembukuan Bersih (Fresh Start)
                </h3>
                <span className="text-[11px] text-slate-400">
                  Bersihkan semua transaksi dan data contoh sekaligus
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengosongkan semua data transaksi keuangan (saldo Rp 0), daftar hadir rapat, peserta qurban, dan riwayat peminjaman. <strong>Identitas masjid ({profile.name}) dan akun pengurus tetap tersimpan</strong>.
            </p>
          </div>

          <button
            onClick={openConfirmFactoryFresh}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Total & Mulai Buku Kas Baru</span>
          </button>
        </div>
      </div>

      {/* Granular Selection Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Pilihan Pembersihan Data Khusus (Granular)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Centang item yang ingin Anda hapus sesuai kebutuhan pengurus masjid
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setResetCash(true);
                setZeroBalances(true);
                setResetMeetings(true);
                setResetQurban(true);
                setResetDuties(true);
                setResetLoans(true);
                setResetAuditLogs(true);
                setResetCategories(true);
              }}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Pilih Semua
            </button>
            <button
              onClick={() => {
                setResetCash(false);
                setZeroBalances(false);
                setResetMeetings(false);
                setResetQurban(false);
                setResetDuties(false);
                setResetLoans(false);
                setResetAuditLogs(false);
                setResetCategories(false);
              }}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Hapus Pilihan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Item 1: Transaksi Kas */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={resetCash}
              onChange={(e) => setResetCash(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div className="text-xs">
              <strong className="block text-slate-900 font-bold">
                Hapus Semua Transaksi Kas Masuk & Keluar ({transactions.length} data)
              </strong>
              <span className="text-slate-500 text-[11px]">
                Membersihkan seluruh arsip mutasi dan kuitansi kas yang pernah dicatat.
              </span>
            </div>
          </label>

          {/* Item 2: Nol-kan Saldo Rekening */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={zeroBalances}
              onChange={(e) => setZeroBalances(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div className="text-xs">
              <strong className="block text-slate-900 font-bold">
                Atur Ulang Saldo Buku Kas ke Rp 0 ({accounts.length} rekening)
              </strong>
              <span className="text-slate-500 text-[11px]">
                Mengosongkan saldo aktif (saat ini {formatRupiah(totalSaldo)}) menjadi Rp 0.
              </span>
            </div>
          </label>

          {/* Item 3: Daftar Hadir Rapat */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={resetMeetings}
              onChange={(e) => setResetMeetings(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div className="text-xs">
              <strong className="block text-slate-900 font-bold">
                Hapus Arsip Daftar Hadir Rapat & Notula ({meetings.length} agenda)
              </strong>
              <span className="text-slate-500 text-[11px]">
                Mengosongkan daftar pertemuan, absensi pengurus, dan tanda tangan digital.
              </span>
            </div>
          </label>

          {/* Item 4: Peserta Qurban */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={resetQurban}
              onChange={(e) => setResetQurban(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div className="text-xs">
              <strong className="block text-slate-900 font-bold">
                Hapus Data Peserta Qurban ({qurbanList.length} shohibul qurban)
              </strong>
              <span className="text-slate-500 text-[11px]">
                Membersihkan data nama jamaah qurban, hewan, dan status pelunasan.
              </span>
            </div>
          </label>

          {/* Item 5: Jadwal Petugas */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={resetDuties}
              onChange={(e) => setResetDuties(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div className="text-xs">
              <strong className="block text-slate-900 font-bold">
                Hapus Jadwal Imam & Khatib ({duties.length} jadwal)
              </strong>
              <span className="text-slate-500 text-[11px]">
                Mengosongkan daftar penugasan khotbah Jumat dan imam shalat.
              </span>
            </div>
          </label>

          {/* Item 6: Riwayat Peminjaman Aset */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={resetLoans}
              onChange={(e) => setResetLoans(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div className="text-xs">
              <strong className="block text-slate-900 font-bold">
                Hapus Riwayat Peminjaman Aset ({loans.length} riwayat pinjam)
              </strong>
              <span className="text-slate-500 text-[11px]">
                Mengosongkan log peminjaman sarana inventaris masjid oleh warga.
              </span>
            </div>
          </label>

          {/* Item 7: Log Audit */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={resetAuditLogs}
              onChange={(e) => setResetAuditLogs(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div className="text-xs">
              <strong className="block text-slate-900 font-bold">
                Bersihkan Log Audit Aktivitas Digital ({logs.length} catatan)
              </strong>
              <span className="text-slate-500 text-[11px]">
                Mengosongkan riwayat rekaman perubahan sistem terdahulu.
              </span>
            </div>
          </label>

          {/* Item 8: Reset Kategori Kas Kustom */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={resetCategories}
              onChange={(e) => setResetCategories(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <div className="text-xs">
              <strong className="block text-slate-900 font-bold">
                Kembalikan Kategori Kas ke Standar Masjid
              </strong>
              <span className="text-slate-500 text-[11px]">
                Menghapus kategori kustom dan merestore 12 kategori standar.
              </span>
            </div>
          </label>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Hanya item yang dicentang yang akan dihapus dari sistem penyimpanan lokal</span>
          </div>

          <button
            onClick={openConfirmSelected}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Jalankan Pembersihan Pilihan</span>
          </button>
        </div>
      </div>

      {/* Confirmation Safety Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Konfirmasi Keamanan Reset Data
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Tindakan ini permanen dan tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1.5 leading-relaxed">
              <p>
                Anda akan melakukan pembersihan data untuk{' '}
                <strong>{profile.name}</strong>.
              </p>
              {resetMode === 'all_financial' && (
                <p>
                  • <strong>Semua {transactions.length} transaksi kas</strong> akan dihapus dan seluruh saldo rekening diset menjadi <strong>Rp 0</strong>.
                </p>
              )}
              {resetMode === 'factory_fresh' && (
                <p>
                  • <strong>Semua transaksi, saldo, rapat, qurban, dan riwayat</strong> akan dibersihkan ke kondisi awal.
                </p>
              )}
              {resetMode === 'selected' && (
                <p>
                  • Item yang dipilih ({resetCash ? 'Kas, ' : ''}
                  {zeroBalances ? 'Saldo Rp 0, ' : ''}
                  {resetMeetings ? 'Rapat, ' : ''}
                  {resetQurban ? 'Qurban' : ''}) akan dibersihkan.
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Ketik kata <span className="text-rose-600 font-extrabold">RESET</span> di bawah ini:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmInput('RESET');
                    setErrorMessage(null);
                  }}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline"
                >
                  Isi otomatis "RESET"
                </button>
              </div>
              <input
                type="text"
                placeholder="Ketik RESET"
                value={confirmInput}
                onChange={(e) => {
                  setConfirmInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-900 font-bold text-sm focus:border-rose-500 focus:outline-none uppercase text-center tracking-widest"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                disabled={confirmInput.trim().toUpperCase() !== 'RESET' || isProcessing}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus & Reset Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
