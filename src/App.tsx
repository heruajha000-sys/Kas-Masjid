import React, { useState, useEffect } from 'react';
import {
  Tv,
  Wallet,
  Calendar,
  Users,
  HeartHandshake,
  Package,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  ExternalLink,
  Menu,
  Home,
  Receipt,
  UserCheck,
  Layers,
  CreditCard,
} from 'lucide-react';
import {
  MosqueProfile,
  UserAccount,
  Transaction,
  BankAccount,
  DutySchedule,
  MeetingRecord,
  QurbanParticipant,
  MosqueAsset,
  AssetLoan,
  AuditLog,
} from './types';
import { appStorage } from './utils/storage';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';
import { TvDigitalDisplay } from './components/tv/TvDigitalDisplay';
import { KasManager } from './components/kas/KasManager';
import { JadwalPetugas } from './components/kegiatan/JadwalPetugas';
import { DaftarHadirRapat } from './components/kegiatan/DaftarHadirRapat';
import { ManajemenQurban } from './components/qurban/ManajemenQurban';
import { InventarisAset } from './components/aset/InventarisAset';
import { AuditTrail } from './components/admin/AuditTrail';
import { StorageHealthManager } from './components/admin/StorageHealthManager';
import { WhatsAppHub } from './components/admin/WhatsAppHub';
import { LoginModal } from './components/admin/LoginModal';
import { SettingsModal, SettingsTabType } from './components/admin/SettingsModal';
import { Sidebar } from './components/navigation/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AccountDetailView } from './components/kas/AccountDetailView';
import { KategoriKasManager } from './components/kas/KategoriKasManager';
import { KelolaRekeningManager } from './components/kas/KelolaRekeningManager';
import { ResetDataManager } from './components/admin/ResetDataManager';

export default function App() {
  // Start directly in admin mode to display the menu requested by the user
  const [currentMode, setCurrentMode] = useState<'tv' | 'admin'>('admin');
  
  // Default to 'dashboard'
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // App Data State
  const [profile, setProfile] = useState<MosqueProfile>(appStorage.getProfile());
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(appStorage.getCurrentUser());
  const [transactions, setTransactions] = useState<Transaction[]>(appStorage.getTransactions());
  const [accounts, setAccounts] = useState<BankAccount[]>(appStorage.getAccounts());
  const [duties, setDuties] = useState<DutySchedule[]>(appStorage.getDuties());
  const [meetings, setMeetings] = useState<MeetingRecord[]>(appStorage.getMeetings());
  const [qurbanList, setQurbanList] = useState<QurbanParticipant[]>(appStorage.getQurban());
  const [assets, setAssets] = useState<MosqueAsset[]>(appStorage.getAssets());
  const [loans, setLoans] = useState<AssetLoan[]>(appStorage.getLoans());
  const [logs, setLogs] = useState<AuditLog[]>(appStorage.getAuditLogs());

  // Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<SettingsTabType>('profile');

  // Sync back to storage on updates
  const handleUpdateCash = (newTx: Transaction[], newAccs: BankAccount[]) => {
    setTransactions(newTx);
    setAccounts(newAccs);
    appStorage.saveTransactions(newTx);
    appStorage.saveAccounts(newAccs);
    setLogs(appStorage.getAuditLogs());
  };

  const handleUpdateDuties = (newDuties: DutySchedule[]) => {
    setDuties(newDuties);
    appStorage.saveDuties(newDuties);
    setLogs(appStorage.getAuditLogs());
  };

  const handleUpdateMeetings = (newMeetings: MeetingRecord[]) => {
    setMeetings(newMeetings);
    appStorage.saveMeetings(newMeetings);
    setLogs(appStorage.getAuditLogs());
  };

  const handleUpdateQurban = (newList: QurbanParticipant[]) => {
    setQurbanList(newList);
    appStorage.saveQurban(newList);
    setLogs(appStorage.getAuditLogs());
  };

  const handleUpdateAssets = (newAssets: MosqueAsset[], newLoans: AssetLoan[]) => {
    setAssets(newAssets);
    setLoans(newLoans);
    appStorage.saveAssets(newAssets);
    appStorage.saveLoans(newLoans);
    setLogs(appStorage.getAuditLogs());
  };

  const handleUpdateProfile = (newProfile: MosqueProfile) => {
    setProfile(newProfile);
    appStorage.saveProfile(newProfile);
    setLogs(appStorage.getAuditLogs());
  };

  // Switch to Admin
  const handleRequestAdminAccess = () => {
    if (currentUser) {
      setCurrentMode('admin');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    setCurrentMode('admin');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleOpenSettings = (initialTab: SettingsTabType = 'profile') => {
    setSettingsInitialTab(initialTab);
    setShowSettingsModal(true);
  };

  const handleRestoreData = () => {
    setProfile(appStorage.getProfile());
    setTransactions(appStorage.getTransactions());
    setAccounts(appStorage.getAccounts());
    setDuties(appStorage.getDuties());
    setMeetings(appStorage.getMeetings());
    setQurbanList(appStorage.getQurban());
    setAssets(appStorage.getAssets());
    setLoans(appStorage.getLoans());
    setLogs(appStorage.getAuditLogs());
  };

  // Keyboard shortcut: Shift + A to open admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        if (currentMode === 'tv') {
          handleRequestAdminAccess();
        } else {
          setCurrentMode('tv');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMode, currentUser]);

  // Determine active view label
  const getPageTitle = () => {
    if (adminTab === 'dashboard') return 'Dashboard Utama';
    if (adminTab.startsWith('rekening-')) {
      const accId = adminTab.replace('rekening-', '');
      const acc = accounts.find((a) => a.id === accId);
      return acc ? `Rincian Kas — ${acc.name}` : 'Rincian Rekening';
    }
    if (adminTab === 'riwayat-kas') return 'Riwayat Kas & Pembukuan';
    if (adminTab === 'jadwal') return 'Jadwal Imam & Khatib Jumat';
    if (adminTab === 'daftar-hadir') return 'Daftar Hadir Rapat & Notulensi';
    if (adminTab === 'qurban') return 'Peserta Qurban & Hewan Qurban';
    if (adminTab === 'kategori-kas') return 'Kategori Kas & Anggaran';
    if (adminTab === 'kelola-rekening') return 'Kelola Rekening & Transfer';
    if (adminTab === 'aset') return 'Inventaris Aset & Peminjaman';
    if (adminTab === 'whatsapp-hub') return 'Pusat Notifikasi & Generator WhatsApp';
    if (adminTab === 'storage-health') return 'Kesehatan Memori & Cadangan Data';
    if (adminTab === 'audit') return 'Log Audit Transaksi Digital';
    if (adminTab === 'reset-data') return 'Reset & Pembersihan Data';
    return 'Manajemen Masjid';
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. TV DIGITAL DISPLAY MODE */}
      {currentMode === 'tv' && (
        <div className="relative flex-1 bg-slate-950 text-slate-100">
          <TvDigitalDisplay
            profile={profile}
            accounts={accounts}
            transactions={transactions}
            onOpenLogin={() => setShowLoginModal(true)}
            onOpenDashboard={() => setCurrentMode('admin')}
            isLoggedIn={Boolean(currentUser)}
          />

          {/* Floating Button on TV mode to return to Admin */}
          <div className="fixed bottom-3 right-3 z-40 flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <button
              onClick={handleRequestAdminAccess}
              className="px-4 py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-2 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Kembali ke Menu Admin ({profile.name})</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. ADMIN DASHBOARD MODE (Sidebar Layout Matching Screenshot) */}
      {currentMode === 'admin' && currentUser && (
        <div className="flex-1 flex h-screen overflow-hidden bg-slate-100">
          {/* DESKTOP SIDEBAR (Matches IMG_20260919_085123.jpg) */}
          <div className="hidden md:block h-full shrink-0">
            <Sidebar
              currentTab={adminTab}
              onSelectTab={(tab) => setAdminTab(tab)}
              profile={profile}
              currentUser={currentUser}
              accounts={accounts}
              onOpenSettings={handleOpenSettings}
              onOpenTv={() => setCurrentMode('tv')}
              onLogout={handleLogout}
            />
          </div>

          {/* MOBILE SIDEBAR DRAWER OVERLAY */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
                <Sidebar
                  currentTab={adminTab}
                  onSelectTab={(tab) => {
                    setAdminTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  profile={profile}
                  currentUser={currentUser}
                  accounts={accounts}
                  onOpenSettings={(tab) => {
                    handleOpenSettings(tab);
                    setMobileMenuOpen(false);
                  }}
                  onOpenTv={() => {
                    setCurrentMode('tv');
                    setMobileMenuOpen(false);
                  }}
                  onLogout={handleLogout}
                  onCloseMobile={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Bar Header */}
            <header className="no-print bg-white border-b border-slate-200/90 px-4 sm:px-6 py-3 shrink-0 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                {/* Mobile Hamburger Toggle Button */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
                  title="Buka Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div>
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    {getPageTitle()}
                  </h1>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    {profile.name} • Sistem Kas Masjid Transparan & Aman
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2.5">
                {/* Google Drive Status Pill */}
                <span className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 shadow-xs">
                  <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Google Drive Terhubung</span>
                </span>

                {/* Switch to TV Display Mode */}
                <button
                  onClick={() => setCurrentMode('tv')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  title="Lihat Tampilan Layar Mading Smart TV"
                >
                  <Tv className="w-4 h-4" />
                  <span className="hidden sm:inline">Mode Layar TV</span>
                  <span className="sm:hidden">TV</span>
                </button>

                {/* Audit Log shortcut */}
                <button
                  onClick={() => setAdminTab('audit')}
                  className={`p-2 rounded-xl border text-xs transition-colors ${
                    adminTab === 'audit'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Log Audit Keamanan"
                >
                  <ShieldAlert className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Scrollable Main Content Body */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-slate-100/70">
              <div className="max-w-7xl mx-auto">
                {/* 1. DASHBOARD */}
                {adminTab === 'dashboard' && (
                  <DashboardOverview
                    profile={profile}
                    accounts={accounts}
                    transactions={transactions}
                    duties={duties}
                    meetings={meetings}
                    currentUser={currentUser}
                    onNavigateTab={(tabKey) => setAdminTab(tabKey)}
                    onOpenTv={() => setCurrentMode('tv')}
                    onOpenSettings={handleOpenSettings}
                  />
                )}

                {/* 2. RINCIAN PER REKENING (e.g. rekening-acc-utama, rekening-acc-renovasi) */}
                {adminTab.startsWith('rekening-') && (
                  (() => {
                    const accId = adminTab.replace('rekening-', '');
                    const selectedAcc = accounts.find((a) => a.id === accId) || accounts[0];
                    return (
                      <AccountDetailView
                        account={selectedAcc}
                        allAccounts={accounts}
                        transactions={transactions}
                        currentUser={currentUser}
                        profile={profile}
                        onUpdateTransactions={handleUpdateCash}
                        onOpenAddTrx={(accountId, type) => {
                          setAdminTab('riwayat-kas');
                        }}
                        onOpenTransfer={() => setAdminTab('kelola-rekening')}
                      />
                    );
                  })()
                )}

                {/* 3. RIWAYAT KAS */}
                {adminTab === 'riwayat-kas' && (
                  <KasManager
                    profile={profile}
                    accounts={accounts}
                    transactions={transactions}
                    currentUser={currentUser}
                    onUpdateTransactions={handleUpdateCash}
                  />
                )}

                {/* 4. JADWAL IMAM & KHATIB */}
                {adminTab === 'jadwal' && (
                  <JadwalPetugas
                    duties={duties}
                    profile={profile}
                    currentUser={currentUser}
                    onUpdateDuties={handleUpdateDuties}
                  />
                )}

                {/* 5. DAFTAR HADIR (Active in User's Reference Screenshot) */}
                {adminTab === 'daftar-hadir' && (
                  <DaftarHadirRapat
                    meetings={meetings}
                    profile={profile}
                    currentUser={currentUser}
                    onUpdateMeetings={handleUpdateMeetings}
                  />
                )}

                {/* 6. PESERTA QURBAN */}
                {adminTab === 'qurban' && (
                  <ManajemenQurban
                    qurbanList={qurbanList}
                    profile={profile}
                    currentUser={currentUser}
                    accounts={accounts}
                    transactions={transactions}
                    onUpdateQurban={handleUpdateQurban}
                    onUpdateCash={handleUpdateCash}
                  />
                )}

                {/* 7. KATEGORI KAS */}
                {adminTab === 'kategori-kas' && (
                  <KategoriKasManager
                    transactions={transactions}
                    accounts={accounts}
                    currentUser={currentUser}
                    onNavigateToKasCategory={(category) => setAdminTab('riwayat-kas')}
                  />
                )}

                {/* 8. KELOLA REKENING */}
                {adminTab === 'kelola-rekening' && (
                  <KelolaRekeningManager
                    accounts={accounts}
                    transactions={transactions}
                    currentUser={currentUser}
                    onUpdateAccounts={(newAccs, newTx) => handleUpdateCash(newTx, newAccs)}
                    onSelectAccountTab={(accId) => setAdminTab(`rekening-${accId}`)}
                  />
                )}

                {/* 9. INVENTARIS ASET */}
                {adminTab === 'aset' && (
                  <InventarisAset
                    assets={assets}
                    loans={loans}
                    profile={profile}
                    currentUser={currentUser}
                    onUpdateAssets={handleUpdateAssets}
                  />
                )}

                {/* 10. PUSAT NOTIFIKASI WHATSAPP */}
                {adminTab === 'whatsapp-hub' && (
                  <WhatsAppHub
                    profile={profile}
                    duties={duties}
                    accounts={accounts}
                    transactions={transactions}
                    loans={loans}
                    qurbanList={qurbanList}
                    currentUser={currentUser}
                  />
                )}

                {/* 11. KESEHATAN PENYIMPANAN & CADANGAN */}
                {adminTab === 'storage-health' && (
                  <StorageHealthManager
                    profile={profile}
                    currentUser={currentUser}
                    onDataRestored={handleRestoreData}
                  />
                )}

                {/* 12. LOG AUDIT */}
                {adminTab === 'audit' && (
                  <AuditTrail logs={logs} currentUser={currentUser} />
                )}

                {/* 11. RESET DATA */}
                {adminTab === 'reset-data' && (
                  <ResetDataManager
                    profile={profile}
                    accounts={accounts}
                    transactions={transactions}
                    meetings={meetings}
                    qurbanList={qurbanList}
                    duties={duties}
                    loans={loans}
                    logs={logs}
                    currentUser={currentUser}
                    onDataReset={handleRestoreData}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <LoginModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && currentUser && (
        <SettingsModal
          profile={profile}
          currentUser={currentUser}
          initialTab={settingsInitialTab}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setShowSettingsModal(false)}
          onRestoreData={handleRestoreData}
          accounts={accounts}
          transactions={transactions}
          onUpdateAccounts={(newAccs, newTxs) => handleUpdateCash(newTxs, newAccs)}
          onNavigateToRekening={() => {
            setShowSettingsModal(false);
            setAdminTab('kelola-rekening');
          }}
          onNavigateToAset={() => {
            setShowSettingsModal(false);
            setAdminTab('aset');
          }}
        />
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={showLogoutConfirm}
        title="Keluar dari Sistem Admin"
        message="Apakah Anda yakin ingin keluar dari sistem admin masjid? Tampilan layar akan otomatis dialihkan ke Mode Mading Smart TV."
        confirmLabel="Ya, Keluar Sistem"
        isDanger={false}
        onConfirm={() => {
          setCurrentUser(null);
          setCurrentMode('tv');
          setShowLogoutConfirm(false);
        }}
        onClose={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
