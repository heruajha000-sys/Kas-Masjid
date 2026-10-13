import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  Copy,
  CheckCircle2,
  Calendar,
  Wallet,
  Package,
  HeartHandshake,
  ExternalLink,
  Users,
} from 'lucide-react';
import {
  MosqueProfile,
  DutySchedule,
  BankAccount,
  Transaction,
  AssetLoan,
  QurbanParticipant,
  UserAccount,
} from '../../types';
import { formatRupiah } from '../../utils/storage';
import {
  createWhatsAppUrl,
  cleanIndonesianPhone,
  buildDutyReminderWaMessage,
  buildAssetLoanWaMessage,
  buildQurbanReceiptWaMessage,
} from '../../utils/whatsapp';

interface WhatsAppHubProps {
  profile: MosqueProfile;
  duties: DutySchedule[];
  accounts: BankAccount[];
  transactions: Transaction[];
  loans: AssetLoan[];
  qurbanList: QurbanParticipant[];
  currentUser: UserAccount;
}

export const WhatsAppHub: React.FC<WhatsAppHubProps> = ({
  profile,
  duties,
  accounts,
  transactions,
  loans,
  qurbanList,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'kas' | 'aset' | 'qurban'>('jadwal');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Weekly Cash Summary Generator
  const totalSaldo = accounts.reduce((sum, a) => sum + a.balance, 0);
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentTrx = transactions.filter((t) => new Date(t.date) >= oneWeekAgo);
  const weekIn = recentTrx.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const weekOut = recentTrx.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);

  const [kasGroupPhone, setKasGroupPhone] = useState('');

  const weeklyKasMessage = `*LAPORAN KEUANGAN KAS MASJID MINGGUAN*
*${profile.name.toUpperCase()}*
Periode: ${oneWeekAgo.toISOString().slice(0, 10)} s/d ${now.toISOString().slice(0, 10)}

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Berikut rangkuman mutasi kas DKM:

📈 *Pemasukan (7 Hari Terakhir):* ${formatRupiah(weekIn)}
📉 *Pengeluaran (7 Hari Terakhir):* ${formatRupiah(weekOut)}
🏛️ *Total Saldo Kas Terkini:* ${formatRupiah(totalSaldo)}

*Rincian Saldo Rekening:*
${accounts.map((a) => `• ${a.name}: ${formatRupiah(a.balance)}`).join('\n')}

Laporan ini disampaikan sebagai wujud transparansi amanah umat. Semoga Allah memberkahi para donatur dan jamaah sekalian.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Pengurus Takmir ${profile.name}_
(Narahubung: ${currentUser.name} - ${currentUser.phone || profile.phone})`;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Pusat Notifikasi & Generator WhatsApp</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                Otomatisasi Siap Pakai
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kirim pengingat petugas Jumat, laporan kas berkala, slip qurban, dan konfirmasi pinjam barang langsung ke WhatsApp
            </p>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold self-start md:self-auto">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'jadwal' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Jadwal Jumat</span>
          </button>
          <button
            onClick={() => setActiveTab('kas')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'kas' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Laporan Kas</span>
          </button>
          <button
            onClick={() => setActiveTab('aset')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'aset' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Pinjam Aset</span>
          </button>
          <button
            onClick={() => setActiveTab('qurban')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'qurban' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Qurban</span>
          </button>
        </div>
      </div>

      {/* TAB 1: JADWAL JUMAT & IMAM */}
      {activeTab === 'jadwal' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-1">
              Pengingat Amanah Petugas Sholat & Khutbah Jumat
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Pesan terformat otomatis memuat tanggal, khatib, imam, muadzin, dan tema khutbah.
            </p>

            <div className="space-y-3">
              {duties.slice(0, 5).map((d) => {
                const text = buildDutyReminderWaMessage({
                  mosqueName: profile.name,
                  dutyType: d.type,
                  date: d.date,
                  officerName: d.khatib || d.imam,
                  role: d.khatib ? `Khatib: ${d.khatib} | Imam: ${d.imam}` : `Imam: ${d.imam}`,
                  theme: d.theme,
                  contactPerson: `${currentUser.name} (${currentUser.phone || profile.phone})`,
                });
                const waUrl = createWhatsAppUrl(d.phone || '081234567890', text);

                return (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{d.type} - {d.date}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                          {d.phone || 'No. HP belum diatur'}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">
                        Khatib: <strong>{d.khatib || '-'}</strong> | Imam: <strong>{d.imam}</strong> | Muadzin: <strong>{d.muadzin}</strong>
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Tema: {d.theme || '-'}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(d.id, text)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        {copiedId === d.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === d.id ? 'Tersalin' : 'Salin Pesan'}</span>
                      </button>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </a>
                    </div>
                  </div>
                );
              })}

              {duties.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Belum ada jadwal tugas terdaftar di menu Jadwal Imam & Khatib.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAPORAN KAS MINGGUAN */}
      {activeTab === 'kas' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-1">
              Laporan Ringkasan Kas Mingguan untuk Grup WhatsApp Jamaah
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Rangkuman mutasi kas 7 hari terakhir beserta saldo seluruh rekening kas secara transparan.
            </p>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] whitespace-pre-wrap max-h-60 overflow-y-auto mb-4 border border-slate-800">
              {weeklyKasMessage}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
                <input
                  type="text"
                  placeholder="No. HP / Kontak Tujuan (opsional)"
                  value={kasGroupPhone}
                  onChange={(e) => setKasGroupPhone(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-emerald-500 text-xs w-full sm:w-64"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => handleCopy('weekly-kas', weeklyKasMessage)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
                >
                  {copiedId === 'weekly-kas' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedId === 'weekly-kas' ? 'Tersalin' : 'Salin Laporan'}</span>
                </button>

                <a
                  href={createWhatsAppUrl(kasGroupPhone || '081234567890', weeklyKasMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim ke WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PINJAM ASET & REMINDER */}
      {activeTab === 'aset' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-1">
              Pengingat Jatuh Tempo & Tanda Bukti Peminjaman Sarana
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Kirimkan pengingat ramah kepada peminjam barang masjid yang mendekati atau melewati batas waktu pengembalian.
            </p>

            <div className="space-y-3 text-xs">
              {loans.map((loan) => {
                const text = buildAssetLoanWaMessage({
                  mosqueName: profile.name,
                  borrowerName: loan.borrowerName,
                  assetName: loan.assetName,
                  quantity: loan.quantity,
                  borrowDate: loan.borrowDate,
                  expectedReturnDate: loan.expectedReturnDate,
                  status: loan.status === 'dipinjam' ? 'reminder' : 'kembali',
                  adminName: currentUser.name,
                });
                const waUrl = createWhatsAppUrl(loan.borrowerPhone, text);

                return (
                  <div
                    key={loan.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{loan.borrowerName}</span>
                        <span className="text-slate-500 font-mono">({loan.borrowerPhone})</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            loan.status === 'dipinjam'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {loan.status === 'dipinjam' ? '⏳ Dipinjam' : '✓ Kembali'}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Barang: <strong>{loan.assetName}</strong> ({loan.quantity} unit) | Batas Kembali:{' '}
                        <strong className="text-amber-600">{loan.expectedReturnDate}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(loan.id, text)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5"
                      >
                        {copiedId === loan.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Salin</span>
                      </button>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </a>
                    </div>
                  </div>
                );
              })}

              {loans.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  Tidak ada catatan peminjaman aset saat ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QURBAN */}
      {activeTab === 'qurban' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 mb-1">
              Konfirmasi & Slip Bukti Pembayaran Qurban
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Kirimkan bukti tanda terima cicilan atau pelunasan hewan qurban kepada shohibul qurban.
            </p>

            <div className="space-y-3 text-xs">
              {qurbanList.slice(0, 8).map((q) => {
                const text = buildQurbanReceiptWaMessage({
                  mosqueName: profile.name,
                  year: q.year || new Date().getFullYear(),
                  participantName: q.participantName,
                  qurbanType: q.type,
                  groupNumber: q.groupNumber,
                  amountPaid: q.paidAmount,
                  totalPaid: q.paidAmount,
                  targetAmount: q.targetAmount,
                  status: q.paymentStatus,
                  treasurerName: currentUser.name,
                });
                const waUrl = createWhatsAppUrl(q.phone || '081234567890', text);

                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900">{q.participantName}</span>
                        <span className="text-slate-500 font-mono">({q.phone || '-'})</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            q.paymentStatus === 'lunas'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {q.paymentStatus === 'lunas' ? '✓ Lunas' : '⏳ Cicilan'}
                        </span>
                      </div>
                      <p className="text-slate-600">
                        {q.type === 'sapi' ? `Sapi (Kelompok ${q.groupNumber || 1})` : 'Kambing'} | Terbayar:{' '}
                        <strong>{formatRupiah(q.paidAmount)}</strong> dari target{' '}
                        <strong>{formatRupiah(q.targetAmount)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(q.id, text)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1.5"
                      >
                        {copiedId === q.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Salin</span>
                      </button>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim WA</span>
                      </a>
                    </div>
                  </div>
                );
              })}

              {qurbanList.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  Belum ada peserta qurban terdaftar.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
