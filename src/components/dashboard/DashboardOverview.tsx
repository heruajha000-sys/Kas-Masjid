import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PlusCircle,
  MinusCircle,
  ArrowRightLeft,
  Package,
  Calendar,
  Tv,
  ArrowUpRight,
  Clock,
  FileText,
  ShieldCheck,
  Users,
  Settings,
  Shield,
  MessageCircle,
  HardDrive,
} from 'lucide-react';
import {
  BankAccount,
  Transaction,
  DutySchedule,
  MeetingRecord,
  MosqueProfile,
  UserAccount,
} from '../../types';
import { formatRupiah } from '../../utils/storage';
import { formatIndonesianDate, getHijriDate } from '../../utils/prayerTimes';

interface DashboardOverviewProps {
  profile: MosqueProfile;
  accounts: BankAccount[];
  transactions: Transaction[];
  duties: DutySchedule[];
  meetings: MeetingRecord[];
  currentUser: UserAccount;
  onNavigateTab: (tabKey: string) => void;
  onOpenAddTrx?: (type: 'in' | 'out') => void;
  onOpenTransfer?: () => void;
  onOpenTv: () => void;
  onOpenSettings?: (initialTab?: 'profile' | 'pengurus' | 'rekening' | 'drive' | 'password' | 'reset') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profile,
  accounts,
  transactions,
  duties,
  meetings,
  currentUser,
  onNavigateTab,
  onOpenAddTrx,
  onOpenTransfer,
  onOpenTv,
  onOpenSettings,
}) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filter transactions for this month
  const thisMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthIn = thisMonthTransactions
    .filter((t) => t.type === 'in')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthOut = thisMonthTransactions
    .filter((t) => t.type === 'out')
    .reduce((sum, t) => sum + t.amount, 0);

  const netMonth = monthIn - monthOut;

  // Account specific balances
  const totalBalanceAll = accounts.reduce((s, a) => s + a.balance, 0);
  const mainAccount = accounts.find((a) =>
    a.name.toLowerCase().includes('rekening utama')
  ) || accounts[0];
  const renovAccount = accounts.find((a) =>
    a.name.toLowerCase().includes('pembangunan')
  );

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  // Next Duty
  const nextDuty = duties[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-2xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-64 h-64 fill-current">
            <path d="M12 2C11.5 2 11 2.4 11 3V4.1C9.2 4.6 7.6 5.8 6.6 7.5L5.2 6.1C4.8 5.7 4.2 5.7 3.8 6.1C3.4 6.5 3.4 7.1 3.8 7.5L5 8.7C4.4 9.7 4 10.8 4 12V21C4 21.6 4.4 22 5 22H19C19.6 22 20 21.6 20 21V12C20 10.8 19.6 9.7 19 8.7L20.2 7.5C20.6 7.1 20.6 6.5 20.2 6.1C19.8 5.7 19.2 5.7 18.8 6.1L17.4 7.5C16.4 5.8 14.8 4.6 13 4.1V3C13 2.4 12.5 2 12 2ZM12 6C14.8 6 17 8.2 17 11V20H15V14C15 12.3 13.7 11 12 11C10.3 11 9 12.3 9 14V20H7V11C7 8.2 9.2 6 12 6ZM12 13C12.6 13 13 13.4 13 14V20H11V14C11 13.4 11.4 13 12 13Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
                Sistem Informasi Takmir
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-medium">
                Premium v3.0
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {profile.name || 'Masjid Nurul Ilmi'}
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              {profile.slogan || 'Pusat Ibadah, Kebajikan, dan Pembinaan Ummat'} • {profile.city || 'Jakarta'}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-emerald-200/90">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatIndonesianDate(currentDate)}
              </span>
              <span>•</span>
              <span className="text-amber-200 font-medium">
                {getHijriDate(currentDate)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenTv}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-950/20 flex items-center gap-2"
            >
              <Tv className="w-4 h-4" />
              <span>Buka Layar TV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Seluruh Kas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {formatRupiah(totalBalanceAll)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Tersebar di {accounts.length} rekening/tromol
          </div>
        </div>

        {/* Rekening Utama */}
        <div
          onClick={() => mainAccount && onNavigateTab(`rekening-${mainAccount.id}`)}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
              {mainAccount ? mainAccount.name : 'Rekening Utama'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {formatRupiah(mainAccount?.balance || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {mainAccount?.bankName} • {mainAccount?.accountNumber}
          </div>
        </div>

        {/* Pembangunan dan Renovasi */}
        <div
          onClick={() => renovAccount && onNavigateTab(`rekening-${renovAccount.id}`)}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
              Pembangunan & Renovasi
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">
            {formatRupiah(renovAccount?.balance || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            Dana Wakaf Infaq Fisik Bangunan
          </div>
        </div>

        {/* Arus Kas Bulan Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Arus Kas Bersih (Bulan Ini)
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                netMonth >= 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {netMonth >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <div
            className={`text-2xl font-bold tracking-tight ${
              netMonth >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {netMonth >= 0 ? `+${formatRupiah(netMonth)}` : formatRupiah(netMonth)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span className="text-emerald-600 font-medium">
              +{formatRupiah(monthIn)}
            </span>
            <span className="text-rose-600 font-medium">
              -{formatRupiah(monthOut)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
          Aksi Cepat Takmir
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <button
            onClick={() => onNavigateTab('riwayat-kas')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-100 transition-all text-center group"
          >
            <PlusCircle className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Catat Infaq</span>
          </button>

          <button
            onClick={() => onNavigateTab('riwayat-kas')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-800 border border-rose-100 transition-all text-center group"
          >
            <MinusCircle className="w-5 h-5 text-rose-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Catat Keluar</span>
          </button>

          <button
            onClick={() => onNavigateTab('kelola-rekening')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-800 border border-blue-100 transition-all text-center group"
          >
            <ArrowRightLeft className="w-5 h-5 text-blue-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Transfer Bank</span>
          </button>

          <button
            onClick={() => onNavigateTab('aset')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-100 transition-all text-center group"
          >
            <Package className="w-5 h-5 text-amber-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Inventaris</span>
          </button>

          <button
            onClick={() => onNavigateTab('jadwal')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-800 border border-purple-100 transition-all text-center group"
          >
            <Calendar className="w-5 h-5 text-purple-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Jadwal Sholat</span>
          </button>

          <button
            onClick={() => onNavigateTab('whatsapp-hub')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200 transition-all text-center group"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Kirim WA</span>
          </button>

          <button
            onClick={() => onNavigateTab('storage-health')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-50 hover:bg-cyan-100/80 text-cyan-800 border border-cyan-100 transition-all text-center group"
          >
            <HardDrive className="w-5 h-5 text-cyan-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Cadangan</span>
          </button>

          <button
            onClick={onOpenTv}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 transition-all text-center group"
          >
            <Tv className="w-5 h-5 text-slate-600 mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Layar TV</span>
          </button>
        </div>
      </div>

      {/* Grid: Recent Transactions & Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Transaksi Kas Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Transaksi Kas Terbaru
                </h3>
                <p className="text-xs text-slate-500">
                  Aktivitas pemasukan infaq dan pengeluaran operasional terakhir
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('riwayat-kas')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Lihat Semua
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentTransactions.length === 0 ? (
                <div className="py-8 px-4 text-center text-slate-400 text-xs">
                  <Wallet className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
                  <p className="font-semibold text-slate-600">Belum ada transaksi kas yang dicatat</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gunakan tombol "+ Pemasukan" atau "- Pengeluaran" di atas untuk memulai pencatatan kas masjid.
                  </p>
                </div>
              ) : (
                recentTransactions.map((trx) => {
                  const acc = accounts.find((a) => a.id === trx.accountId);
                  return (
                  <div
                    key={trx.id}
                    className="py-3 flex items-center justify-between gap-3 text-sm hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          trx.type === 'in'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {trx.type === 'in' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate text-xs sm:text-sm">
                          {trx.category}
                        </div>
                        <div className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                          <span>{trx.date}</span>
                          <span>•</span>
                          <span className="text-slate-500 font-medium">
                            {acc?.name || 'Kas Masjid'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-bold text-xs sm:text-sm ${
                          trx.type === 'in'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {trx.type === 'in' ? '+' : '-'}
                        {formatRupiah(trx.amount)}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                        {trx.receiptName && (
                          <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                            <FileText className="w-3 h-3" /> Nota
                          </span>
                        )}
                        <span>{trx.recordedBy.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Agenda Rapat & Petugas Terdekat */}
        <div className="space-y-6">
          {/* Petugas Sholat Jumat / Kajian */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Petugas Sholat Terdekat
              </h3>
              <button
                onClick={() => onNavigateTab('jadwal')}
                className="text-xs font-medium text-emerald-600 hover:underline"
              >
                Atur
              </button>
            </div>

            {nextDuty ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      {nextDuty.type}
                    </span>
                    <span className="text-slate-400">{nextDuty.date}</span>
                  </div>
                  <div className="text-slate-700 pt-1">
                    <span className="text-slate-400">Khatib: </span>
                    <strong className="text-slate-900">{nextDuty.khatib}</strong>
                  </div>
                  <div className="text-slate-700">
                    <span className="text-slate-400">Imam: </span>
                    <strong className="text-slate-900">{nextDuty.imam}</strong>
                  </div>
                  <div className="text-slate-700">
                    <span className="text-slate-400">Muadzin: </span>
                    <strong className="text-slate-900">{nextDuty.muadzin}</strong>
                  </div>
                  {nextDuty.theme && (
                    <div className="text-slate-500 italic text-[11px] pt-1 border-t border-slate-200/60">
                      &quot;{nextDuty.theme}&quot;
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Belum ada jadwal terdaftar.</p>
            )}
          </div>

          {/* Susunan Pengurus DKM Aktif */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Pengurus DKM Aktif
                </h3>
              </div>
              {onOpenSettings && (
                <button
                  onClick={() => onOpenSettings('pengurus')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                  title="Ubah nama pengurus, bendahara, sekretaris, sie keamanan, dll"
                >
                  <Settings className="w-3 h-3" />
                  <span>Ubah Nama</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Ketua Takmir:</span>
                <span className="font-bold text-slate-800 truncate ml-2 text-right">{profile.ketuaTakmir || '-'}</span>
              </div>
              {profile.wakilKetua && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Wakil Ketua:</span>
                  <span className="font-bold text-slate-800 truncate ml-2 text-right">{profile.wakilKetua}</span>
                </div>
              )}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Sekretaris:</span>
                <span className="font-bold text-slate-800 truncate ml-2 text-right">{profile.sekretaris || '-'}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-medium">Bendahara:</span>
                <span className="font-bold text-slate-800 truncate ml-2 text-right">{profile.bendahara || '-'}</span>
              </div>
              {profile.sieKeamanan && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Sie Keamanan:</span>
                  <span className="font-semibold text-slate-700 truncate ml-2 text-right">{profile.sieKeamanan}</span>
                </div>
              )}
              {profile.siePerlengkapan && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Sie Perlengkapan:</span>
                  <span className="font-semibold text-slate-700 truncate ml-2 text-right">{profile.siePerlengkapan}</span>
                </div>
              )}
              {profile.siePeribadatan && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Sie Peribadatan:</span>
                  <span className="font-semibold text-slate-700 truncate ml-2 text-right">{profile.siePeribadatan}</span>
                </div>
              )}
              {profile.sieRemaja && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Remaja Masjid:</span>
                  <span className="font-semibold text-slate-700 truncate ml-2 text-right">{profile.sieRemaja}</span>
                </div>
              )}
              {profile.sieHumas && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Humas:</span>
                  <span className="font-semibold text-slate-700 truncate ml-2 text-right">{profile.sieHumas}</span>
                </div>
              )}
              {profile.customOfficers && profile.customOfficers.length > 0 && (
                <div className="pt-1 border-t border-slate-100 space-y-1">
                  {profile.customOfficers.map((co) => (
                    <div key={co.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 truncate max-w-[120px]">{co.roleTitle}:</span>
                      <span className="font-semibold text-slate-700 truncate ml-2">{co.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Google Drive Status */}
          <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl p-4 border border-emerald-100 text-xs text-slate-600 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                Penyimpanan Aman Google Drive
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Data keuangan dan foto nota otomatis terenkripsi & tersimpan rapi di Google Drive masjid.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
