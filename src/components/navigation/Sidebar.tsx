import React from 'react';
import {
  Home,
  Wallet,
  Receipt,
  Calendar,
  HeartHandshake,
  Layers,
  CreditCard,
  Package,
  Settings,
  Tv,
  KeyRound,
  Power,
  User,
  X,
  Trash2,
  HardDrive,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Maximize2,
  Minimize2,
  UserPlus,
} from 'lucide-react';
import { MosqueProfile, UserAccount, BankAccount } from '../../types';
import { SettingsTabType } from '../admin/SettingsModal';
import { canAccessTab, ROLES_CONFIG } from '../../utils/rbac';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

export type NavTabType =
  | 'dashboard'
  | string // for account specific like 'account-acc-utama'
  | 'riwayat-kas'
  | 'jadwal'
  | 'qurban'
  | 'kategori-kas'
  | 'kelola-rekening'
  | 'aset'
  | 'whatsapp-hub'
  | 'storage-health'
  | 'audit'
  | 'pengaturan-masjid'
  | 'pengaturan-tv'
  | 'reset-data';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  profile: MosqueProfile;
  currentUser: UserAccount | null;
  accounts: BankAccount[];
  onOpenSettings: (initialTab?: SettingsTabType) => void;
  onOpenTv: () => void;
  onLogout: () => void;
  onCloseMobile?: () => void;
  onOpenFullscreenGuide?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  currentUser,
  accounts,
  onOpenSettings,
  onOpenTv,
  onLogout,
  onCloseMobile,
  onOpenFullscreenGuide,
  onToggleFullscreen,
  isFullscreen = false,
}) => {
  // Check active state
  const isActive = (tabKey: string) => currentTab === tabKey;

  const handleItemClick = (tabKey: string) => {
    if (tabKey === 'pengaturan-masjid') {
      onOpenSettings('profile');
    } else if (tabKey === 'kelola-akun') {
      onOpenSettings('akun');
    } else if (tabKey === 'pengaturan-tv') {
      onOpenTv();
    } else {
      onSelectTab(tabKey);
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-68 sm:w-72 bg-white text-slate-700 h-full flex flex-col border-r border-slate-200/90 shadow-sm select-none">
      {/* Mobile close button if drawer */}
      {onCloseMobile && (
        <div className="flex sm:hidden items-center justify-between px-4 pt-3 pb-1 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menu Navigasi
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Top Header Card (Green Gradient like in screenshot) */}
      <div className="p-3.5 pb-2">
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 rounded-2xl p-3 shadow-md shadow-emerald-700/15 flex items-center gap-3 text-white transition-all">
          {/* Mosque Logo / Vector Icon in white rounded box */}
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm shrink-0">
            {profile.logoUrl && profile.logoUrl.trim() !== '' ? (
              <img
                src={profile.logoUrl}
                alt="Logo Masjid"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 text-emerald-600 fill-current"
              >
                <path d="M12 2C11.5 2 11 2.4 11 3V4.1C9.2 4.6 7.6 5.8 6.6 7.5L5.2 6.1C4.8 5.7 4.2 5.7 3.8 6.1C3.4 6.5 3.4 7.1 3.8 7.5L5 8.7C4.4 9.7 4 10.8 4 12V21C4 21.6 4.4 22 5 22H19C19.6 22 20 21.6 20 21V12C20 10.8 19.6 9.7 19 8.7L20.2 7.5C20.6 7.1 20.6 6.5 20.2 6.1C19.8 5.7 19.2 5.7 18.8 6.1L17.4 7.5C16.4 5.8 14.8 4.6 13 4.1V3C13 2.4 12.5 2 12 2ZM12 6C14.8 6 17 8.2 17 11V20H15V14C15 12.3 13.7 11 12 11C10.3 11 9 12.3 9 14V20H7V11C7 8.2 9.2 6 12 6ZM12 13C12.6 13 13 13.4 13 14V20H11V14C11 13.4 11.4 13 12 13Z" />
              </svg>
            )}
          </div>

          {/* Titles */}
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm sm:text-[15px] leading-tight text-white tracking-tight truncate">
              {profile.name || 'Masjid Nurul Ilmi'}
            </h2>
            <div className="text-[11px] font-medium text-emerald-100 opacity-90 mt-0.5 tracking-normal">
              Premium v3.0
            </div>
          </div>
        </div>

        {/* Fullscreen Mobile Quick Card */}
        <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bold text-slate-700 text-[11px] truncate">Layar Penuh HP</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors"
                title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh'}
              >
                {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span>{isFullscreen ? 'Keluar' : 'Full'}</span>
              </button>
            )}
            {onOpenFullscreenGuide && (
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  onOpenFullscreenGuide();
                }}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                title="Panduan Layar Penuh HP"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-4 no-scrollbar">
        {/* 1. NAVIGASI UTAMA */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-2.5 mb-1.5">
            Navigasi Utama
          </div>
          <button
            onClick={() => handleItemClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive('dashboard')
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
            }`}
          >
            <Home
              className={`w-4 h-4 shrink-0 ${
                isActive('dashboard') ? 'text-white' : 'text-slate-500'
              }`}
            />
            <span className="truncate">Dashboard</span>
          </button>
        </div>

        {/* 2. RINCIAN PER REKENING */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-2.5 mb-1.5">
            Rincian Per Rekening
          </div>
          <div className="space-y-0.5">
            {accounts.map((acc) => {
              const accKey = `rekening-${acc.id}`;
              const active = isActive(accKey);

              // Match abbreviation style in screenshot: e.g. "Pembangunan dan Reno..."
              let displayName = acc.name;
              if (displayName.toLowerCase().includes('pembangunan')) {
                displayName = 'Pembangunan dan Reno...';
              }

              return (
                <button
                  key={acc.id}
                  onClick={() => handleItemClick(accKey)}
                  title={acc.name}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    active
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                  }`}
                >
                  <Wallet
                    className={`w-4 h-4 shrink-0 ${
                      active ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{displayName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. LAPORAN & PENGATURAN */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-2.5 mb-1.5">
            Laporan & Pengaturan
          </div>
          <div className="space-y-0.5">
            {/* Riwayat Kas */}
            <button
              onClick={() => handleItemClick('riwayat-kas')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('riwayat-kas')
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              <Receipt
                className={`w-4 h-4 shrink-0 ${
                  isActive('riwayat-kas') ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="truncate">Riwayat Kas</span>
            </button>

            {/* Jadwal Imam & Khatib */}
            <button
              onClick={() => handleItemClick('jadwal')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('jadwal')
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              <Calendar
                className={`w-4 h-4 shrink-0 ${
                  isActive('jadwal') ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="truncate">Jadwal Imam & Khatib</span>
            </button>

            {/* Peserta Qurban */}
            <button
              onClick={() => handleItemClick('qurban')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('qurban')
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              <HeartHandshake
                className={`w-4 h-4 shrink-0 ${
                  isActive('qurban') ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="truncate">Peserta Qurban</span>
            </button>

            {/* Kategori Kas */}
            <button
              onClick={() => handleItemClick('kategori-kas')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('kategori-kas')
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              <Layers
                className={`w-4 h-4 shrink-0 ${
                  isActive('kategori-kas') ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="truncate">Kategori Kas</span>
            </button>

            {/* Kelola Rekening */}
            <button
              onClick={() => handleItemClick('kelola-rekening')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('kelola-rekening')
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              <CreditCard
                className={`w-4 h-4 shrink-0 ${
                  isActive('kelola-rekening') ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="truncate">Kelola Rekening</span>
            </button>

            {/* Inventaris Aset */}
            <button
              onClick={() => handleItemClick('aset')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('aset')
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              <Package
                className={`w-4 h-4 shrink-0 ${
                  isActive('aset') ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="truncate">Inventaris Aset</span>
            </button>

            {/* Pusat Notifikasi WhatsApp */}
            <button
              onClick={() => handleItemClick('whatsapp-hub')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('whatsapp-hub')
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              <MessageCircle
                className={`w-4 h-4 shrink-0 ${
                  isActive('whatsapp-hub') ? 'text-white' : 'text-emerald-600'
                }`}
              />
              <span className="truncate">Pusat Notifikasi WA</span>
            </button>

            {/* Kesehatan Data & Backup */}
            <button
              onClick={() => handleItemClick('storage-health')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('storage-health')
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              <HardDrive
                className={`w-4 h-4 shrink-0 ${
                  isActive('storage-health') ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="truncate">Cadangan & Memori</span>
            </button>

            {/* Log Audit & Keamanan */}
            <button
              onClick={() => handleItemClick('audit')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('audit')
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
              }`}
            >
              <ShieldCheck
                className={`w-4 h-4 shrink-0 ${
                  isActive('audit') ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span className="truncate">Log Audit Aktivitas</span>
            </button>

            {/* Pengaturan Masjid */}
            <button
              onClick={() => handleItemClick('pengaturan-masjid')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 transition-all"
            >
              <Settings className="w-4 h-4 shrink-0 text-slate-500" />
              <span className="truncate">Pengaturan Masjid</span>
            </button>

            {/* Buat & Kelola Akun */}
            <button
              onClick={() => handleItemClick('kelola-akun')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 transition-all"
            >
              <UserPlus className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="truncate">Buat & Kelola Akun</span>
            </button>

            {/* Pengaturan TV */}
            <button
              onClick={() => handleItemClick('pengaturan-tv')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 transition-all"
            >
              <Tv className="w-4 h-4 shrink-0 text-slate-500" />
              <span className="truncate">Pengaturan TV</span>
            </button>

            {/* Reset & Bersihkan Data */}
            <button
              onClick={() => handleItemClick('reset-data')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive('reset-data')
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25'
                  : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50/80'
              }`}
            >
              <Trash2
                className={`w-4 h-4 shrink-0 ${
                  isActive('reset-data') ? 'text-white' : 'text-rose-500'
                }`}
              />
              <span className="truncate">Reset Data</span>
            </button>
          </div>

          {/* In-App PWA Install Banner */}
          <div className="pt-2 px-0.5">
            <PWAInstallButton variant="sidebar" />
          </div>
        </div>
      </div>

      {/* Bottom Profile Footer (Matches bottom of screenshot) */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-2">
        {/* User Avatar and Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/70 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 leading-tight truncate">
              {currentUser?.name && currentUser.name.trim() !== ''
                ? currentUser.name
                : currentUser?.role && ROLES_CONFIG[currentUser.role]
                ? ROLES_CONFIG[currentUser.role].label
                : 'Pengurus'}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                currentUser?.role && ROLES_CONFIG[currentUser.role]
                  ? ROLES_CONFIG[currentUser.role].badgeLightClass
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {currentUser?.role && ROLES_CONFIG[currentUser.role]
                  ? ROLES_CONFIG[currentUser.role].shortLabel
                  : 'ADMIN'}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons on right: Key and Power */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Key icon button (Change PIN / Password) */}
          <button
            onClick={() => onOpenSettings('password')}
            title="Ubah PIN & Keamanan Akun"
            className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-blue-600 border border-slate-200/80 flex items-center justify-center transition-all shadow-xs"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>

          {/* Power/Logout button */}
          <button
            onClick={onLogout}
            title="Keluar / Logout"
            className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200/60 flex items-center justify-center transition-all shadow-xs"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
