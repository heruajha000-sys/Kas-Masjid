import React, { useState } from 'react';
import {
  HeartHandshake,
  Send,
  PlusCircle,
  CheckCircle2,
  Clock,
  Search,
  DollarSign,
  Users,
  CreditCard,
  FileSpreadsheet,
  AlertCircle,
  ChevronRight,
  Receipt,
  Trash2,
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  QurbanParticipant,
  QurbanType,
  PaymentStatus,
  MosqueProfile,
  UserAccount,
  BankAccount,
  Transaction,
} from '../../types';
import { formatRupiah, appStorage, exportToCSV } from '../../utils/storage';
import { createWhatsAppUrl, buildQurbanReceiptWaMessage } from '../../utils/whatsapp';

interface ManajemenQurbanProps {
  qurbanList: QurbanParticipant[];
  profile: MosqueProfile;
  currentUser: UserAccount;
  accounts: BankAccount[];
  transactions: Transaction[];
  onUpdateQurban: (list: QurbanParticipant[]) => void;
  onUpdateCash?: (transactions: Transaction[], accounts: BankAccount[]) => void;
}

export const ManajemenQurban: React.FC<ManajemenQurbanProps> = ({
  qurbanList,
  profile,
  currentUser,
  accounts,
  transactions,
  onUpdateQurban,
  onUpdateCash,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'sapi' | 'kambing'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'lunas' | 'cicilan'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentModalParticipant, setPaymentModalParticipant] = useState<QurbanParticipant | null>(null);
  const [participantToDelete, setParticipantToDelete] = useState<QurbanParticipant | null>(null);

  // Form State: Add Participant
  const [pType, setPType] = useState<QurbanType>('sapi');
  const [pGroupNumber, setPGroupNumber] = useState<number>(1);
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [pTargetAmount, setPTargetAmount] = useState<string>('3800000');
  const [pInitialPay, setPInitialPay] = useState<string>('2000000');
  const [pNotes, setPNotes] = useState('');

  // Form State: Installment Payment
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('Pembayaran Cicilan Lanjutan');

  const filtered = qurbanList.filter((q) => {
    const matchType = activeTab === 'all' || q.type === activeTab;
    const matchStatus = filterStatus === 'all' || q.paymentStatus === filterStatus;
    const matchSearch =
      q.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.phone.includes(searchTerm) ||
      q.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  // Aggregates
  const totalTarget = qurbanList.reduce((s, q) => s + q.targetAmount, 0);
  const totalCollected = qurbanList.reduce((s, q) => s + q.paidAmount, 0);
  const totalRemaining = Math.max(0, totalTarget - totalCollected);
  const sapiCount = qurbanList.filter((q) => q.type === 'sapi').length;
  const kambingCount = qurbanList.filter((q) => q.type === 'kambing').length;

  // Send WhatsApp Receipt
  const handleSendWaReceipt = (p: QurbanParticipant, recentAmountPaid?: number) => {
    const amountToMention = recentAmountPaid || p.paidAmount;
    const msg = buildQurbanReceiptWaMessage({
      mosqueName: profile.name,
      year: p.year,
      participantName: p.participantName,
      qurbanType: p.type,
      groupNumber: p.groupNumber,
      amountPaid: amountToMention,
      totalPaid: p.paidAmount,
      targetAmount: p.targetAmount,
      status: p.paymentStatus,
      treasurerName: profile.bendahara,
    });

    const url = createWhatsAppUrl(p.phone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Kirim Konfirmasi WA Qurban',
      details: `Mengirim bukti pembayaran qurban ke ${p.participantName} (${p.phone}) status ${p.paymentStatus}`,
      category: 'qurban',
    });
  };

  // Add Participant
  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(pTargetAmount.replace(/[^0-9]/g, ''));
    const initial = parseFloat(pInitialPay.replace(/[^0-9]/g, '')) || 0;

    const isLunas = initial >= target;

    const newParticipant: QurbanParticipant = {
      id: 'qrb-' + Date.now(),
      year: 2026,
      type: pType,
      groupNumber: pType === 'sapi' ? Number(pGroupNumber) : undefined,
      participantName: pName,
      phone: pPhone,
      address: pAddress,
      targetAmount: target,
      paidAmount: initial,
      paymentStatus: isLunas ? 'lunas' : 'cicilan',
      payments: initial > 0 ? [
        {
          id: 'pay-' + Date.now(),
          date: new Date().toISOString().slice(0, 10),
          amount: initial,
          note: isLunas ? 'Pembayaran Lunas Awal' : 'Uang Muka (DP) Qurban',
        }
      ] : [],
      notes: pNotes,
    };

    const updated = [newParticipant, ...qurbanList];
    onUpdateQurban(updated);

    // Also optionally record cashflow
    if (initial > 0 && onUpdateCash) {
      const defaultAcc = accounts[0];
      if (defaultAcc) {
        const trx: Transaction = {
          id: 'trx-qrb-' + Date.now(),
          date: new Date().toISOString().slice(0, 10),
          type: 'in',
          amount: initial,
          accountId: defaultAcc.id,
          category: 'Penerimaan Dana Qurban',
          description: `Pembayaran qurban ${pType} a.n ${pName}`,
          recordedBy: currentUser.name,
          userRole: currentUser.role,
          driveSynced: true,
        };
        const updatedAccounts = accounts.map((a) => (a.id === defaultAcc.id ? { ...a, balance: a.balance + initial } : a));
        onUpdateCash([trx, ...transactions], updatedAccounts);
      }
    }

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Tambah Peserta Qurban',
      details: `Mendaftarkan peserta ${pName} (${pType}) dengan setoran awal ${formatRupiah(initial)}`,
      category: 'qurban',
    });

    // Reset
    setPName('');
    setPPhone('');
    setPAddress('');
    setPNotes('');
    setShowAddModal(false);
  };

  // Submit Installment Payment
  const handleAddInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalParticipant) return;

    const amount = parseFloat(payAmount.replace(/[^0-9]/g, ''));
    if (!amount || isNaN(amount)) {
      alert('Masukkan nominal pembayaran cicilan yang valid');
      return;
    }

    const newTotalPaid = paymentModalParticipant.paidAmount + amount;
    const isLunas = newTotalPaid >= paymentModalParticipant.targetAmount;

    const updated = qurbanList.map((q) => {
      if (q.id === paymentModalParticipant.id) {
        return {
          ...q,
          paidAmount: newTotalPaid,
          paymentStatus: (isLunas ? 'lunas' : 'cicilan') as PaymentStatus,
          payments: [
            ...q.payments,
            {
              id: 'pay-' + Date.now(),
              date: new Date().toISOString().slice(0, 10),
              amount,
              note: payNote,
            },
          ],
        };
      }
      return q;
    });

    onUpdateQurban(updated);

    // Cashflow sync
    if (onUpdateCash) {
      const defaultAcc = accounts[0];
      if (defaultAcc) {
        const trx: Transaction = {
          id: 'trx-qrb-pay-' + Date.now(),
          date: new Date().toISOString().slice(0, 10),
          type: 'in',
          amount,
          accountId: defaultAcc.id,
          category: 'Penerimaan Dana Qurban',
          description: `Cicilan qurban ${paymentModalParticipant.participantName}`,
          recordedBy: currentUser.name,
          userRole: currentUser.role,
          driveSynced: true,
        };
        const updatedAccs = accounts.map((a) => (a.id === defaultAcc.id ? { ...a, balance: a.balance + amount } : a));
        onUpdateCash([trx, ...transactions], updatedAccs);
      }
    }

    const targetParticipant = updated.find((q) => q.id === paymentModalParticipant.id);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Setor Cicilan Qurban',
      details: `Menerima cicilan Rp ${amount} dari ${paymentModalParticipant.participantName}. Status: ${isLunas ? 'LUNAS' : 'CICILAN'}`,
      category: 'qurban',
    });

    if (targetParticipant && targetParticipant.phone) {
      handleSendWaReceipt(targetParticipant, amount);
    }

    setPayAmount('');
    setPaymentModalParticipant(null);
  };

  const handleDeleteParticipant = (id: string) => {
    const participant = qurbanList.find((q) => q.id === id);
    if (!participant) return;
    setParticipantToDelete(participant);
  };

  const executeDeleteParticipant = (participant: QurbanParticipant) => {
    const updated = qurbanList.filter((q) => q.id !== participant.id);
    onUpdateQurban(updated);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Hapus Peserta Qurban',
      details: `Menghapus peserta qurban ${participant.participantName} (${participant.type.toUpperCase()})`,
      category: 'qurban',
    });

    setParticipantToDelete(null);
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Tahun',
      'Jenis',
      'Kelompok',
      'Nama Peserta',
      'No WhatsApp',
      'Alamat',
      'Target Biaya',
      'Total Terbayar',
      'Sisa Tagihan',
      'Status Bayar',
      'Catatan',
    ];
    const rows = [
      [`REKAPITULASI PESERTA QURBAN ${profile.name.toUpperCase()}`],
      headers,
      ...filtered.map((q, idx) => [
        idx + 1,
        q.year,
        q.type === 'sapi' ? 'Sapi (1/7)' : 'Kambing',
        q.groupNumber ? `Kelompok ${q.groupNumber}` : '-',
        q.participantName,
        q.phone,
        q.address,
        q.targetAmount,
        q.paidAmount,
        Math.max(0, q.targetAmount - q.paidAmount),
        q.paymentStatus.toUpperCase(),
        q.notes || '-',
      ]),
    ];
    exportToCSV(`Peserta-Qurban-${profile.name.replace(/\s+/g, '_')}-2026.csv`, rows);
  };

  return (
    <div id="manajemen-qurban-module" className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Peserta Qurban</span>
          <div className="font-mono-num font-extrabold text-2xl text-emerald-400 mt-1">
            {qurbanList.length} <span className="text-xs text-slate-400 font-normal">Shohibul Qurban</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            🐮 {sapiCount} Sapi ({Math.ceil(sapiCount / 7)} ekor) • 🐐 {kambingCount} Kambing
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-slate-400 uppercase">Target Total Anggaran</span>
          <div className="font-mono-num font-extrabold text-2xl text-slate-100 mt-1">
            {formatRupiah(totalTarget)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Estimasi biaya pengadaan hewan</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-emerald-400 uppercase">Dana Terkumpul Masuk</span>
          <div className="font-mono-num font-extrabold text-2xl text-emerald-400 mt-1">
            {formatRupiah(totalCollected)}
          </div>
          <p className="text-[11px] text-emerald-500/80 mt-1">
            {totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0}% dari target
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs font-semibold text-amber-400 uppercase">Sisa Piutang / Cicilan</span>
          <div className="font-mono-num font-extrabold text-2xl text-amber-400 mt-1">
            {formatRupiah(totalRemaining)}
          </div>
          <p className="text-[11px] text-amber-500/80 mt-1">Sisa yang belum terlunasi</p>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab Filter */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveTab('sapi')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'sapi' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              🐮 Sapi Patungan (1/7)
            </button>
            <button
              onClick={() => setActiveTab('kambing')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'kambing' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              🐐 Kambing / Domba
            </button>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'lunas' | 'cicilan')}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Status Bayar</option>
            <option value="lunas">Hanya yang Lunas</option>
            <option value="cicilan">Hanya yang Masih Cicilan</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama / nomor WA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs"
            title="Download CSV Rekap"
          >
            <FileSpreadsheet className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Daftar Qurban Baru</span>
          </button>
        </div>
      </div>

      {/* Participants Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="p-3.5 w-12 text-center">No</th>
                <th className="p-3.5 w-36">Jenis & Kelompok</th>
                <th className="p-3.5">Nama Shohibul Qurban</th>
                <th className="p-3.5 w-32">WhatsApp</th>
                <th className="p-3.5 w-32 text-right">Target Biaya</th>
                <th className="p-3.5 w-32 text-right">Terbayar</th>
                <th className="p-3.5 w-28 text-center">Status</th>
                <th className="p-3.5 w-44 text-center">Aksi / Notifikasi WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((p, idx) => {
                const remaining = Math.max(0, p.targetAmount - p.paidAmount);
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-200">
                        {p.type === 'sapi' ? `🐮 Sapi (1/7)` : '🐐 Kambing'}
                      </span>
                      {p.groupNumber && (
                        <p className="text-[11px] text-emerald-400 font-semibold">
                          Kelompok {p.groupNumber}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-slate-200">
                      <p className="font-bold text-slate-100">{p.participantName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{p.address}</p>
                      {p.notes && (
                        <p className="text-[10px] text-amber-400 mt-0.5 italic">{p.notes}</p>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap">
                      {p.phone}
                    </td>
                    <td className="p-3.5 text-right font-mono-num font-semibold text-slate-300">
                      {formatRupiah(p.targetAmount)}
                    </td>
                    <td className="p-3.5 text-right font-mono-num font-bold text-emerald-400">
                      {formatRupiah(p.paidAmount)}
                      {remaining > 0 && (
                        <p className="text-[10px] text-amber-400 font-normal">
                          Sisa: {formatRupiah(remaining)}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          p.paymentStatus === 'lunas'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {p.paymentStatus === 'lunas' ? '✓ LUNAS' : '⏳ CICILAN'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* WA Notif Button */}
                        <button
                          onClick={() => handleSendWaReceipt(p)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow transition-colors"
                          title="Kirim bukti konfirmasi dan rincian pembayaran ke WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim WA</span>
                        </button>

                        {/* Pay Installment Button if not fully paid */}
                        {p.paymentStatus !== 'lunas' && (
                          <button
                            onClick={() => {
                              setPaymentModalParticipant(p);
                              setPayAmount(String(remaining));
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-[11px] font-semibold"
                            title="Catat cicilan masuk"
                          >
                            + Cicil
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteParticipant(p.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400"
                          title="Hapus Peserta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada data peserta qurban yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PARTICIPANT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h4 className="font-bold text-base text-white">Daftarkan Peserta Qurban Baru</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddParticipant} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tipe Qurban *</label>
                  <select
                    value={pType}
                    onChange={(e) => {
                      const t = e.target.value as QurbanType;
                      setPType(t);
                      setPTargetAmount(t === 'sapi' ? '3800000' : '3200000');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="sapi">Sapi Patungan (1/7)</option>
                    <option value="kambing">Kambing / Domba (Perorangan)</option>
                  </select>
                </div>

                {pType === 'sapi' && (
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Kelompok Sapi (1-10)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={pGroupNumber}
                      onChange={(e) => setPGroupNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nama Lengkap Shohibul Qurban *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Bambang Sulistyo & Keluarga"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081298765432"
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Alamat Tempat Tinggal</label>
                  <input
                    type="text"
                    placeholder="Contoh: RT 03/05 Komplek Madani"
                    value={pAddress}
                    onChange={(e) => setPAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Target Biaya Qurban (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={pTargetAmount}
                    onChange={(e) => setPTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono-num font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Setoran Awal (DP / Lunas)</label>
                  <input
                    type="number"
                    value={pInitialPay}
                    onChange={(e) => setPInitialPay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono-num font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Catatan / Permintaan Khusus</label>
                <input
                  type="text"
                  placeholder="Contoh: 1/3 bagian daging mohon dipotong dan diantar ke rumah"
                  value={pNotes}
                  onChange={(e) => setPNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow"
                >
                  Daftarkan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTALLMENT PAYMENT MODAL */}
      {paymentModalParticipant && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-base text-white">Catat Pembayaran Cicilan Qurban</h4>
                <p className="text-xs text-slate-400">{paymentModalParticipant.participantName}</p>
              </div>
              <button
                onClick={() => setPaymentModalParticipant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInstallment} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Total:</span>
                  <span className="font-bold">{formatRupiah(paymentModalParticipant.targetAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sudah Terbayar:</span>
                  <span className="font-bold text-emerald-400">{formatRupiah(paymentModalParticipant.paidAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1">
                  <span className="text-slate-400">Sisa Tagihan:</span>
                  <span className="font-bold text-amber-400">
                    {formatRupiah(Math.max(0, paymentModalParticipant.targetAmount - paymentModalParticipant.paidAmount))}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nominal Setoran Saat Ini (Rp) *</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono-num font-bold text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Keterangan Pembayaran</label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalParticipant(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow"
                >
                  Simpan & Kirim Bukti WA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE QURBAN PARTICIPANT MODAL */}
      <DeleteConfirmModal
        isOpen={!!participantToDelete}
        title="Hapus Peserta Qurban"
        message={
          participantToDelete ? (
            <span>
              Apakah Anda yakin ingin menghapus data peserta qurban{' '}
              <strong>"{participantToDelete.participantName}"</strong>?
            </span>
          ) : (
            ''
          )
        }
        itemDetails={
          participantToDelete
            ? [
                { label: 'Nama Peserta', value: participantToDelete.participantName },
                { label: 'Jenis Hewan', value: participantToDelete.type.toUpperCase() },
                { label: 'Tahun', value: participantToDelete.year },
                {
                  label: 'Kelompok',
                  value:
                    participantToDelete.type === 'sapi'
                      ? `Kelompok Sapi #${participantToDelete.groupNumber}`
                      : 'Perorangan',
                },
                { label: 'Target Biaya', value: formatRupiah(participantToDelete.targetAmount) },
                { label: 'Total Terbayar', value: formatRupiah(participantToDelete.paidAmount) },
                { label: 'Status', value: participantToDelete.paymentStatus.toUpperCase() },
              ]
            : []
        }
        confirmLabel="Ya, Hapus Peserta"
        onConfirm={() => {
          if (participantToDelete) {
            executeDeleteParticipant(participantToDelete);
          }
        }}
        onClose={() => setParticipantToDelete(null)}
      />
    </div>
  );
};
