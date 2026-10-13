import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  MinusCircle,
  ArrowRightLeft,
  FileText,
  Search,
  Calendar,
  Eye,
  CheckCircle,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { BankAccount, Transaction, UserAccount, MosqueProfile } from '../../types';
import { formatRupiah, appStorage } from '../../utils/storage';

interface AccountDetailViewProps {
  account: BankAccount;
  allAccounts: BankAccount[];
  transactions: Transaction[];
  currentUser: UserAccount;
  profile: MosqueProfile;
  onUpdateTransactions: (transactions: Transaction[], accounts: BankAccount[]) => void;
  onOpenAddTrx?: (accountId: string, type: 'in' | 'out') => void;
  onOpenTransfer?: () => void;
}

export const AccountDetailView: React.FC<AccountDetailViewProps> = ({
  account,
  allAccounts,
  transactions,
  currentUser,
  profile,
  onUpdateTransactions,
  onOpenAddTrx,
  onOpenTransfer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'in' | 'out'>('all');
  const [previewReceipt, setPreviewReceipt] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const executeDeleteTransaction = (trx: Transaction) => {
    const updatedAccounts = allAccounts.map((acc) => {
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
      details: `Menghapus transaksi ${trx.category} (${trx.type === 'in' ? 'Pemasukan' : 'Pengeluaran'}) senilai ${formatRupiah(trx.amount)} dari rekening ${account.name}`,
      category: 'kas',
    });

    setTransactionToDelete(null);
  };

  // Filter transactions for this account
  const accountTransactions = transactions.filter((t) => t.accountId === account.id);

  const filtered = accountTransactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.recordedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === 'all' || t.type === selectedType;
    return matchSearch && matchType;
  });

  const totalIn = accountTransactions
    .filter((t) => t.type === 'in')
    .reduce((s, t) => s + t.amount, 0);

  const totalOut = accountTransactions
    .filter((t) => t.type === 'out')
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Account Hero Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
              style={{ backgroundColor: account.color || '#10b981' }}
            >
              <Wallet className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {account.name}
                </h1>
                {account.isDefault && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                    Rekening Utama
                  </span>
                )}
              </div>

              <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  <strong>Bank:</strong> {account.bankName}
                </span>
                <span>•</span>
                <span>
                  <strong>No. Rek:</strong> {account.accountNumber}
                </span>
                <span>•</span>
                <span>
                  <strong>a.n:</strong> {account.holderName}
                </span>
              </div>
            </div>
          </div>

          <div className="md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Saldo Saat Ini
            </div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {formatRupiah(account.balance)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex md:justify-end gap-3">
              <span className="text-emerald-600 font-semibold">
                Masuk: +{formatRupiah(totalIn)}
              </span>
              <span className="text-rose-600 font-semibold">
                Keluar: -{formatRupiah(totalOut)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action buttons for this specific account */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          {onOpenAddTrx && (
            <>
              <button
                onClick={() => onOpenAddTrx(account.id, 'in')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Catat Pemasukan pada Rekening Ini</span>
              </button>

              <button
                onClick={() => onOpenAddTrx(account.id, 'out')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
              >
                <MinusCircle className="w-4 h-4" />
                <span>Catat Pengeluaran pada Rekening Ini</span>
              </button>
            </>
          )}

          {onOpenTransfer && (
            <button
              onClick={onOpenTransfer}
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              <span>Transfer Antar Rekening</span>
            </button>
          )}
        </div>
      </div>

      {/* Transaction List for this account */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Transaksi {account.name}
            </h3>
            <p className="text-xs text-slate-500">
              Total {filtered.length} transaksi tercatat pada buku kas ini
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari transaksi / nota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60"
              />
            </div>

            {/* Type filter */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedType('in')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedType === 'in'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setSelectedType('out')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  selectedType === 'out'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pengeluaran
              </button>
            </div>
          </div>
        </div>

        {/* Table of Transactions */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Tidak ada riwayat transaksi pada filter ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-3">Tanggal</th>
                  <th className="py-3 px-3">Kategori & Deskripsi</th>
                  <th className="py-3 px-3 text-right">Pemasukan</th>
                  <th className="py-3 px-3 text-right">Pengeluaran</th>
                  <th className="py-3 px-3">Pencatat</th>
                  <th className="py-3 px-3 text-center">Bukti Nota</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                      {t.date}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {t.category}
                      </div>
                      <div className="text-slate-500 text-[11px] line-clamp-1">
                        {t.description}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                      {t.type === 'in' ? `+${formatRupiah(t.amount)}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600 whitespace-nowrap">
                      {t.type === 'out' ? `-${formatRupiah(t.amount)}` : '-'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {t.recordedBy}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase">
                        {t.userRole}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {t.receiptUrl ? (
                        <button
                          onClick={() => setPreviewReceipt(t.receiptUrl!)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium inline-flex items-center gap-1 border border-emerald-200"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat</span>
                        </button>
                      ) : t.receiptName ? (
                        <span className="text-[11px] text-slate-400 italic">
                          {t.receiptName}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setTransactionToDelete(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Preview Bukti Nota */}
      {previewReceipt && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Bukti Transaksi Google Drive
              </h4>
              <button
                onClick={() => setPreviewReceipt(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            {previewReceipt && previewReceipt.trim() !== '' ? (
              <div className="p-4 bg-slate-100 flex items-center justify-center max-h-[70vh] overflow-auto">
                <img
                  src={previewReceipt}
                  alt="Nota Transaksi"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : null}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setPreviewReceipt(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE TRANSACTION MODAL */}
      <DeleteConfirmModal
        isOpen={!!transactionToDelete}
        title="Hapus Transaksi Kas"
        message={`Apakah Anda yakin ingin menghapus catatan transaksi ini dari rekening ${account.name}? Saldo rekening akan otomatis disesuaikan.`}
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
    </div>
  );
};
