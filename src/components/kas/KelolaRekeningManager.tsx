import React, { useState } from 'react';
import {
  CreditCard,
  PlusCircle,
  ArrowRightLeft,
  Edit2,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Building,
  Trash2,
  Check,
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { BankAccount, Transaction, UserAccount } from '../../types';
import { formatRupiah, appStorage } from '../../utils/storage';

interface KelolaRekeningManagerProps {
  accounts: BankAccount[];
  transactions: Transaction[];
  currentUser: UserAccount;
  onUpdateAccounts: (accounts: BankAccount[], transactions: Transaction[]) => void;
  onSelectAccountTab?: (accountId: string) => void;
}

export const KelolaRekeningManager: React.FC<KelolaRekeningManagerProps> = ({
  accounts,
  transactions,
  currentUser,
  onUpdateAccounts,
  onSelectAccountTab,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // Form add / edit state
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#10b981');
  const [isDefault, setIsDefault] = useState(false);

  // Form transfer state
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);

  // Delete & Warning modals
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
  const [cannotDeleteWarning, setCannotDeleteWarning] = useState<string | null>(null);

  const openAddModal = () => {
    setName('');
    setBankName('Bank Syariah Indonesia (BSI)');
    setAccountNumber('');
    setHolderName('DKM Masjid Nurul Ilmi');
    setBalance('0');
    setColor('#10b981');
    setIsDefault(false);
    setEditingAccount(null);
    setShowAddModal(true);
  };

  const openEditModal = (acc: BankAccount) => {
    setEditingAccount(acc);
    setName(acc.name);
    setBankName(acc.bankName);
    setAccountNumber(acc.accountNumber);
    setHolderName(acc.holderName);
    setBalance(acc.balance.toString());
    setColor(acc.color || '#10b981');
    setIsDefault(!!acc.isDefault);
    setShowAddModal(true);
  };

  const handleDeleteAccount = (acc: BankAccount) => {
    if (accounts.length <= 1) {
      setCannotDeleteWarning('Tidak dapat menghapus rekening. Sistem masjid minimal harus memiliki 1 rekening buku kas aktif.');
      return;
    }
    setAccountToDelete(acc);
  };

  const executeDeleteAccount = (acc: BankAccount) => {
    let updated = accounts.filter((a) => a.id !== acc.id);
    if (acc.isDefault && updated.length > 0) {
      updated = updated.map((a, idx) => ({ ...a, isDefault: idx === 0 }));
    }

    // Reassign any transactions from this account to the remaining default account
    const defaultAcc = updated.find((a) => a.isDefault) || updated[0];
    const updatedTransactions = transactions.map((t) => {
      if (t.accountId === acc.id && defaultAcc) {
        return { ...t, accountId: defaultAcc.id };
      }
      return t;
    });

    onUpdateAccounts(updated, updatedTransactions);
    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Hapus Rekening Kas',
      details: `Menghapus rekening kas ${acc.name} (${acc.bankName} - No: ${acc.accountNumber})`,
      category: 'kas',
    });

    setAccountToDelete(null);
    setShowAddModal(false);
    setEditingAccount(null);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(balance.replace(/[^0-9]/g, '')) || 0;

    if (editingAccount) {
      const updated = accounts.map((a) => {
        if (a.id === editingAccount.id) {
          return {
            ...a,
            name,
            bankName,
            accountNumber,
            holderName,
            balance: balanceNum,
            color,
            isDefault: isDefault ? true : (a.isDefault && !isDefault ? false : a.isDefault),
          };
        }
        // If this one is set as default, remove default from others
        return isDefault ? { ...a, isDefault: false } : a;
      });
      onUpdateAccounts(updated, transactions);
      appStorage.addAuditLog({
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Edit Rekening Kas',
        details: `Memperbarui data rekening: ${name} (${bankName}) saldo: ${formatRupiah(balanceNum)}`,
        category: 'kas',
      });
    } else {
      const newAcc: BankAccount = {
        id: 'acc-' + Date.now(),
        name,
        bankName,
        accountNumber,
        holderName,
        balance: balanceNum,
        color,
        isDefault: isDefault || accounts.length === 0,
      };
      const updated = isDefault
        ? [...accounts.map((a) => ({ ...a, isDefault: false })), newAcc]
        : [...accounts, newAcc];

      onUpdateAccounts(updated, transactions);
      appStorage.addAuditLog({
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Tambah Rekening Kas',
        details: `Menambahkan rekening kas baru: ${name} (${bankName}) dengan saldo awal ${formatRupiah(balanceNum)}`,
        category: 'kas',
      });
    }

    setShowAddModal(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    const amountNum = parseFloat(transferAmount.replace(/[^0-9]/g, ''));
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      setTransferError('Masukkan nominal transfer yang valid');
      return;
    }

    if (fromAccountId === toAccountId) {
      setTransferError('Rekening asal dan tujuan tidak boleh sama');
      return;
    }

    const sourceAcc = accounts.find((a) => a.id === fromAccountId);
    const destAcc = accounts.find((a) => a.id === toAccountId);

    if (!sourceAcc || !destAcc) return;

    if (sourceAcc.balance < amountNum) {
      setTransferError(`Saldo ${sourceAcc.name} (${formatRupiah(sourceAcc.balance)}) tidak mencukupi untuk transfer ${formatRupiah(amountNum)}`);
      return;
    }

    const dateStr = new Date().toISOString().slice(0, 10);

    // Create 2 transaction records: 1 out from source, 1 in to dest
    const outTrx: Transaction = {
      id: 'trx-trf-out-' + Date.now(),
      date: dateStr,
      type: 'out',
      amount: amountNum,
      accountId: sourceAcc.id,
      category: 'Transfer Antar Kas',
      description: `Transfer keluar ke ${destAcc.name}. ${transferNotes ? `Ket: ${transferNotes}` : ''}`,
      recordedBy: currentUser.name,
      userRole: currentUser.role,
    };

    const inTrx: Transaction = {
      id: 'trx-trf-in-' + Date.now(),
      date: dateStr,
      type: 'in',
      amount: amountNum,
      accountId: destAcc.id,
      category: 'Transfer Antar Kas',
      description: `Transfer masuk dari ${sourceAcc.name}. ${transferNotes ? `Ket: ${transferNotes}` : ''}`,
      recordedBy: currentUser.name,
      userRole: currentUser.role,
    };

    const updatedAccounts = accounts.map((a) => {
      if (a.id === sourceAcc.id) {
        return { ...a, balance: a.balance - amountNum };
      }
      if (a.id === destAcc.id) {
        return { ...a, balance: a.balance + amountNum };
      }
      return a;
    });

    const updatedTransactions = [outTrx, inTrx, ...transactions];
    onUpdateAccounts(updatedAccounts, updatedTransactions);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Transfer Kas Antar Rekening',
      details: `Transfer ${formatRupiah(amountNum)} dari ${sourceAcc.name} ke ${destAcc.name}`,
      category: 'kas',
    });

    setTransferAmount('');
    setTransferNotes('');
    setTransferError(null);
    setShowTransferModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Kelola Rekening & Buku Kas
            </h1>
            <p className="text-xs text-slate-500">
              Pengaturan rekening bank syariah, kas tunai tromol, dan mutasi saldo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            <span>Transfer Antar Rekening</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Rekening Baru</span>
          </button>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => {
          const accTrxCount = transactions.filter((t) => t.accountId === acc.id).length;
          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all space-y-4 relative"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: acc.color || '#10b981' }}
                  >
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      {acc.name}
                      {acc.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          Utama
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {acc.bankName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(acc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit Data Rekening"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {accounts.length > 1 && (
                    <button
                      onClick={() => handleDeleteAccount(acc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Rekening Kas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nomor Rekening:</span>
                  <strong className="text-slate-800">{acc.accountNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Atas Nama:</span>
                  <strong className="text-slate-800">{acc.holderName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Transaksi:</span>
                  <span>{accTrxCount} catatan</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Saldo Aktif
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {formatRupiah(acc.balance)}
                  </div>
                </div>

                {onSelectAccountTab && (
                  <button
                    onClick={() => onSelectAccountTab(acc.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-700 font-semibold text-xs transition-all"
                  >
                    Buka Buku Kas →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-800">
              {editingAccount ? 'Edit Data Rekening' : 'Tambah Rekening Kas Baru'}
            </h3>

            <form onSubmit={handleSaveAccount} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Buku Kas / Rekening
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rekening Utama / Kas Renovasi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Bank / Tempat Penyimpanan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank Syariah Indonesia (BSI) / Brankas Tunai"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="7123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Atas Nama Rekening
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Atas nama pemegang rekening"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Saldo Kas (Rp)
                </label>
                <input
                  type="text"
                  required
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Warna Identitas Buku Kas
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { color: '#10b981', label: 'Emerald' },
                    { color: '#f59e0b', label: 'Amber' },
                    { color: '#0284c7', label: 'Sky' },
                    { color: '#6366f1', label: 'Indigo' },
                    { color: '#8b5cf6', label: 'Purple' },
                    { color: '#ec4899', label: 'Rose' },
                    { color: '#14b8a6', label: 'Teal' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setColor(c.color)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                        color === c.color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    >
                      {color === c.color && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-xs text-slate-700 hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <div>
                  <span className="font-semibold block">Jadikan Rekening Kas Utama (Default)</span>
                  <span className="text-[11px] text-slate-500">Otomatis dipilih sebagai kas standar pada saat pencatatan transaksi</span>
                </div>
              </label>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {editingAccount ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteAccount(editingAccount)}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                  >
                    Simpan Rekening
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              Transfer Kas Antar Rekening
            </h3>
            <p className="text-xs text-slate-500">
              Pindahkan saldo antara rekening bank dan kas tunai tromol secara otomatis.
            </p>

            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dari Rekening (Sumber)
                </label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — Saldo: {formatRupiah(a.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ke Rekening (Tujuan)
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — Saldo: {formatRupiah(a.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Transfer (Rp)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 5.000.000"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Keperluan Transfer
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Setor uang tromol jumat ke rekening bank BSI"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Proses Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WARNING MODAL: MINIMAL 1 REKENING */}
      {cannotDeleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Perhatian</h4>
              <p className="text-xs text-slate-600 mt-1">{cannotDeleteWarning}</p>
            </div>
            <button
              onClick={() => setCannotDeleteWarning(null)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ACCOUNT MODAL */}
      <DeleteConfirmModal
        isOpen={!!accountToDelete}
        title="Hapus Buku Rekening Kas"
        message={
          accountToDelete ? (
            <div>
              Apakah Anda yakin ingin menghapus rekening{' '}
              <strong>"{accountToDelete.name}"</strong>?
              {transactions.filter((t) => t.accountId === accountToDelete.id).length > 0 && (
                <p className="mt-2 text-rose-600 font-semibold">
                  Terdapat {transactions.filter((t) => t.accountId === accountToDelete.id).length} mutasi
                  kas pada rekening ini yang akan otomatis dipindahkan ke rekening kas utama agar riwayat pembukuan tetap terjaga.
                </p>
              )}
            </div>
          ) : (
            ''
          )
        }
        itemDetails={
          accountToDelete
            ? [
                { label: 'Nama Rekening', value: accountToDelete.name },
                { label: 'Bank', value: accountToDelete.bankName },
                { label: 'Nomor Rekening', value: accountToDelete.accountNumber },
                { label: 'Atas Nama', value: accountToDelete.holderName },
                { label: 'Saldo Saat Ini', value: formatRupiah(accountToDelete.balance) },
                {
                  label: 'Riwayat Mutasi',
                  value: `${transactions.filter((t) => t.accountId === accountToDelete.id).length} transaksi`,
                },
              ]
            : []
        }
        confirmLabel="Ya, Hapus Rekening"
        onConfirm={() => {
          if (accountToDelete) {
            executeDeleteAccount(accountToDelete);
          }
        }}
        onClose={() => setAccountToDelete(null)}
      />
    </div>
  );
};
