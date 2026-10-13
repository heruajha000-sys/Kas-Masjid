import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  Calendar,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  QrCode,
  Shield,
  Sun,
  Moon,
  TrendingUp,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  Info,
  Lock,
} from 'lucide-react';
import {
  MosqueProfile,
  PrayerTimeData,
  Transaction,
  BankAccount,
} from '../../types';
import {
  calculatePrayerTimes,
  getNextPrayer,
  formatIndonesianDate,
  getHijriDate,
  NextPrayerInfo,
} from '../../utils/prayerTimes';
import { playAdzanChime, playIqomahAlert, playCountdownTick } from '../../utils/audio';
import { formatRupiah } from '../../utils/storage';

interface TvDigitalDisplayProps {
  profile: MosqueProfile;
  transactions: Transaction[];
  accounts: BankAccount[];
  onOpenLogin: () => void;
  onOpenDashboard: () => void;
  isLoggedIn: boolean;
}

export const TvDigitalDisplay: React.FC<TvDigitalDisplayProps> = ({
  profile,
  transactions,
  accounts,
  onOpenLogin,
  onOpenDashboard,
  isLoggedIn,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTvDarkMode, setIsTvDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [hiddenClickCount, setHiddenClickCount] = useState(0);
  const [lastChimedState, setLastChimedState] = useState<string>('');

  // Calculate live prayer times
  const prayerTimes: PrayerTimeData = calculatePrayerTimes(
    currentTime,
    profile.latitude,
    profile.longitude,
    profile.timezone
  );

  const nextPrayer: NextPrayerInfo = getNextPrayer(
    prayerTimes,
    currentTime,
    profile.iqomahMinutes
  );

  // Tick clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Trigger audio alarms when entering Adzan or Iqomah window
  useEffect(() => {
    if (!soundEnabled) return;

    // Last 5 seconds tick
    if (nextPrayer.secondsRemaining <= 5 && nextPrayer.secondsRemaining > 0) {
      playCountdownTick();
    }

    // Exact moment Adzan hits (secondsRemaining == 0 and not yet in iqomah chime)
    if (nextPrayer.secondsRemaining === 0 && !nextPrayer.isIqomahCountdown) {
      const stateKey = `adzan-${nextPrayer.name}-${currentTime.getMinutes()}`;
      if (lastChimedState !== stateKey) {
        playAdzanChime();
        setLastChimedState(stateKey);
      }
    }

    // Iqomah finishes (iqomahSecondsRemaining == 0)
    if (nextPrayer.isIqomahCountdown && nextPrayer.iqomahSecondsRemaining <= 2) {
      const stateKey = `iqomah-${nextPrayer.name}`;
      if (lastChimedState !== stateKey) {
        playIqomahAlert();
        setLastChimedState(stateKey);
      }
    }
  }, [currentTime, nextPrayer, soundEnabled, lastChimedState]);

  // Handle hidden admin trigger: 3 rapid clicks on mosque brand badge
  const handleBrandClick = useCallback(() => {
    setHiddenClickCount((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        if (isLoggedIn) {
          onOpenDashboard();
        } else {
          onOpenLogin();
        }
        return 0;
      }
      return next;
    });

    setTimeout(() => {
      setHiddenClickCount(0);
    }, 3000);
  }, [isLoggedIn, onOpenDashboard, onOpenLogin]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format countdown string
  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate financial metrics for display
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
  const recentTransactions = transactions.slice(0, 5);

  const prayerCards: Array<{
    name: string;
    key: keyof PrayerTimeData;
    time: string;
    isNext: boolean;
  }> = [
    { name: 'Subuh', key: 'subuh', time: prayerTimes.subuh, isNext: nextPrayer.name === 'Subuh' },
    { name: 'Syuruq', key: 'syuruq', time: prayerTimes.syuruq, isNext: nextPrayer.name === 'Syuruq' },
    { name: 'Dzuhur', key: 'dzuhur', time: prayerTimes.dzuhur, isNext: nextPrayer.name === 'Dzuhur' },
    { name: 'Ashar', key: 'ashar', time: prayerTimes.ashar, isNext: nextPrayer.name === 'Ashar' },
    { name: 'Maghrib', key: 'maghrib', time: prayerTimes.maghrib, isNext: nextPrayer.name === 'Maghrib' },
    { name: 'Isya', key: 'isya', time: prayerTimes.isya, isNext: nextPrayer.name === 'Isya' },
  ];

  return (
    <div
      id="tv-display-container"
      className={`min-h-screen w-full select-none flex flex-col justify-between transition-colors duration-500 ${
        isTvDarkMode
          ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100'
          : 'bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-100 text-slate-900'
      }`}
    >
      {/* TOP BAR: Mosque Header, Realtime Digital Clock & Dates */}
      <header
        id="tv-header"
        className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b ${
          isTvDarkMode ? 'border-slate-800/80 bg-slate-900/60' : 'border-emerald-200/70 bg-white/80'
        } backdrop-blur-md`}
      >
        {/* Mosque Identity with discrete 3-click hidden trigger */}
        <div
          id="tv-mosque-brand-trigger"
          onClick={handleBrandClick}
          className="flex items-center gap-4 cursor-pointer group"
          title="Klik 3x untuk membuka Panel Login Pengurus Masjid"
        >
          <div className="relative">
            {profile.logoUrl && profile.logoUrl.trim() !== '' ? (
              <img
                src={profile.logoUrl}
                alt="Logo Masjid"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-emerald-700/80 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10 flex items-center justify-center text-white font-bold text-xl">
                {profile.name?.charAt(0) || 'M'}
              </div>
            )}
            {hiddenClickCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {hiddenClickCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span>{profile.name}</span>
              <span className="font-arabic text-emerald-500 text-lg lg:text-xl font-normal">
                مسجد
              </span>
            </h1>
            <p className={`text-xs lg:text-sm font-medium ${isTvDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {profile.address}, {profile.city} • <span className="text-emerald-500">{profile.slogan}</span>
            </p>
          </div>
        </div>

        {/* Realtime Clock & Islamic Calendar */}
        <div id="tv-clock-section" className="flex items-center gap-5">
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-xs lg:text-sm font-semibold text-emerald-500">
              <Calendar className="w-4 h-4" />
              <span>{getHijriDate(currentTime)}</span>
            </div>
            <p className={`text-xs ${isTvDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {formatIndonesianDate(currentTime)}
            </p>
          </div>

          <div
            className={`px-5 py-2.5 rounded-2xl border font-mono-num font-extrabold text-3xl lg:text-4xl tracking-wider shadow-inner ${
              isTvDarkMode
                ? 'bg-slate-950/80 border-slate-800 text-emerald-400 shadow-emerald-950/30'
                : 'bg-white border-emerald-200 text-emerald-700 shadow-slate-200'
            }`}
          >
            {currentTime.toTimeString().slice(0, 8)}
          </div>

          {/* Quick TV Control buttons */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700/40">
            <button
              id="tv-sound-toggle-btn"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playAdzanChime();
              }}
              title={soundEnabled ? 'Alarm Suara Aktif' : 'Alarm Suara Mati'}
              className={`p-2.5 rounded-xl text-xs transition-colors ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              id="tv-theme-toggle-btn"
              onClick={() => setIsTvDarkMode(!isTvDarkMode)}
              title="Ganti Tema TV (Gelap/Terang)"
              className={`p-2.5 rounded-xl text-xs transition-colors ${
                isTvDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {isTvDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              id="tv-fullscreen-btn"
              onClick={toggleFullscreen}
              title="Layar Penuh TV (F11)"
              className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Hidden admin trigger explicit button */}
            <button
              id="tv-admin-login-discrete-btn"
              onClick={isLoggedIn ? onOpenDashboard : onOpenLogin}
              title={isLoggedIn ? 'Buka Dashboard Admin' : 'Login Pengurus Takmir'}
              className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-emerald-600/30 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {isLoggedIn ? <Shield className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN SCREEN: Dynamic Grid */}
      <main id="tv-main-content" className="flex-1 px-6 py-4 flex flex-col justify-between gap-5">
        
        {/* ROW 1: 6 PRAYER TIME CARDS */}
        <section id="tv-prayer-schedule-grid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {prayerCards.map((prayer) => {
            const isHighlighted = prayer.isNext;
            return (
              <div
                key={prayer.name}
                id={`tv-prayer-card-${prayer.key}`}
                className={`relative rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 border ${
                  isHighlighted
                    ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white border-emerald-400 shadow-xl shadow-emerald-500/20 scale-[1.03] ring-4 ring-emerald-500/30'
                    : isTvDarkMode
                    ? 'bg-slate-900/80 border-slate-800/80 text-slate-200 hover:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                }`}
              >
                {isHighlighted && (
                  <span className="absolute -top-2.5 px-3 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider animate-bounce shadow">
                    Sholat Berikutnya
                  </span>
                )}
                <span className={`text-sm lg:text-base font-bold uppercase tracking-wider ${
                  isHighlighted ? 'text-emerald-100' : isTvDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {prayer.name}
                </span>
                <span className="font-mono-num text-3xl lg:text-4xl font-extrabold tracking-tight mt-1">
                  {prayer.time}
                </span>
                <span className={`text-[11px] font-medium mt-1 ${isHighlighted ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {profile.city} (WIB)
                </span>
              </div>
            );
          })}
        </section>

        {/* ROW 2: COUNTDOWN TIMER & ADZAN/IQOMAH BANNER */}
        <section
          id="tv-countdown-banner"
          className={`rounded-3xl p-5 lg:p-6 border transition-all ${
            nextPrayer.isIqomahCountdown
              ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white border-amber-300 shadow-2xl animate-pulse ring-4 ring-amber-400/40'
              : isTvDarkMode
              ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl'
              : 'bg-white border-emerald-200 text-slate-900 shadow-md'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  nextPrayer.isIqomahCountdown
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                <Clock className="w-8 h-8 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    nextPrayer.isIqomahCountdown
                      ? 'bg-white text-amber-800 font-extrabold'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {nextPrayer.isIqomahCountdown ? 'Waktu Iqomah Masuk' : 'Hitung Mundur Adzan'}
                  </span>
                  <span className="text-xs opacity-80">
                    Target: {nextPrayer.name} ({nextPrayer.timeString} WIB)
                  </span>
                </div>
                <h2 className="text-xl lg:text-2xl font-black tracking-tight mt-1">
                  {nextPrayer.isIqomahCountdown
                    ? `WAKTU SHOLAT ${nextPrayer.name.toUpperCase()} TELAH TIBA`
                    : `Menuju Masuk Waktu Adzan Sholat ${nextPrayer.name}`}
                </h2>
                <p className="text-xs lg:text-sm opacity-90 mt-0.5">
                  {nextPrayer.isIqomahCountdown
                    ? 'Luruskan dan rapatkan shaf. Nonaktifkan suara telepon genggam Anda.'
                    : 'Bersiaplah mengambil wudhu dan membaca doa menyambut panggilan sholat.'}
                </p>
              </div>
            </div>

            {/* Huge Digital Countdown Clock */}
            <div className="flex items-center gap-4">
              <div
                className={`px-8 py-3.5 rounded-2xl border font-mono-num font-black text-4xl lg:text-6xl tracking-widest shadow-2xl ${
                  nextPrayer.isIqomahCountdown
                    ? 'bg-slate-950 text-amber-300 border-amber-300'
                    : isTvDarkMode
                    ? 'bg-slate-950 text-emerald-400 border-emerald-500/40'
                    : 'bg-emerald-900 text-emerald-200 border-emerald-700'
                }`}
              >
                {formatCountdown(
                  nextPrayer.isIqomahCountdown
                    ? nextPrayer.iqomahSecondsRemaining
                    : nextPrayer.secondsRemaining
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ROW 3: BENTO COLUMNS (KAS REALTIME + QRIS INFAQ + RECENT TRANSACTIONS) */}
        <section id="tv-bento-section" className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
          {/* Col 1: Real-time Kas Summary (5 cols) */}
          <div
            id="tv-kas-summary-card"
            className={`lg:col-span-5 rounded-3xl p-5 border flex flex-col justify-between ${
              isTvDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            } shadow-md`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base lg:text-lg">Laporan Kas Masjid Real-Time</h3>
                    <p className={`text-xs ${isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Transparansi Keuangan Terbuka untuk Seluruh Jamaah
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Live Sync
                </span>
              </div>

              {/* Main Total Balance */}
              <div
                className={`p-4 rounded-2xl border mb-3 ${
                  isTvDarkMode
                    ? 'bg-gradient-to-br from-slate-950 to-slate-900 border-emerald-500/30'
                    : 'bg-emerald-50/70 border-emerald-200'
                }`}
              >
                <span className={`text-xs font-semibold ${isTvDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Total Saldo Seluruh Kas & Rekening
                </span>
                <div className="font-mono-num text-3xl font-extrabold text-emerald-500 mt-1">
                  {formatRupiah(totalBalance)}
                </div>
              </div>

              {/* Account distribution pill overview */}
              <div className="grid grid-cols-2 gap-2">
                {accounts.slice(0, 4).map((acc) => (
                  <div
                    key={acc.id}
                    className={`p-2.5 rounded-xl border text-xs ${
                      isTvDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className="font-medium truncate" style={{ color: acc.color }}>
                      {acc.name}
                    </p>
                    <p className="font-mono-num font-bold text-sm mt-0.5">
                      {formatRupiah(acc.balance)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className={isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                Bendahara: <strong className="text-slate-200">{profile.bendahara}</strong>
              </span>
              <span className="text-emerald-500 font-medium">Audit Terverifikasi ✓</span>
            </div>
          </div>

          {/* Col 2: Recent Transactions Ticker (4 cols) */}
          <div
            id="tv-recent-transactions-card"
            className={`lg:col-span-4 rounded-3xl p-5 border flex flex-col justify-between ${
              isTvDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            } shadow-md`}
          >
            <div>
              <h3 className="font-bold text-base lg:text-lg flex items-center gap-2 mb-3">
                <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                <span>Mutasi Kas Terakhir</span>
              </h3>

              <div className="space-y-2.5">
                {recentTransactions.map((trx) => {
                  const isIn = trx.type === 'in';
                  return (
                    <div
                      key={trx.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        isTvDarkMode
                          ? 'bg-slate-950/40 border-slate-800/70'
                          : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div className="pr-2 truncate">
                        <p className="font-semibold truncate">{trx.category}</p>
                        <p className={`text-[11px] truncate ${isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {trx.description}
                        </p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span
                          className={`font-mono-num font-bold ${
                            isIn ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isIn ? '+' : '-'} {formatRupiah(trx.amount)}
                        </span>
                        <p className={`text-[10px] ${isTvDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {trx.date}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className={`text-[11px] mt-2 text-center ${isTvDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Laporan lengkap dapat diunduh di papan pengumuman & arsip takmir
            </p>
          </div>

          {/* Col 3: QRIS Infaq Non-Tunai Box (3 cols) */}
          <div
            id="tv-qris-card"
            onClick={() => setShowQrisModal(true)}
            className="lg:col-span-3 rounded-3xl p-5 bg-gradient-to-br from-emerald-800 to-teal-950 text-white border border-emerald-500/40 shadow-xl flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] transition-transform group"
          >
            <div className="bg-white p-2.5 rounded-2xl shadow-lg mb-3">
              {profile.qrisUrl && profile.qrisUrl.trim() !== '' ? (
                <img
                  src={profile.qrisUrl}
                  alt="QRIS Infaq Masjid"
                  className="w-28 h-28 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400">
                  <QrCode className="w-16 h-16 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INFAQ NON-TUNAI (QRIS)</span>
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              BCA, Mandiri, BSI, GoPay, OVO, ShopeePay
            </p>
            <p className="text-[10px] text-emerald-300/80 mt-1">
              NMID: {profile.qrisNmid || 'ID1020304050607'}
            </p>
            <span className="mt-2 text-[11px] bg-white/20 px-3 py-1 rounded-full text-white font-semibold group-hover:bg-white/30 transition-colors">
              Klik perbesar QRIS
            </span>
          </div>
        </section>
      </main>

      {/* BOTTOM RUNNING TEXT MARQUEE */}
      <footer
        id="tv-running-text-footer"
        className={`w-full py-2.5 px-4 flex items-center gap-3 border-t overflow-hidden ${
          isTvDarkMode
            ? 'bg-slate-950 border-slate-800 text-slate-200'
            : 'bg-emerald-900 border-emerald-800 text-white'
        }`}
      >
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-xs whitespace-nowrap shadow">
          <Info className="w-3.5 h-3.5" />
          <span>INFO MASJID</span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee font-medium text-sm">
            {profile.runningTexts.map((text, idx) => (
              <span key={idx} className="mx-6 inline-flex items-center gap-2">
                <span className="text-emerald-400">✦</span>
                <span>{text}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Discrete Admin shortcut at footer right */}
        <button
          id="tv-discrete-takmir-shortcut"
          onClick={isLoggedIn ? onOpenDashboard : onOpenLogin}
          className="text-xs opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700/50"
        >
          <Lock className="w-3 h-3" />
          <span>Takmir</span>
        </button>
      </footer>

      {/* QRIS POPUP MODAL FOR CLOSE-UP SCANNING */}
      {showQrisModal && (
        <div
          id="tv-qris-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowQrisModal(false)}
        >
          <div
            id="tv-qris-modal-card"
            className="bg-white text-slate-900 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold mb-1">
              <QrCode className="w-6 h-6" />
              <span className="text-lg">KODE QRIS INFAQ MASJID</span>
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 mb-4">{profile.name}</h4>
            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-emerald-600 inline-block mb-4 shadow-inner">
              {profile.qrisUrl && profile.qrisUrl.trim() !== '' ? (
                <img
                  src={profile.qrisUrl}
                  alt="QRIS Full"
                  className="w-64 h-64 mx-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-64 h-64 mx-auto flex items-center justify-center bg-slate-100 rounded-xl text-slate-400">
                  <QrCode className="w-32 h-32 text-slate-400" />
                </div>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-600 mb-1">
              NMID: <span className="font-mono">{profile.qrisNmid || 'ID1020304050607'}</span>
            </p>
            <p className="text-xs text-slate-500 mb-6">
              Menerima seluruh aplikasi pembayaran digital perbankan dan e-wallet nasional.
            </p>
            <button
              onClick={() => setShowQrisModal(false)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
            >
              Tutup Tampilan QRIS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
