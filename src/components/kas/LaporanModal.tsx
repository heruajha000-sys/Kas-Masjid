import React, { useRef } from 'react';
import {
  Printer,
  FileSpreadsheet,
  X,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
} from 'lucide-react';
import {
  MosqueProfile,
  Transaction,
  BankAccount,
} from '../../types';
import { formatRupiah, exportToCSV } from '../../utils/storage';
import { formatIndonesianDate } from '../../utils/prayerTimes';

interface LaporanModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MosqueProfile;
  transactions: Transaction[];
  accounts: BankAccount[];
  selectedMonth: number; // 0-11 or -1 for all
  selectedYear: number;
}

export const LaporanModal: React.FC<LaporanModalProps> = ({
  isOpen,
  onClose,
  profile,
  transactions,
  accounts,
  selectedMonth,
  selectedYear,
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filter transactions
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date);
    const matchYear = d.getFullYear() === selectedYear;
    const matchMonth = selectedMonth === -1 || d.getMonth() === selectedMonth;
    return matchYear && matchMonth;
  });

  const totalIn = filtered.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIn - totalOut;
  const totalAllAccountsBalance = accounts.reduce((s, a) => s + a.balance, 0);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const periodLabel = selectedMonth === -1 ? `Tahun ${selectedYear}` : `Bulan ${monthNames[selectedMonth]} ${selectedYear}`;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const headers = [
      'No',
      'Tanggal',
      'Jenis Kas',
      'Kategori',
      'Keterangan Transaksi',
      'Rekening Akun',
      'Pemasukan (Rp)',
      'Pengeluaran (Rp)',
      'Petugas Pencatat',
      'Bukti Nota/Drive',
    ];

    const rows: (string | number)[][] = [
      [`LAPORAN KAS & KEUANGAN ${profile.name.toUpperCase()}`],
      [`Periode: ${periodLabel}`],
      [`Dicetak pada: ${formatIndonesianDate(new Date())}`],
      [],
      headers,
    ];

    filtered.forEach((t, idx) => {
      const acc = accounts.find((a) => a.id === t.accountId);
      rows.push([
        idx + 1,
        t.date,
        t.type === 'in' ? 'Pemasukan' : 'Pengeluaran',
        t.category,
        t.description,
        acc ? acc.name : t.accountId,
        t.type === 'in' ? t.amount : 0,
        t.type === 'out' ? t.amount : 0,
        t.recordedBy,
        t.receiptName || (t.driveSynced ? 'Tersimpan di Google Drive' : '-'),
      ]);
    });

    rows.push([]);
    rows.push(['', '', '', '', 'TOTAL PEMASUKAN', '', totalIn, '', '', '']);
    rows.push(['', '', '', '', 'TOTAL PENGELUARAN', '', '', totalOut, '', '']);
    rows.push(['', '', '', '', 'SURPLUS / DEFISIT BERSIH', '', netFlow, '', '', '']);
    rows.push(['', '', '', '', 'TOTAL SALDO AKHIR SEMUA REKENING', '', totalAllAccountsBalance, '', '', '']);

    exportToCSV(`Laporan-Kas-${profile.name.replace(/\s+/g, '-')}-${periodLabel.replace(/\s+/g, '_')}.csv`, rows);
  };

  return (
    <div
      id="laporan-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4"
    >
      <div
        id="laporan-modal-container"
        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl"
      >
        {/* Modal Action Header (Excluded from Print) */}
        <div className="no-print p-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-lg text-white">Cetak & Export Laporan Keuangan Masjid</h3>
              <p className="text-xs text-slate-400">Siap tempel di papan mading atau arsip pertanggungjawaban</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel (CSV)</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div
          ref={printContentRef}
          id="printable-laporan-content"
          className="flex-1 overflow-y-auto p-8 bg-white text-slate-900"
        >
          {/* KOP RESMI SURAT MASJID */}
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {profile.logoUrl && profile.logoUrl.trim() !== '' ? (
                <img
                  src={profile.logoUrl}
                  alt="Logo"
                  className="w-20 h-20 object-cover rounded-xl border border-slate-300"
                />
              ) : null}
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                  DEWAN KEMAKMURAN MASJID (DKM)
                </h1>
                <h2 className="text-xl font-bold text-emerald-800">{profile.name}</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {profile.address}, {profile.city}, {profile.province} {profile.postalCode}
                </p>
                <p className="text-xs text-slate-600">
                  Kontak/WhatsApp: {profile.phone} | Email: {profile.email}
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                LAPORAN RESMI
              </span>
              <p className="text-xs text-slate-500 mt-2">
                Tgl Cetak: {formatIndonesianDate(new Date())}
              </p>
            </div>
          </div>

          {/* Title & Periode */}
          <div className="text-center my-5">
            <h3 className="text-lg font-black uppercase underline decoration-2 underline-offset-4">
              LAPORAN KEUANGAN & MUTASI KAS MASJID
            </h3>
            <p className="text-sm font-semibold text-slate-700 mt-1">Periode: {periodLabel}</p>
          </div>

          {/* Ringkasan Saldo Box */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="p-3 bg-slate-50 border rounded-lg">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Pemasukan</span>
              <p className="text-base font-extrabold text-emerald-700 font-mono-num mt-1">
                {formatRupiah(totalIn)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 border rounded-lg">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Pengeluaran</span>
              <p className="text-base font-extrabold text-rose-700 font-mono-num mt-1">
                {formatRupiah(totalOut)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 border rounded-lg">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Surplus Periode Ini</span>
              <p className={`text-base font-extrabold font-mono-num mt-1 ${netFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatRupiah(netFlow)}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase">Saldo Kas Keseluruhan</span>
              <p className="text-base font-black text-emerald-900 font-mono-num mt-1">
                {formatRupiah(totalAllAccountsBalance)}
              </p>
            </div>
          </div>

          {/* Detail Rekening */}
          <div className="mb-6">
            <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider mb-2">
              Posisi Saldo per Rekening & Kas
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-2 border rounded text-xs bg-slate-50">
                  <p className="font-bold text-slate-800 truncate">{acc.name}</p>
                  <p className="text-[10px] text-slate-500">{acc.bankName} - {acc.accountNumber}</p>
                  <p className="font-mono-num font-extrabold text-slate-900 mt-1">
                    {formatRupiah(acc.balance)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel Mutasi Transaksi */}
          <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider mb-2">
            Rincian Arus Transaksi ({filtered.length} transaksi)
          </h4>
          <table className="w-full text-left text-xs border-collapse border border-slate-300 mb-8">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold">
                <th className="border border-slate-300 p-2 w-8 text-center">No</th>
                <th className="border border-slate-300 p-2 w-24">Tanggal</th>
                <th className="border border-slate-300 p-2">Kategori & Uraian Transaksi</th>
                <th className="border border-slate-300 p-2 w-28">Rekening</th>
                <th className="border border-slate-300 p-2 w-28 text-right">Masuk (Rp)</th>
                <th className="border border-slate-300 p-2 w-28 text-right">Keluar (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, index) => {
                const acc = accounts.find((a) => a.id === t.accountId);
                return (
                  <tr key={t.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 p-2 text-center text-slate-500">{index + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono-num">{t.date}</td>
                    <td className="border border-slate-300 p-2">
                      <span className="font-bold text-slate-800">{t.category}</span>
                      <p className="text-slate-600 text-[11px]">{t.description}</p>
                      {t.receiptName && (
                        <span className="inline-block mt-0.5 text-[10px] text-emerald-700">
                          📎 Bukti: {t.receiptName} (Tersimpan di Google Drive)
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-300 p-2 text-[11px] text-slate-600">
                      {acc ? acc.name : '-'}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono-num font-semibold text-emerald-700">
                      {t.type === 'in' ? formatRupiah(t.amount) : '-'}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono-num font-semibold text-rose-700">
                      {t.type === 'out' ? formatRupiah(t.amount) : '-'}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-slate-500">
                    Tidak ada transaksi pada periode {periodLabel}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-200 font-bold">
                <td colSpan={4} className="border border-slate-300 p-2 text-right">
                  TOTAL KAS PERIODE INI
                </td>
                <td className="border border-slate-300 p-2 text-right font-mono-num text-emerald-800">
                  {formatRupiah(totalIn)}
                </td>
                <td className="border border-slate-300 p-2 text-right font-mono-num text-rose-800">
                  {formatRupiah(totalOut)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* AREA TANDA TANGAN RESMI PENGURUS */}
          <div className="grid grid-cols-3 gap-8 text-center text-xs mt-12 pt-4 border-t border-slate-200">
            <div>
              <p className="text-slate-500 mb-14">Mengetahui,<br /><strong>Ketua Takmir Masjid</strong></p>
              <p className="font-bold underline text-slate-900">{profile.ketuaTakmir}</p>
              <p className="text-[11px] text-slate-500">NIP/ID: TKM-01</p>
            </div>

            <div>
              <p className="text-slate-500 mb-14">Menyetujui,<br /><strong>Sekretaris DKM</strong></p>
              <p className="font-bold underline text-slate-900">{profile.sekretaris}</p>
              <p className="text-[11px] text-slate-500">NIP/ID: SKR-02</p>
            </div>

            <div>
              <p className="text-slate-500 mb-14">
                {profile.city}, {formatIndonesianDate(new Date())}<br />
                <strong>Bendahara Masjid</strong>
              </p>
              <p className="font-bold underline text-slate-900">{profile.bendahara}</p>
              <p className="text-[11px] text-slate-500">NIP/ID: BDH-03</p>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400">
            Dokumen ini dicetak otomatis dari Aplikasi Manajemen Kas & Mading Digital {profile.name} • Data transparan & tersimpan aman di Google Drive resmi masjid.
          </div>
        </div>
      </div>
    </div>
  );
};
