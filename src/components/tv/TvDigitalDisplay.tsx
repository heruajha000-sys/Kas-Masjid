import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  ChevronLeft,
  Info,
  Lock,
  Play,
  Pause,
  ArrowLeftRight,
  ArrowUpDown,
  UserCheck,
  CheckCircle2,
  X,
  Copy,
  Check,
  Users,
  HandCoins,
} from 'lucide-react';
import {
  MosqueProfile,
  PrayerTimeData,
  Transaction,
  BankAccount,
  DutySchedule,
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
  duties?: DutySchedule[];
  onOpenLogin: () => void;
  onOpenDashboard: () => void;
  isLoggedIn: boolean;
}

type TvViewMode = 'slide' | 'scroll';

export const TvDigitalDisplay: React.FC<TvDigitalDisplayProps> = ({
  profile,
  transactions,
  accounts,
  duties = [],
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

  // Mode View: 'slide' (bisa digeser ke samping) atau 'scroll' (bisa digeser ke atas-bawah)
  const [viewMode, setViewMode] = useState<TvViewMode>('slide');
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoSlide, setIsAutoSlide] = useState(true);
  const [slideProgress, setSlideProgress] = useState(0);
  const [copiedAccId, setCopiedAccId] = useState<string | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Touch and drag swipe tracking
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);
  const isMouseDownRef = useRef<boolean>(false);
  const mouseStartXRef = useRef<number>(0);

  const SLIDE_COUNT = 5;
  const SLIDE_DURATION_SEC = 12;

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

  // Auto-slide carousel timer in 'slide' mode
  useEffect(() => {
    if (viewMode !== 'slide' || !isAutoSlide) return;

    const interval = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          setActiveSlide((current) => (current + 1) % SLIDE_COUNT);
          return 0;
        }
        return prev + 100 / (SLIDE_DURATION_SEC * 10);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [viewMode, isAutoSlide]);

  // Reset slide progress whenever activeSlide changes
  useEffect(() => {
    setSlideProgress(0);
  }, [activeSlide]);

  // Trigger audio alarms when entering Adzan or Iqomah window
  useEffect(() => {
    if (!soundEnabled) return;

    if (nextPrayer.secondsRemaining <= 5 && nextPrayer.secondsRemaining > 0) {
      playCountdownTick();
    }

    if (nextPrayer.secondsRemaining === 0 && !nextPrayer.isIqomahCountdown) {
      const stateKey = `adzan-${nextPrayer.name}-${currentTime.getMinutes()}`;
      if (lastChimedState !== stateKey) {
        playAdzanChime();
        setLastChimedState(stateKey);
      }
    }

    if (nextPrayer.isIqomahCountdown && nextPrayer.iqomahSecondsRemaining <= 2) {
      const stateKey = `iqomah-${nextPrayer.name}`;
      if (lastChimedState !== stateKey) {
        playIqomahAlert();
        setLastChimedState(stateKey);
      }
    }
  }, [currentTime, nextPrayer, soundEnabled, lastChimedState]);

  // Keyboard navigation: Left/Right to slide, Space to toggle auto-slide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (e.key === ' ') {
        setIsAutoSlide((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for fullscreen change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Handle slide transitions
  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % SLIDE_COUNT);
    setSlideProgress(0);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT);
    setSlideProgress(0);
  };

  // Touch Swipe Handlers (Geser Jari di Layar HP)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      isSwipingRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwipingRef.current || e.changedTouches.length === 0) return;
    isSwipingRef.current = false;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartXRef.current;
    const deltaY = endY - touchStartYRef.current;

    // Geser horizontal (Swipe Left / Right)
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Geser ke kiri -> slide berikutnya
        handleNextSlide();
      } else {
        // Geser ke kanan -> slide sebelumnya
        handlePrevSlide();
      }
      setShowSwipeHint(false);
    }
  };

  // Mouse Drag Handlers for Desktop/Laptop
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    mouseStartXRef.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const deltaX = e.clientX - mouseStartXRef.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
      setShowSwipeHint(false);
    }
  };

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

  const handleCopyAccNumber = (acc: BankAccount) => {
    navigator.clipboard.writeText(acc.accountNumber);
    setCopiedAccId(acc.id);
    setTimeout(() => setCopiedAccId(null), 2000);
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
  const recentTransactions = transactions.slice(0, 6);

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

  const slideTabs = [
    { id: 0, label: 'Jadwal Sholat', icon: Clock },
    { id: 1, label: 'Laporan Kas', icon: TrendingUp },
    { id: 2, label: 'Mutasi Transaksi', icon: ArrowDownRight },
    { id: 3, label: 'Infaq QRIS', icon: QrCode },
    { id: 4, label: 'Agenda & Petugas', icon: Calendar },
  ];

  return (
    <div
      id="tv-display-container"
      className={`min-h-[100dvh] w-full flex flex-col justify-between transition-colors duration-500 overflow-x-hidden ${
        isTvDarkMode
          ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100'
          : 'bg-gradient-to-b from-emerald-50 via-slate-50 to-slate-100 text-slate-900'
      }`}
    >
      {/* 1. TOP HEADER: BRAND, CLOCK, MODE SWITCHER & CONTROLS */}
      <header
        id="tv-header"
        className={`px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 border-b shrink-0 ${
          isTvDarkMode ? 'border-slate-800/80 bg-slate-900/80' : 'border-emerald-200/70 bg-white/90'
        } backdrop-blur-md sticky top-0 z-30`}
      >
        {/* Mosque Identity with discrete 3-click hidden trigger */}
        <div
          id="tv-mosque-brand-trigger"
          onClick={handleBrandClick}
          className="flex items-center gap-3 cursor-pointer group"
          title="Klik 3x untuk membuka Panel Login Pengurus Masjid"
        >
          <div className="relative shrink-0">
            {profile.logoUrl && profile.logoUrl.trim() !== '' ? (
              <img
                src={profile.logoUrl}
                alt="Logo Masjid"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-700/80 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
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
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <span className="truncate max-w-[200px] sm:max-w-none">{profile.name}</span>
              <span className="font-arabic text-emerald-500 text-base sm:text-lg font-normal hidden sm:inline">
                مسجد
              </span>
            </h1>
            <p className={`text-[11px] sm:text-xs font-medium truncate max-w-[220px] sm:max-w-none ${isTvDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {profile.address}, {profile.city} • <span className="text-emerald-500 font-semibold">{profile.slogan}</span>
            </p>
          </div>
        </div>

        {/* Realtime Clock & Islamic Calendar */}
        <div id="tv-clock-section" className="flex items-center gap-3 sm:gap-4 ml-auto">
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-emerald-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{getHijriDate(currentTime)}</span>
            </div>
            <p className={`text-[11px] ${isTvDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {formatIndonesianDate(currentTime)}
            </p>
          </div>

          {/* Digital Clock */}
          <div
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border font-mono-num font-extrabold text-xl sm:text-3xl tracking-wider shadow-inner ${
              isTvDarkMode
                ? 'bg-slate-950/80 border-slate-800 text-emerald-400 shadow-emerald-950/30'
                : 'bg-white border-emerald-200 text-emerald-700 shadow-slate-200'
            }`}
          >
            {currentTime.toTimeString().slice(0, 8)}
          </div>

          {/* Control Toolbar */}
          <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 border-l border-slate-700/40">
            {/* View Mode Toggle: Slide (Geser) vs Scroll (Gulir) */}
            <button
              onClick={() => setViewMode((m) => (m === 'slide' ? 'scroll' : 'slide'))}
              title={viewMode === 'slide' ? 'Ganti ke Mode Gulir Vertikal' : 'Ganti ke Mode Geser Slide (Swipe)'}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                viewMode === 'slide'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/40'
                  : 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {viewMode === 'slide' ? (
                <>
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Mode Geser Slide</span>
                  <span className="md:hidden">Geser</span>
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Mode Gulir Penuh</span>
                  <span className="md:hidden">Gulir</span>
                </>
              )}
            </button>

            {/* In Slide mode: Auto Slide Play/Pause */}
            {viewMode === 'slide' && (
              <button
                onClick={() => setIsAutoSlide(!isAutoSlide)}
                title={isAutoSlide ? 'Jeda Geser Otomatis' : 'Mulai Geser Otomatis'}
                className={`p-2 rounded-xl text-xs transition-colors ${
                  isAutoSlide
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isAutoSlide ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Sound Toggle */}
            <button
              id="tv-sound-toggle-btn"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playAdzanChime();
              }}
              title={soundEnabled ? 'Alarm Suara Aktif' : 'Alarm Suara Mati'}
              className={`p-2 rounded-xl text-xs transition-colors ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Dark/Light Theme Toggle */}
            <button
              id="tv-theme-toggle-btn"
              onClick={() => setIsTvDarkMode(!isTvDarkMode)}
              title="Ganti Tema TV (Gelap/Terang)"
              className={`p-2 rounded-xl text-xs transition-colors ${
                isTvDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {isTvDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Fullscreen Button */}
            <button
              id="tv-fullscreen-btn"
              onClick={toggleFullscreen}
              title="Layar Penuh TV (F11)"
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>

            {/* Takmir Discrete Shortcut */}
            <button
              id="tv-admin-login-discrete-btn"
              onClick={isLoggedIn ? onOpenDashboard : onOpenLogin}
              title={isLoggedIn ? 'Buka Dashboard Admin' : 'Login Pengurus Takmir'}
              className="p-2 rounded-xl bg-slate-800/50 hover:bg-emerald-600/30 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {isLoggedIn ? <Shield className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* SWIPE NAVIGATION HINT (DISMISSIBLE BANNER) */}
      {showSwipeHint && (
        <div className="bg-emerald-900/90 text-emerald-100 text-xs py-1.5 px-4 flex items-center justify-between border-b border-emerald-700/60 transition-all">
          <div className="flex items-center gap-2 mx-auto">
            <span className="animate-pulse">👈👉</span>
            <span className="font-medium">
              <strong>Tips Layar TV:</strong> Layar ini dapat <strong>digeser (swipe ke kiri/kanan)</strong> dengan jari di HP, atau klik tombol panah samping untuk berpindah informasi.
            </span>
          </div>
          <button
            onClick={() => setShowSwipeHint(false)}
            className="p-1 hover:bg-emerald-800 rounded text-emerald-300 transition-colors ml-2"
            title="Tutup tips"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. SLIDE NAVIGATION TABS (Bisa diklik untuk geser langsung) */}
      {viewMode === 'slide' && (
        <div
          id="tv-slide-tabs-bar"
          className={`px-3 sm:px-6 py-2 border-b flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 ${
            isTvDarkMode ? 'bg-slate-950/70 border-slate-800/70' : 'bg-emerald-100/40 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 mx-auto">
            {slideTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSlide === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSlide(tab.id);
                    setSlideProgress(0);
                  }}
                  className={`relative px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap overflow-hidden ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105 ring-2 ring-emerald-400/50'
                      : isTvDarkMode
                      ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'bg-white text-slate-700 hover:bg-emerald-50 shadow-xs'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>

                  {/* Progress bar if auto-slide is active */}
                  {isActive && isAutoSlide && (
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-amber-300 transition-all duration-100 ease-linear"
                      style={{ width: `${slideProgress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MAIN DISPLAY CONTENT AREA */}
      <main
        id="tv-main-content"
        className={`flex-1 relative flex flex-col justify-between w-full select-none ${
          viewMode === 'slide'
            ? 'overflow-hidden touch-pan-y'
            : 'overflow-y-auto overflow-x-hidden p-4 sm:p-6 gap-6'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* ======================= MODE SLIDE (SWIPEABLE CAROUSEL) ======================= */}
        {viewMode === 'slide' && (
          <div className="flex-1 w-full flex flex-col justify-between p-4 sm:p-6 relative">
            
            {/* FLOATING PREV / NEXT ARROWS (FOR FAST SLIDING) */}
            <button
              onClick={handlePrevSlide}
              title="Geser ke Slide Sebelumnya (Swipe Kiri)"
              className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${
                isTvDarkMode
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/60 hover:scale-110'
                  : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200 hover:scale-110 shadow-slate-300'
              }`}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
            </button>

            <button
              onClick={handleNextSlide}
              title="Geser ke Slide Berikutnya (Swipe Kanan)"
              className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all ${
                isTvDarkMode
                  ? 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/60 hover:scale-110'
                  : 'bg-white/90 hover:bg-white text-slate-800 border-slate-200 hover:scale-110 shadow-slate-300'
              }`}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
            </button>

            {/* SLIDE 0: JADWAL SHOLAT & HITUNG MUNDUR */}
            {activeSlide === 0 && (
              <div className="flex-1 flex flex-col justify-between gap-4 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
                {/* 6 Prayer Cards */}
                <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {prayerCards.map((prayer) => {
                    const isHighlighted = prayer.isNext;
                    return (
                      <div
                        key={prayer.name}
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

                {/* Big Countdown Banner */}
                <section
                  className={`rounded-3xl p-5 lg:p-7 border transition-all ${
                    nextPrayer.isIqomahCountdown
                      ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white border-amber-300 shadow-2xl animate-pulse ring-4 ring-amber-400/40'
                      : isTvDarkMode
                      ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl'
                      : 'bg-white border-emerald-200 text-slate-900 shadow-md'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
                          nextPrayer.isIqomahCountdown ? 'bg-white/20 text-white' : 'bg-emerald-500 text-white'
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
                        <h2 className="text-xl lg:text-3xl font-black tracking-tight mt-1">
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
                    <div
                      className={`px-8 py-3 rounded-2xl border font-mono-num font-black text-4xl lg:text-6xl tracking-widest shadow-2xl shrink-0 ${
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
                </section>
              </div>
            )}

            {/* SLIDE 1: LAPORAN KAS REAL-TIME */}
            {activeSlide === 1 && (
              <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full animate-in fade-in duration-300">
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-2xl ${
                    isTvDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                        <TrendingUp className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl sm:text-2xl">Laporan Kas Masjid Real-Time</h3>
                        <p className={`text-xs sm:text-sm ${isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Transparansi Keuangan Terbuka untuk Seluruh Jamaah
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold animate-pulse">
                      Live Sync
                    </span>
                  </div>

                  {/* Main Total Balance */}
                  <div
                    className={`p-6 sm:p-8 rounded-3xl border mb-6 text-center ${
                      isTvDarkMode
                        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-emerald-500/30'
                        : 'bg-emerald-50/80 border-emerald-200 shadow-inner'
                    }`}
                  >
                    <span className={`text-sm sm:text-base font-semibold ${isTvDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      TOTAL SALDO SELURUH KAS & REKENING MASJID
                    </span>
                    <div className="font-mono-num text-4xl sm:text-6xl font-black text-emerald-500 mt-2 tracking-tight">
                      {formatRupiah(totalBalance)}
                    </div>
                    <p className="text-xs text-emerald-400 mt-2 font-medium">
                      Tersimpan aman di rekening bank syariah dan kas tunai masjid
                    </p>
                  </div>

                  {/* Accounts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className={`p-4 rounded-2xl border ${
                          isTvDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <p className="font-bold text-sm truncate" style={{ color: acc.color }}>
                          {acc.name}
                        </p>
                        <p className={`text-[11px] truncate ${isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {acc.bankName} - {acc.accountNumber}
                        </p>
                        <p className="font-mono-num font-extrabold text-lg mt-1 text-emerald-400">
                          {formatRupiah(acc.balance)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs">
                    <span className={isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                      Bendahara: <strong className="text-slate-200">{profile.bendahara || '-'}</strong>
                    </span>
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Laporan Terverifikasi & Diaudit Bersama Takmir
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2: MUTASI KAS TERAKHIR */}
            {activeSlide === 2 && (
              <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full animate-in fade-in duration-300">
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-2xl ${
                    isTvDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                        <ArrowDownRight className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl sm:text-2xl">Mutasi Kas & Infaq Terakhir</h3>
                        <p className={`text-xs sm:text-sm ${isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Catatan transaksi pemasukan dan pengeluaran masjid terbaru
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
                    {recentTransactions.map((trx) => {
                      const isIn = trx.type === 'in';
                      return (
                        <div
                          key={trx.id}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                            isTvDarkMode
                              ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="pr-3 truncate">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase mb-1 ${
                              isIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {isIn ? 'Pemasukan' : 'Pengeluaran'} • {trx.category}
                            </span>
                            <p className="font-semibold text-sm truncate">{trx.description}</p>
                            <p className={`text-[11px] ${isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Tanggal: {trx.date}
                            </p>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span
                              className={`font-mono-num text-base font-extrabold ${
                                isIn ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isIn ? '+' : '-'} {formatRupiah(trx.amount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className={`text-xs mt-4 text-center ${isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Semua penerimaan infaq jamaah dicatat secara aman dan transparan dalam sistem pembukuan digital.
                  </p>
                </div>
              </div>
            )}

            {/* SLIDE 3: INFAQ NON-TUNAI QRIS & REKENING */}
            {activeSlide === 3 && (
              <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left: QRIS Code Card */}
                  <div
                    onClick={() => setShowQrisModal(true)}
                    className="md:col-span-5 rounded-3xl p-6 bg-gradient-to-br from-emerald-800 to-teal-950 text-white border border-emerald-500/40 shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] transition-transform group"
                  >
                    <div className="bg-white p-3 rounded-2xl shadow-xl mb-3">
                      {profile.qrisUrl && profile.qrisUrl.trim() !== '' ? (
                        <img
                          src={profile.qrisUrl}
                          alt="QRIS Infaq Masjid"
                          className="w-44 h-44 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400">
                          <QrCode className="w-24 h-24 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-amber-300 mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span>INFAQ NON-TUNAI (QRIS)</span>
                    </div>
                    <p className="text-xs text-emerald-100 font-medium">
                      Mendukung BCA, Mandiri, BRI, BSI, GoPay, OVO, ShopeePay & Dana
                    </p>
                    <p className="text-[11px] text-emerald-300/80 mt-1 font-mono">
                      NMID: {profile.qrisNmid || 'ID1020304050607'}
                    </p>
                    <span className="mt-3 text-xs bg-white/20 px-3.5 py-1 rounded-full text-white font-semibold group-hover:bg-white/30 transition-colors">
                      Klik untuk memperbesar QRIS
                    </span>
                  </div>

                  {/* Right: Bank Accounts for Manual Transfer */}
                  <div className="md:col-span-7 flex flex-col gap-3">
                    <h3 className="font-extrabold text-xl sm:text-2xl flex items-center gap-2">
                      <HandCoins className="w-6 h-6 text-emerald-400" />
                      <span>Nomor Rekening Donasi & Infaq</span>
                    </h3>
                    <p className={`text-xs ${isTvDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Jamaah dapat menyalurkan infaq melalui transfer langsung ke rekening resmi masjid di bawah ini:
                    </p>

                    <div className="space-y-3 mt-1">
                      {accounts.map((acc) => (
                        <div
                          key={acc.id}
                          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                            isTvDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                          } shadow-md`}
                        >
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                              {acc.name}
                            </span>
                            <div className="font-mono-num font-extrabold text-lg sm:text-xl text-slate-100">
                              {acc.accountNumber}
                            </div>
                            <p className={`text-xs ${isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Bank: <strong>{acc.bankName}</strong> a.n. {acc.holderName}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopyAccNumber(acc)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                            title="Salin Nomor Rekening"
                          >
                            {copiedAccId === acc.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-amber-300" />
                                <span>Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 4: JADWAL PETUGAS SHOLAT & AGENDA */}
            {activeSlide === 4 && (
              <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full animate-in fade-in duration-300">
                <div
                  className={`rounded-3xl p-6 sm:p-8 border shadow-2xl ${
                    isTvDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
                        <Users className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-xl sm:text-2xl">Jadwal Petugas & Agenda Masjid</h3>
                        <p className={`text-xs sm:text-sm ${isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Petugas Sholat Jumat, Kajian Rutin, dan Kegiatan Takmir
                        </p>
                      </div>
                    </div>
                  </div>

                  {duties && duties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
                      {duties.slice(0, 4).map((d) => (
                        <div
                          key={d.id}
                          className={`p-4 rounded-2xl border ${
                            isTvDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {d.type}
                            </span>
                            <span className={`text-xs font-semibold ${isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {d.date}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-slate-100">{d.theme || 'Kegiatan Ibadah Masjid'}</h4>
                          <div className="mt-2 text-xs space-y-1">
                            <p><strong className="text-emerald-400">Khatib:</strong> {d.khatib || '-'}</p>
                            <p><strong className="text-emerald-400">Imam:</strong> {d.imam || '-'}</p>
                            <p><strong className="text-emerald-400">Muadzin:</strong> {d.muadzin || '-'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-700">
                      <p className="text-slate-300 font-semibold mb-1">Jadwal Petugas Jumat & Kajian Sedang Disinkronkan</p>
                      <p className="text-xs text-slate-400">
                        Pengurus takmir dapat memperbarui jadwal khatib, imam, dan penceramah di dashboard admin.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs">
                    <span className={isTvDarkMode ? 'text-slate-400' : 'text-slate-500'}>
                      Ketua Takmir: <strong className="text-slate-200">{profile.ketuaTakmir || '-'}</strong>
                    </span>
                    <span className="text-emerald-400 font-medium">
                      Hubungi Sekretariat: {profile.phone || '-'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Slide Indicator Dots at Bottom */}
            <div className="flex items-center justify-center gap-2 mt-4 shrink-0">
              {Array.from({ length: SLIDE_COUNT }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveSlide(idx);
                    setSlideProgress(0);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    activeSlide === idx
                      ? 'w-8 bg-emerald-500'
                      : isTvDarkMode
                      ? 'w-2 bg-slate-700 hover:bg-slate-600'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Geser ke Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* ======================= MODE GULIR PENUH (SCROLLABLE GRID) ======================= */}
        {viewMode === 'scroll' && (
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
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

                {/* Digital Countdown Clock */}
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

            {/* ROW 3: BENTO COLUMNS (KAS REALTIME + RECENT TRANSACTIONS + QRIS INFAQ) */}
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
                    Bendahara: <strong className="text-slate-200">{profile.bendahara || '-'}</strong>
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
          </div>
        )}
      </main>

      {/* 4. BOTTOM RUNNING TEXT MARQUEE FOOTER */}
      <footer
        id="tv-running-text-footer"
        className={`w-full py-2.5 px-4 flex items-center gap-3 border-t overflow-hidden shrink-0 ${
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
