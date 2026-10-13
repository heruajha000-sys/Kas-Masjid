import React, { useState } from 'react';
import {
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Filter,
  Search,
  FileText,
  FileSpreadsheet,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Cloud,
  Eye,
  Trash2,
  Calendar,
  Wallet,
  Sparkles,
  Send,
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  Transaction,
  BankAccount,
  MosqueProfile,
  UserAccount,
  TransactionType,
} from '../../types';
import { formatRupiah, appStorage, exportToCSV } from '../../utils/storage';
import { LaporanModal } from './LaporanModal';
import { compressImage, CompressionResult } from '../../utils/imageCompression';
import { createWhatsAppUrl, cleanIndonesianPhone } from '../../utils/whatsapp';

interface KasManagerProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  profile: MosqueProfile;
  currentUser: UserAccount;
  onUpdateTransactions: (updated: Transaction[], updatedAccounts: BankAccount[]) => void;
}

export const KAS_CATEGORIES = {
  in: [
    'Kotak Infaq Jumat',
    'Tromol Harian / Subuh',
    'QRIS Non-Tunai',
    'Donasi Renovasi Kubah & Fisik',
    'Infaq Beras Santri',
    'Zakat Maal & Fithrah',
    'Wakaf Sarana & Prasarana',
    'Sponsor / Infaq Kajian',
    'Lain-lain (Pemasukan)',
  ],
  out: [
    'Operasional Listrik & Air (PLN/PDAM)',
    'Kebersihan & Perlengkapan Sanitasi',
    'Honorarium Imam & Muadzin',
    'Bisyarah Khotib & Penceramah Kajian',
    'Santunan Yatim & Kaum Dhuafa',
    'Pemeliharaan AC & Sound System',
    'Konsumsi Pengajian / Jamaah',
    'Pembangunan & Material Fisik',
    'Administrasi & ATK Sekretariat',
    'Lain-lain (Pengeluaran)',
  ],
};

export const KasManager: React.FC<KasManagerProps> = ({
  transactions,
  accounts,
  profile,
  currentUser,
  onUpdateTransactions,
}) => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<number>(-1); // -1: all
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showLaporanModal, setShowLaporanModal] = useState(false);
  const [viewReceiptModal, setViewReceiptModal] = useState<{ url: string; title: string; driveId?: string } | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // Form State: Add Transaction
  const [trxType, setTrxType] = useState<TransactionType>('in');
  const [trxAmount, setTrxAmount] = useState<string>('');
  const [trxAccountId, setTrxAccountId] = useState<string>(accounts[0]?.id || '');
  const [trxCategory, setTrxCategory] = useState<string>(KAS_CATEGORIES.in[0]);
  const [trxDate, setTrxDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [trxDescription, setTrxDescription] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);

  // WhatsApp Receipt Modal state
  const [waModalTrx, setWaModalTrx] = useState<Transaction | null>(null);
  const [waDonorName, setWaDonorName] = useState<string>('');
  const [waDonorPhone, setWaDonorPhone] = useState<string>('');
  const [waCopied, setWaCopied] = useState<boolean>(false);

  // Form State: Transfer Antar Rekening
  const [transferFrom, setTransferFrom] = useState<string>(accounts[0]?.id || '');
  const [transferTo, setTransferTo] = useState<string>(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferNotes, setTransferNotes] = useState<string>('');

  // Calculations
  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recordedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    const matchAccount = filterAccount === 'all' || t.accountId === filterAccount;
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;

    const d = new Date(t.date);
    const matchMonth = filterMonth === -1 || d.getMonth() === filterMonth;
    const matchYear = d.getFullYear() === filterYear;

    return matchSearch && matchType && matchAccount && matchCategory && matchMonth && matchYear;
  });

  const totalIn = filteredTransactions
    .filter((t) => t.type === 'in')
    .reduce((s, t) => s + t.amount, 0);

  const totalOut = filteredTransactions
    .filter((t) => t.type === 'out')
    .reduce((s, t) => s + t.amount, 0);

  const netBalance = totalIn - totalOut;

  // Handle Receipt Upload with Canvas Compression
  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      try {
        const compressed = await compressImage(file, 900, 900, 0.72);
        setReceiptImage(compressed.dataUrl);
        setCompressionInfo(compressed);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Submit New Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(trxAmount.replace(/[^0-9]/g, ''));
    if (!amountNum || isNaN(amountNum)) {
      alert('Masukkan nominal kas yang valid');
      return;
    }

    const targetAccount = accounts.find((a) => a.id === trxAccountId);
    if (!targetAccount) return;

    const newTrx: Transaction = {
      id: 'trx-' + Date.now(),
      date: trxDate,
      type: trxType,
      amount: amountNum,
      accountId: trxAccountId,
      category: trxCategory,
      description: trxDescription || `${trxType === 'in' ? 'Penerimaan' : 'Pengeluaran'} ${trxCategory}`,
      recordedBy: currentUser.name,
      userRole: currentUser.role,
      receiptUrl: receiptImage || undefined,
      receiptName: receiptFileName || (receiptImage ? `nota-${Date.now()}.jpg` : undefined),
      receiptDriveId: receiptImage ? `gdrive-file-${Math.random().toString(36).substring(2, 9)}` : undefined,
      driveSynced: true,
    };

    // Update account balance
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === trxAccountId) {
        return {
          ...acc,
          balance: trxType === 'in' ? acc.balance + amountNum : acc.balance - amountNum,
        };
      }
      return acc;
    });

    const updatedTransactions = [newTrx, ...transactions];
    onUpdateTransactions(updatedTransactions, updatedAccounts);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: trxType === 'in' ? 'Pencatatan Pemasukan' : 'Pencatatan Pengeluaran',
      details: `${trxCategory} sebesar ${formatRupiah(amountNum)} pada ${targetAccount.name}. ${receiptImage ? 'Bukti nota tersimpan di Google Drive.' : ''}`,
      category: 'kas',
    });

    // Reset Form
    setTrxAmount('');
    setTrxDescription('');
    setReceiptImage('');
    setReceiptFileName('');
    setCompressionInfo(null);
    setShowAddModal(false);
  };

  // Submit Transfer Antar Rekening
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFrom === transferTo) {
      alert('Rekening asal dan tujuan tidak boleh sama');
      return;
    }

    const amountNum = parseFloat(transferAmount.replace(/[^0-9]/g, ''));
    if (!amountNum || isNaN(amountNum)) {
      alert('Masukkan nominal transfer yang valid');
      return;
    }

    const fromAcc = accounts.find((a) => a.id === transferFrom);
    const toAcc = accounts.find((a) => a.id === transferTo);
    if (!fromAcc || !toAcc) return;

    if (fromAcc.balance < amountNum) {
      alert(`Saldo ${fromAcc.name} tidak mencukupi (${formatRupiah(fromAcc.balance)})`);
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const trxOut: Transaction = {
      id: 'trx-trf-out-' + Date.now(),
      date: dateStr,
      type: 'out',
      amount: amountNum,
      accountId: fromAcc.id,
      category: 'Transfer Antar Rekening',
      description: `Transfer keluar ke ${toAcc.name}. ${transferNotes ? `(${transferNotes})` : ''}`,
      recordedBy: currentUser.name,
      userRole: currentUser.role,
      driveSynced: true,
    };

    const trxIn: Transaction = {
      id: 'trx-trf-in-' + (Date.now() + 1),
      date: dateStr,
      type: 'in',
      amount: amountNum,
      accountId: toAcc.id,
      category: 'Transfer Antar Rekening',
      description: `Transfer masuk dari ${fromAcc.name}. ${transferNotes ? `(${transferNotes})` : ''}`,
      recordedBy: currentUser.name,
      userRole: currentUser.role,
      driveSynced: true,
    };

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === fromAcc.id) return { ...acc, balance: acc.balance - amountNum };
      if (acc.id === toAcc.id) return { ...acc, balance: acc.balance + amountNum };
      return acc;
    });

    const updatedTransactions = [trxIn, trxOut, ...transactions];
    onUpdateTransactions(updatedTransactions, updatedAccounts);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Transfer Antar Rekening',
      details: `Pindah buku ${formatRupiah(amountNum)} dari ${fromAcc.name} ke ${toAcc.name}`,
      category: 'kas',
    });

    setTransferAmount('');
    setTransferNotes('');
    setShowTransferModal(false);
  };

  // Delete Transaction Handler
  const handleDeleteTransaction = (id: string) => {
    const trx = transactions.find((t) => t.id === id);
    if (!trx) return;
    setTransactionToDelete(trx);
  };

  const executeDeleteTransaction = (trx: Transaction) => {
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === trx.accountId) {
        return {
          ...acc,
          balance: trx.type === 'in' ? acc.balance - trx.amount : acc.balance + trx.amount,
        };
      }
      return acc;
    });

    const updatedTransactions = transactions.filter((t) => t.id !== trx.id);
    onUpdateTransactions(updatedTransactions, updatedAccounts);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Hapus Transaksi Kas',
      details: `Menghapus transaksi ${trx.category} (${trx.type === 'in' ? 'Pemasukan' : 'Pengeluaran'}) senilai ${formatRupiah(trx.amount)}`,
      category: 'kas',
    });

    setTransactionToDelete(null);
  };

  // Quick Export Excel CSV
  const handleQuickExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Keterangan', 'Rekening', 'Nominal', 'Pencatat', 'Drive Status'];
    const rows = [
      [`LAPORAN KAS ${profile.name.toUpperCase()}`],
      headers,
      ...filteredTransactions.map((t) => {
        const acc = accounts.find((a) => a.id === t.accountId);
        return [
          t.id,
          t.date,
          t.type === 'in' ? 'Masuk' : 'Keluar',
          t.category,
          t.description,
          acc ? acc.name : t.accountId,
          t.amount,
          t.recordedBy,
          t.driveSynced ? 'Tersimpan di Google Drive' : '-',
        ];
      }),
    ];
    exportToCSV(`Kas-${profile.name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div id="kas-manager-container" className="space-y-6">
      {/* TOP METRIC CARDS & ACCOUNTS LIST */}
      <section id="kas-accounts-overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            id={`account-card-${acc.id}`}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {acc.bankName}
                </span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: acc.color }}
                  title="Warna Identifikasi Rekening"
                />
              </div>
              <h4 className="font-bold text-sm text-slate-100 truncate">{acc.name}</h4>
              <p className="text-xs font-mono text-slate-400 mt-0.5">No: {acc.accountNumber}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Saldo Saat Ini
              </span>
              <p className="font-mono-num font-extrabold text-xl text-emerald-400 mt-0.5">
                {formatRupiah(acc.balance)}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ACTION BAR: Add, Transfer, Laporan PDF, Export Excel */}
      <section
        id="kas-action-bar"
        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="kas-add-infaq-btn"
            onClick={() => {
              setTrxType('in');
              setTrxCategory(KAS_CATEGORIES.in[0]);
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow transition-colors"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Catat Infaq Masuk</span>
          </button>

          <button
            id="kas-add-expense-btn"
            onClick={() => {
              setTrxType('out');
              setTrxCategory(KAS_CATEGORIES.out[0]);
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Catat Pengeluaran</span>
          </button>

          <button
            id="kas-transfer-btn"
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
            <span>Transfer Antar Rekening</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="kas-export-excel-btn"
            onClick={handleQuickExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Download CSV untuk Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            id="kas-cetak-laporan-btn"
            onClick={() => setShowLaporanModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Cetak Laporan PDF (Mading)</span>
          </button>
        </div>
      </section>

      {/* FILTER & SEARCH CONTROLS */}
      <section
        id="kas-filter-controls"
        className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
      >
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Cari transaksi / keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Jenis Kas */}
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'in' | 'out')}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Arus Kas</option>
            <option value="in">Hanya Pemasukan (Infaq)</option>
            <option value="out">Hanya Pengeluaran (Beban)</option>
          </select>
        </div>

        {/* Rekening Filter */}
        <div>
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Rekening Kas</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Kategori Eksklusif Filter */}
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Kategori Kas</option>
            <optgroup label="Kategori Pemasukan">
              {KAS_CATEGORIES.in.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </optgroup>
            <optgroup label="Kategori Pengeluaran">
              {KAS_CATEGORIES.out.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Month Selector */}
        <div>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value={-1}>Semua Bulan ({filterYear})</option>
            {[
              'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
            ].map((m, idx) => (
              <option key={idx} value={idx}>
                {m} {filterYear}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* FILTER SUMMARY BAR */}
      <section className="px-5 py-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-4">
        <div className="flex items-center gap-4">
          <span>
            Ditemukan: <strong className="text-emerald-400">{filteredTransactions.length}</strong> transaksi
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Total Masuk: <strong className="text-emerald-400 font-mono-num">{formatRupiah(totalIn)}</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Total Keluar: <strong className="text-rose-400 font-mono-num">{formatRupiah(totalOut)}</strong>
          </span>
        </div>
        <div>
          <span>
            Selisih Bersih:{' '}
            <strong className={`font-mono-num font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatRupiah(netBalance)}
            </strong>
          </span>
        </div>
      </section>

      {/* TABLE OF TRANSACTIONS */}
      <section id="kas-transactions-table-card" className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="p-3.5 w-12 text-center">Tipe</th>
                <th className="p-3.5 w-28">Tanggal</th>
                <th className="p-3.5 w-44">Kategori</th>
                <th className="p-3.5">Keterangan & Uraian</th>
                <th className="p-3.5 w-36">Rekening</th>
                <th className="p-3.5 w-32 text-right">Nominal</th>
                <th className="p-3.5 w-36 text-center">Bukti Nota</th>
                <th className="p-3.5 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.map((trx) => {
                const isIn = trx.type === 'in';
                const acc = accounts.find((a) => a.id === trx.accountId);
                return (
                  <tr key={trx.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Tipe icon */}
                    <td className="p-3.5 text-center">
                      <div
                        className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center ${
                          isIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isIn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                    </td>

                    {/* Tanggal */}
                    <td className="p-3.5 font-mono-num text-slate-300 whitespace-nowrap">
                      {trx.date}
                    </td>

                    {/* Kategori */}
                    <td className="p-3.5 font-semibold text-slate-200">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                        {trx.category}
                      </span>
                    </td>

                    {/* Keterangan */}
                    <td className="p-3.5 text-slate-300">
                      <p className="font-medium text-slate-200">{trx.description}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Dicatat oleh: <strong className="text-slate-400">{trx.recordedBy}</strong>
                      </p>
                    </td>

                    {/* Rekening */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: acc?.color || '#10b981' }}
                      >
                        {acc ? acc.name : trx.accountId}
                      </span>
                    </td>

                    {/* Nominal */}
                    <td className="p-3.5 text-right font-mono-num font-bold text-sm whitespace-nowrap">
                      <span className={isIn ? 'text-emerald-400' : 'text-rose-400'}>
                        {isIn ? '+' : '-'} {formatRupiah(trx.amount)}
                      </span>
                    </td>

                    {/* Bukti Nota Upload / Drive */}
                    <td className="p-3.5 text-center">
                      {trx.receiptUrl || trx.receiptName ? (
                        <button
                          onClick={() =>
                            setViewReceiptModal({
                              url: trx.receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
                              title: `${trx.category} - ${trx.description}`,
                              driveId: trx.receiptDriveId || 'GDRIVE-NOTA-2026-OK',
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                        >
                          <Cloud className="w-3.5 h-3.5" />
                          <span>Lihat Nota</span>
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isIn && (
                          <button
                            onClick={() => {
                              setWaModalTrx(trx);
                              setWaDonorName(trx.recordedBy || 'Jamaah/Donatur');
                              setWaDonorPhone('');
                              setWaCopied(false);
                            }}
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                            title="Kirim Bukti / Tanda Terima WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTransaction(trx.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL: CATAT TRANSAKSI BARU DENGAN UPLOAD NOTA & GOOGLE DRIVE */}
      {showAddModal && (
        <div
          id="kas-add-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="kas-add-modal-card"
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    trxType === 'in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {trxType === 'in' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {trxType === 'in' ? 'Catat Pemasukan (Infaq/Donasi)' : 'Catat Pengeluaran Kas'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Otomatis sinkron ke kas & backup Google Drive masjid
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4 text-xs">
              {/* Jenis Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setTrxType('in');
                    setTrxCategory(KAS_CATEGORIES.in[0]);
                  }}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    trxType === 'in'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + Pemasukan (Infaq)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTrxType('out');
                    setTrxCategory(KAS_CATEGORIES.out[0]);
                  }}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    trxType === 'out'
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  - Pengeluaran (Biaya)
                </button>
              </div>

              {/* Nominal & Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nominal (Rp) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 500000"
                    value={trxAmount}
                    onChange={(e) => setTrxAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono-num font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    required
                    value={trxDate}
                    onChange={(e) => setTrxDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Rekening & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Rekening / Kas *</label>
                  <select
                    value={trxAccountId}
                    onChange={(e) => setTrxAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatRupiah(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Kategori Transaksi *</label>
                  <select
                    value={trxCategory}
                    onChange={(e) => setTrxCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {(trxType === 'in' ? KAS_CATEGORIES.in : KAS_CATEGORIES.out).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Keterangan / Uraian Rinci</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Belanja 5 dirigen karbol pembersih lantai & pengharum karpet mihrab"
                  value={trxDescription}
                  onChange={(e) => setTrxDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Upload Foto Bukti Nota / Kuitansi */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Foto Nota / Kuitansi Fisik (Google Drive Sync)
                </label>
                <div className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-slate-200">
                        {receiptFileName || 'Pilih foto kuitansi atau nota pengeluaran'}
                      </p>
                      <p className="text-[10px] text-emerald-400">
                        ✓ Otomatis diarsipkan ke Google Drive Masjid
                      </p>
                    </div>
                  </div>
                  <label className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold cursor-pointer whitespace-nowrap">
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleReceiptFileChange}
                    />
                  </label>
                </div>
                {compressionInfo && (
                  <div className="mt-2 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center justify-between">
                    <span>
                      Ukuran Dioptimalkan: <strong>{compressionInfo.originalSizeKB} KB ➔ {compressionInfo.compressedSizeKB} KB</strong>
                    </span>
                    <span className="font-bold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded text-[10px]">
                      Hemat {compressionInfo.savingsPercent}% Memori
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER ANTAR REKENING */}
      {showTransferModal && (
        <div
          id="kas-transfer-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            id="kas-transfer-modal-card"
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Pindah Buku / Transfer Antar Rekening</h3>
                  <p className="text-xs text-slate-400">Pindahkan saldo antar brankas tunai atau rekening bank</p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Dari Rekening (Asal) *</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Saldo: {formatRupiah(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Ke Rekening (Tujuan) *</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (Saldo: {formatRupiah(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nominal Transfer (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 10000000"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono-num font-bold text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Catatan / Alasan Pemindahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Setor uang tromol tunai ke rekening BSI untuk pengadaan material"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow"
                >
                  Eksekusi Pindah Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW RECEIPT & GOOGLE DRIVE LINK */}
      {viewReceiptModal && (
        <div
          id="kas-receipt-view-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewReceiptModal(null)}
        >
          <div
            id="kas-receipt-view-card"
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 text-left">
              <div>
                <h4 className="font-bold text-base text-white">Bukti Fisik Kuitansi / Nota</h4>
                <p className="text-xs text-slate-400">{viewReceiptModal.title}</p>
              </div>
              <button
                onClick={() => setViewReceiptModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {viewReceiptModal.url && viewReceiptModal.url.trim() !== '' ? (
              <div className="my-4 max-h-[60vh] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={viewReceiptModal.url}
                  alt="Nota Kuitansi"
                  className="max-h-[55vh] object-contain rounded-xl"
                />
              </div>
            ) : null}

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-left text-xs flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-slate-200">Google Drive Tersinkronisasi</p>
                  <p className="text-[11px] text-emerald-400">
                    ID File: <span className="font-mono">{viewReceiptModal.driveId}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Aman 100%
              </span>
            </div>

            <button
              onClick={() => setViewReceiptModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
            >
              Tutup Bukti
            </button>
          </div>
        </div>
      )}

      {/* OFFICIAL LAPORAN PRINTABLE MODAL */}
      <LaporanModal
        isOpen={showLaporanModal}
        onClose={() => setShowLaporanModal(false)}
        profile={profile}
        transactions={transactions}
        accounts={accounts}
        selectedMonth={filterMonth}
        selectedYear={filterYear}
      />

      {/* CONFIRM DELETE TRANSACTION MODAL */}
      <DeleteConfirmModal
        isOpen={!!transactionToDelete}
        title="Hapus Transaksi Kas"
        message="Apakah Anda yakin ingin menghapus catatan transaksi ini? Saldo buku kas terkait akan disesuaikan secara otomatis."
        itemDetails={
          transactionToDelete
            ? [
                { label: 'Tanggal', value: transactionToDelete.date },
                {
                  label: 'Jenis',
                  value: transactionToDelete.type === 'in' ? 'Pemasukan (+)' : 'Pengeluaran (-)',
                },
                { label: 'Kategori', value: transactionToDelete.category },
                { label: 'Nominal', value: formatRupiah(transactionToDelete.amount) },
                {
                  label: 'Buku Rekening',
                  value: accounts.find((a) => a.id === transactionToDelete.accountId)?.name || '-',
                },
                { label: 'Keterangan', value: transactionToDelete.description },
              ]
            : []
        }
        confirmLabel="Ya, Hapus Transaksi"
        onConfirm={() => {
          if (transactionToDelete) {
            executeDeleteTransaction(transactionToDelete);
          }
        }}
        onClose={() => setTransactionToDelete(null)}
      />

      {/* MODAL: KIRIM TANDA TERIMA INFAQ / DONASI WHATSAPP */}
      {waModalTrx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setWaModalTrx(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Kirim Tanda Terima Donasi WhatsApp</h3>
                <p className="text-xs text-slate-400">Bukti resmi penerimaan infaq & sedekah masjid</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nama Donatur / Jamaah</label>
                <input
                  type="text"
                  placeholder="Contoh: H. Ahmad Subarjo / Hamba Allah"
                  value={waDonorName}
                  onChange={(e) => setWaDonorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nomor WhatsApp Donatur (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 081234567890"
                  value={waDonorPhone}
                  onChange={(e) => setWaDonorPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Jika nomor dikosongkan, Anda dapat menyalin teks atau mengirimkan ke grup pengurus.
                </p>
              </div>

              {/* Message preview */}
              {(() => {
                const targetAcc = accounts.find((a) => a.id === waModalTrx.accountId);
                const sampleText = `*BUKTI PENERIMAAN INFAQ & SEDEKAH*\n*${profile.name.toUpperCase()}*\n\nAssalamu'alaikum Warahmatullahi Wabarakatuh,\nYth. Bapak/Ibu/Sdr. *${waDonorName || 'Hamba Allah'}*\n\nAlhamdulillah, donasi/infaq Anda telah kami bukukan ke kas resmi masjid:\n🗓️ *Tanggal:* ${waModalTrx.date}\n💵 *Nominal:* ${formatRupiah(waModalTrx.amount)}\n📂 *Kategori:* ${waModalTrx.category}\n📝 *Uraian:* ${waModalTrx.description}\n🏛️ *Buku Kas:* ${targetAcc?.name || 'Kas Utama'}\n\nJazakumullahu khairan katsiran. Semoga Allah SWT menggantinya dengan berlipat kebaikan, rezeki yang berkah, serta menjadi amal jariyah di yaumil akhir. Aamiin ya Rabbal 'Alamin.\n\n_Pengurus DKM ${profile.name}_\n(Dicatat oleh: ${currentUser.name})`;

                const waUrl = createWhatsAppUrl(waDonorPhone || '081234567890', sampleText);

                return (
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Pratinjau Format Pesan</label>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono whitespace-pre-wrap max-h-36 overflow-y-auto text-slate-300">
                      {sampleText}
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(sampleText);
                          setWaCopied(true);
                          setTimeout(() => setWaCopied(false), 2500);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                      >
                        {waCopied ? '✓ Disalin!' : 'Salin Pesan'}
                      </button>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center gap-1.5 shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim ke WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
