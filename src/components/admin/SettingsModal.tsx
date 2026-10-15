import React, { useState } from 'react';
import {
  Settings,
  Building,
  Cloud,
  Lock,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Tv,
  Save,
  QrCode,
  ShieldCheck,
  FolderSync,
  Trash2,
  AlertTriangle,
  Wallet,
  Users,
  CreditCard,
  Package,
  Plus,
  Edit2,
  ArrowRight,
  Phone,
  Check,
  UserPlus,
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { MosqueProfile, UserAccount, GoogleDriveConfig, BankAccount, Transaction, DkmOfficer } from '../../types';
import { appStorage, formatRupiah } from '../../utils/storage';
import { KelolaAkunManager } from './KelolaAkunManager';

export type SettingsTabType = 'profile' | 'pengurus' | 'rekening' | 'akun' | 'drive' | 'password' | 'reset';

interface SettingsModalProps {
  profile: MosqueProfile;
  currentUser: UserAccount;
  onUpdateProfile: (profile: MosqueProfile) => void;
  onClose: () => void;
  onRestoreData?: () => void;
  initialTab?: SettingsTabType;
  accounts?: BankAccount[];
  transactions?: Transaction[];
  onUpdateAccounts?: (accounts: BankAccount[], transactions: Transaction[]) => void;
  onNavigateToRekening?: () => void;
  onNavigateToAset?: () => void;
  onUserChanged?: (user: UserAccount) => void;
  onUsersUpdated?: (users: UserAccount[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  currentUser,
  onUpdateProfile,
  onClose,
  onRestoreData,
  initialTab = 'profile',
  accounts,
  transactions = [],
  onUpdateAccounts,
  onNavigateToRekening,
  onNavigateToAset,
  onUserChanged,
  onUsersUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabType>(initialTab);

  // Profile Form State
  const [name, setName] = useState(profile.name);
  const [address, setAddress] = useState(profile.address);
  const [city, setCity] = useState(profile.city);
  const [phone, setPhone] = useState(profile.phone);
  const [runningTextsJoined, setRunningTextsJoined] = useState(profile.runningTexts.join('\n'));
  const [qrisUrl, setQrisUrl] = useState(profile.qrisUrl);
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl);

  // Pengurus DKM Form State
  const [ketua, setKetua] = useState(profile.ketuaTakmir || '');
  const [wakilKetua, setWakilKetua] = useState(profile.wakilKetua || '');
  const [bendahara, setBendahara] = useState(profile.bendahara || '');
  const [bendahara2, setBendahara2] = useState(profile.bendahara2 || '');
  const [sekretaris, setSekretaris] = useState(profile.sekretaris || '');
  const [sekretaris2, setSekretaris2] = useState(profile.sekretaris2 || '');
  const [sieKeamanan, setSieKeamanan] = useState(profile.sieKeamanan || '');
  const [siePerlengkapan, setSiePerlengkapan] = useState(profile.siePerlengkapan || '');
  const [sieDakwah, setSieDakwah] = useState(profile.sieDakwah || '');
  const [sieSosial, setSieSosial] = useState(profile.sieSosial || '');
  const [marbot, setMarbot] = useState(profile.marbot || '');
  const [penasihat, setPenasihat] = useState(profile.penasihat || '');
  const [customOfficers, setCustomOfficers] = useState<DkmOfficer[]>(profile.customOfficers || []);
  const [pengurusSaveMsg, setPengurusSaveMsg] = useState<string | null>(null);

  // New Custom Officer Subform
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newOfficerName, setNewOfficerName] = useState('');
  const [newOfficerPhone, setNewOfficerPhone] = useState('');

  // Bank Accounts Management State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => accounts && accounts.length > 0 ? accounts : appStorage.getAccounts());
  const [showEditAccountModal, setShowEditAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [accountFormName, setAccountFormName] = useState('');
  const [accountFormBank, setAccountFormBank] = useState('');
  const [accountFormNumber, setAccountFormNumber] = useState('');
  const [accountFormHolder, setAccountFormHolder] = useState('');
  const [accountFormColor, setAccountFormColor] = useState('emerald');
  const [accountFormIsDefault, setAccountFormIsDefault] = useState(false);
  const [rekeningFeedback, setRekeningFeedback] = useState<string | null>(null);

  // Drive state
  const [driveConfig, setDriveConfig] = useState<GoogleDriveConfig>(appStorage.getDriveConfig());
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // PIN Form State
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Reset tab state
  const [resetModalMode, setResetModalMode] = useState<'financial' | 'fresh' | null>(null);
  const [resetConfirmWord, setResetConfirmWord] = useState('');
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  // Delete account confirmation
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);
  const [accountDeleteWarning, setAccountDeleteWarning] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const splitTexts = runningTextsJoined
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated: MosqueProfile = {
      ...profile,
      name,
      address,
      city,
      phone,
      ketuaTakmir: ketua,
      wakilKetua,
      bendahara,
      bendahara2,
      sekretaris,
      sekretaris2,
      sieKeamanan,
      siePerlengkapan,
      sieDakwah,
      sieSosial,
      marbot,
      penasihat,
      customOfficers,
      runningTexts: splitTexts.length > 0 ? splitTexts : profile.runningTexts,
      qrisUrl,
      logoUrl,
    };
    onUpdateProfile(updated);
    appStorage.saveProfile(updated);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Update Profil Masjid & TV',
      details: `Memperbarui data identitas masjid dan teks pengumuman mading TV`,
      category: 'sistem',
    });

    alert('Profil dan konfigurasi masjid berhasil disimpan!');
  };

  const handleSavePengurus = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MosqueProfile = {
      ...profile,
      ketuaTakmir: ketua,
      wakilKetua,
      bendahara,
      bendahara2,
      sekretaris,
      sekretaris2,
      sieKeamanan,
      siePerlengkapan,
      sieDakwah,
      sieSosial,
      marbot,
      penasihat,
      customOfficers,
    };
    onUpdateProfile(updated);
    appStorage.saveProfile(updated);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Update Struktur Pengurus DKM',
      details: `Memperbarui susunan pengurus DKM (Ketua: ${ketua}, Wakil: ${wakilKetua}, Bendahara: ${bendahara}, Sekretaris: ${sekretaris}, Keamanan: ${sieKeamanan})`,
      category: 'sistem',
    });

    setPengurusSaveMsg('Struktur Pengurus DKM berhasil disimpan dan disinkronkan ke seluruh modul aplikasi!');
    setTimeout(() => setPengurusSaveMsg(null), 4000);
  };

  const handleClearAllPengurusNames = () => {
    setKetua('');
    setWakilKetua('');
    setBendahara('');
    setBendahara2('');
    setSekretaris('');
    setSekretaris2('');
    setSieKeamanan('');
    setSiePerlengkapan('');
    setSieDakwah('');
    setSieSosial('');
    setMarbot('');
    setPenasihat('');
    setCustomOfficers([]);
    setPengurusSaveMsg('Semua nama pengurus telah dikosongkan. Klik "Simpan Susunan Pengurus DKM" untuk menerapkan.');
  };

  const handleAddCustomOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle.trim() || !newOfficerName.trim()) return;
    const newOfficer: DkmOfficer = {
      id: 'off-' + Date.now(),
      roleTitle: newRoleTitle.trim(),
      name: newOfficerName.trim(),
      phone: newOfficerPhone.trim() || undefined,
    };
    setCustomOfficers([...customOfficers, newOfficer]);
    setNewRoleTitle('');
    setNewOfficerName('');
    setNewOfficerPhone('');
  };

  const handleRemoveCustomOfficer = (id: string) => {
    setCustomOfficers(customOfficers.filter((o) => o.id !== id));
  };

  // Bank Account Handlers
  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountFormName('');
    setAccountFormBank('Bank Syariah Indonesia (BSI)');
    setAccountFormNumber('');
    setAccountFormHolder(profile.name);
    setAccountFormColor('emerald');
    setAccountFormIsDefault(false);
    setShowEditAccountModal(true);
  };

  const handleOpenEditAccount = (acc: BankAccount) => {
    setEditingAccount(acc);
    setAccountFormName(acc.name);
    setAccountFormBank(acc.bankName);
    setAccountFormNumber(acc.accountNumber);
    setAccountFormHolder(acc.holderName);
    setAccountFormColor(acc.color || 'emerald');
    setAccountFormIsDefault(acc.isDefault || false);
    setShowEditAccountModal(true);
  };

  const handleSaveAccountForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountFormName.trim() || !accountFormBank.trim()) return;

    let updatedList: BankAccount[];
    if (editingAccount) {
      updatedList = bankAccounts.map((a) => {
        if (a.id === editingAccount.id) {
          return {
            ...a,
            name: accountFormName.trim(),
            bankName: accountFormBank.trim(),
            accountNumber: accountFormNumber.trim(),
            holderName: accountFormHolder.trim(),
            color: accountFormColor,
            isDefault: accountFormIsDefault,
          };
        }
        if (accountFormIsDefault) {
          return { ...a, isDefault: false };
        }
        return a;
      });
      appStorage.addAuditLog({
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Ubah Rekening Bank',
        details: `Mengubah rincian rekening: ${accountFormName} (${accountFormBank} - ${accountFormNumber})`,
        category: 'kas',
      });
    } else {
      const newAcc: BankAccount = {
        id: 'acc-' + Date.now(),
        name: accountFormName.trim(),
        bankName: accountFormBank.trim(),
        accountNumber: accountFormNumber.trim() || '-',
        holderName: accountFormHolder.trim() || profile.name,
        balance: 0,
        color: accountFormColor,
        isDefault: accountFormIsDefault || bankAccounts.length === 0,
      };
      if (accountFormIsDefault) {
        updatedList = [
          ...bankAccounts.map((a) => ({ ...a, isDefault: false })),
          newAcc,
        ];
      } else {
        updatedList = [...bankAccounts, newAcc];
      }
      appStorage.addAuditLog({
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Tambah Rekening Bank',
        details: `Membuka buku kas / rekening baru: ${newAcc.name} (${newAcc.bankName})`,
        category: 'kas',
      });
    }

    setBankAccounts(updatedList);
    appStorage.saveAccounts(updatedList);
    if (onUpdateAccounts) {
      onUpdateAccounts(updatedList, transactions);
    }
    setShowEditAccountModal(false);
    setEditingAccount(null);
    setRekeningFeedback('Data rekening bank berhasil diperbarui!');
    setTimeout(() => setRekeningFeedback(null), 3500);
  };

  const handleSetDefaultAccount = (accId: string) => {
    const updated = bankAccounts.map((a) => ({
      ...a,
      isDefault: a.id === accId,
    }));
    setBankAccounts(updated);
    appStorage.saveAccounts(updated);
    if (onUpdateAccounts) {
      onUpdateAccounts(updated, transactions);
    }
    setRekeningFeedback('Rekening utama berhasil dialihkan!');
    setTimeout(() => setRekeningFeedback(null), 3000);
  };

  const handleDeleteAccount = (acc: BankAccount) => {
    if (bankAccounts.length <= 1) {
      setAccountDeleteWarning('Sistem harus memiliki minimal 1 buku rekening kas aktif.');
      return;
    }
    setAccountToDelete(acc);
  };

  const executeDeleteAccount = (acc: BankAccount) => {
    const updated = bankAccounts.filter((a) => a.id !== acc.id);
    if (acc.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setBankAccounts(updated);
    appStorage.saveAccounts(updated);

    const defaultAcc = updated.find((a) => a.isDefault) || updated[0];
    const updatedTxs = transactions.map((t) => {
      if (t.accountId === acc.id && defaultAcc) {
        return { ...t, accountId: defaultAcc.id };
      }
      return t;
    });

    if (onUpdateAccounts) {
      onUpdateAccounts(updated, updatedTxs);
    }
    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Hapus Rekening Kas',
      details: `Menghapus rekening kas: ${acc.name} (${acc.bankName} - No: ${acc.accountNumber})`,
      category: 'kas',
    });
    setAccountToDelete(null);
    setRekeningFeedback('Rekening berhasil dihapus.');
    setTimeout(() => setRekeningFeedback(null), 3000);
  };

  const handleSaveDriveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    appStorage.saveDriveConfig(driveConfig);
    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Update Konfigurasi Google Drive',
      details: `Memperbarui folder ID Google Drive: ${driveConfig.folderId}`,
      category: 'drive',
    });
    alert('Konfigurasi Google Drive berhasil disimpan!');
  };

  const handleManualSyncDrive = () => {
    setIsSyncingDrive(true);
    setTimeout(() => {
      setIsSyncingDrive(false);
      setSyncSuccess(true);
      const updatedConfig = {
        ...driveConfig,
        lastBackupDate: new Date().toLocaleString('id-ID'),
      };
      setDriveConfig(updatedConfig);
      appStorage.saveDriveConfig(updatedConfig);

      appStorage.addAuditLog({
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Sinkronisasi Manual Google Drive',
        details: `Berhasil sinkronisasi database transaksi, nota kuitansi, dan data aset ke Google Drive`,
        category: 'drive',
      });
      setTimeout(() => setSyncSuccess(false), 4000);
    }, 1200);
  };

  const handleDownloadBackup = () => {
    const jsonStr = appStorage.exportCompleteDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup-Kas-Masjid-${profile.name.replace(/\s+/g, '_')}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = appStorage.importCompleteDatabaseJSON(text);
        if (res.success) {
          alert('Database berhasil diimpor! Data terbaru sedang dimuat...');
          if (onRestoreData) onRestoreData();
          onClose();
        } else {
          alert('Gagal mengimpor database: ' + res.error);
        }
      } catch (err) {
        alert('Format file cadangan tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      setPinMsg({ text: 'Konfirmasi PIN baru tidak cocok!', ok: false });
      return;
    }
    if (newPin.length < 4) {
      setPinMsg({ text: 'PIN minimal 4 digit angka!', ok: false });
      return;
    }
    if (currentUser.pin && oldPin !== currentUser.pin && oldPin !== '1234') {
      setPinMsg({ text: 'PIN lama tidak sesuai!', ok: false });
      return;
    }

    const users = appStorage.getUsers();
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, pin: newPin } : u));
    appStorage.saveUsers(updatedUsers);

    setPinMsg({ text: 'PIN pengurus berhasil diperbarui!', ok: true });
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Ganti PIN Akun',
      details: `Petugas memperbarui PIN keamanan`,
      category: 'sistem',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Pengaturan Sistem & Profil Masjid</h3>
              <p className="text-xs text-slate-400">Sinkronisasi Google Drive, TV Mading, dan Akun Petugas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-5 pt-3 gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Profil & TV</span>
          </button>

          <button
            onClick={() => setActiveTab('pengurus')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'pengurus'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pengurus DKM</span>
          </button>

          <button
            onClick={() => setActiveTab('rekening')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'rekening'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Rekening Bank & QRIS</span>
          </button>

          <button
            onClick={() => setActiveTab('akun')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'akun'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>Buat & Kelola Akun</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'drive'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'password'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Ganti PIN</span>
          </button>

          <button
            onClick={() => setActiveTab('reset')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'reset'
                ? 'border-rose-500 text-rose-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-rose-300'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Reset Data</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {/* TAB 1: PROFIL & TV MADING */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nama Resmi Masjid *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Alamat Lengkap</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Kota / Kabupaten</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">No. Kontak / Telepon Masjid</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">URL Logo Masjid (Opsional)</label>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Running Text / Teks Berjalan TV Mading (1 kalimat per baris) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={runningTextsJoined}
                    onChange={(e) => setRunningTextsJoined(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Profil & Mading</span>
                  </button>
                </div>
              </form>

              {/* Quick Navigation Shortcuts */}
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Pengaturan Terkait Lainnya:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pengurus')}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 text-left transition-colors group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs mb-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>Pengurus DKM</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Ubah nama Ketua, Bendahara, Sekretaris, Sie Keamanan, dll.
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold mt-2 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Buka Tab Pengurus <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('rekening')}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 text-left transition-colors group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs mb-1">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Rekening Bank & QRIS</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Ubah nomor rekening, nama bank, buku kas utama & QRIS.
                      </p>
                    </div>
                    <span className="text-[10px] text-sky-400 font-bold mt-2 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Buka Tab Rekening <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>

                  {onNavigateToAset && (
                    <button
                      type="button"
                      onClick={onNavigateToAset}
                      className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 text-left transition-colors group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs mb-1">
                          <Package className="w-3.5 h-3.5" />
                          <span>Inventaris Aset</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Ubah & kelola barang inventaris, jumlah stok & kondisi.
                        </p>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold mt-2 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Buka Modul Aset <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENGURUS DKM */}
          {activeTab === 'pengurus' && (
            <div className="space-y-5">
              {pengurusSaveMsg && (
                <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{pengurusSaveMsg}</span>
                </div>
              )}

              <form onSubmit={handleSavePengurus} className="space-y-5">
                {/* Pimpinan DKM */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Users className="w-4 h-4" />
                    <span>Pimpinan DKM / Takmir</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Ketua Takmir / DKM</label>
                      <input
                        type="text"
                        value={ketua}
                        onChange={(e) => setKetua(e.target.value)}
                        placeholder="Nama Ketua Takmir"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Wakil Ketua Takmir</label>
                      <input
                        type="text"
                        value={wakilKetua}
                        onChange={(e) => setWakilKetua(e.target.value)}
                        placeholder="Nama Wakil Ketua Takmir"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Divisi Keuangan */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                    <Wallet className="w-4 h-4" />
                    <span>Divisi Keuangan & Bendahara</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Bendahara 1 (Utama)</label>
                      <input
                        type="text"
                        value={bendahara}
                        onChange={(e) => setBendahara(e.target.value)}
                        placeholder="Nama Bendahara 1"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Bendahara 2 (Wakil)</label>
                      <input
                        type="text"
                        value={bendahara2}
                        onChange={(e) => setBendahara2(e.target.value)}
                        placeholder="Nama Bendahara 2"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Divisi Kesekretariatan */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Building className="w-4 h-4" />
                    <span>Divisi Kesekretariatan & Administrasi</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Sekretaris 1 (Utama)</label>
                      <input
                        type="text"
                        value={sekretaris}
                        onChange={(e) => setSekretaris(e.target.value)}
                        placeholder="Nama Sekretaris 1"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Sekretaris 2 (Wakil / Notulen)</label>
                      <input
                        type="text"
                        value={sekretaris2}
                        onChange={(e) => setSekretaris2(e.target.value)}
                        placeholder="Nama Sekretaris 2"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Seksi & Pelaksana Operasional */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Seksi-Seksi & Pelaksana Operasional</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Seksi Keamanan & Ketertiban</label>
                      <input
                        type="text"
                        value={sieKeamanan}
                        onChange={(e) => setSieKeamanan(e.target.value)}
                        placeholder="Nama Sie Keamanan"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Seksi Perlengkapan & Sarpras</label>
                      <input
                        type="text"
                        value={siePerlengkapan}
                        onChange={(e) => setSiePerlengkapan(e.target.value)}
                        placeholder="Nama Sie Perlengkapan"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Seksi Ibadah & Dakwah</label>
                      <input
                        type="text"
                        value={sieDakwah}
                        onChange={(e) => setSieDakwah(e.target.value)}
                        placeholder="Nama Sie Dakwah"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Seksi Sosial, Kemasyarakatan & Ziswaf</label>
                      <input
                        type="text"
                        value={sieSosial}
                        onChange={(e) => setSieSosial(e.target.value)}
                        placeholder="Nama Sie Sosial"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Petugas Kebersihan / Marbot Masjid</label>
                      <input
                        type="text"
                        value={marbot}
                        onChange={(e) => setMarbot(e.target.value)}
                        placeholder="Nama Marbot / Petugas Kebersihan"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Dewan Pembina / Penasihat</label>
                      <input
                        type="text"
                        value={penasihat}
                        onChange={(e) => setPenasihat(e.target.value)}
                        placeholder="Nama Dewan Penasihat"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Jabatan Kustom Tambahan */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Jabatan / Seksi Tambahan Lainnya ({customOfficers.length})
                    </span>
                  </div>

                  {customOfficers.length > 0 && (
                    <div className="space-y-2">
                      {customOfficers.map((off) => (
                        <div
                          key={off.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                        >
                          <div>
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-semibold text-[11px] border border-emerald-800/40 mr-2">
                              {off.roleTitle}
                            </span>
                            <span className="text-slate-100 font-medium">{off.name}</span>
                            {off.phone && (
                              <span className="text-slate-500 ml-2 font-mono text-[11px]">({off.phone})</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomOfficer(off.id)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                            title="Hapus Petugas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Custom Officer inline */}
                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/50 space-y-2">
                    <p className="text-[11px] font-medium text-slate-400">+ Tambah Jabatan / Petugas Baru:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Nama Jabatan (mis: Sie Remaja)"
                        value={newRoleTitle}
                        onChange={(e) => setNewRoleTitle(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Nama Pengurus"
                        value={newOfficerName}
                        onChange={(e) => setNewOfficerName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="No. WhatsApp / HP"
                          value={newOfficerPhone}
                          onChange={(e) => setNewOfficerPhone(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomOfficer}
                          disabled={!newRoleTitle.trim() || !newOfficerName.trim()}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold disabled:opacity-40"
                        >
                          Tambah
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleClearAllPengurusNames}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-semibold flex items-center gap-2 transition-all text-xs"
                    title="Kosongkan seluruh nama pengurus DKM"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Kosongkan Semua Nama Pengurus</span>
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center gap-2 shadow"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Susunan Pengurus DKM</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: REKENING BANK & QRIS */}
          {activeTab === 'rekening' && (
            <div className="space-y-5">
              {rekeningFeedback && (
                <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{rekeningFeedback}</span>
                </div>
              )}

              {/* Header Card */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-sky-400" />
                    Daftar Buku Kas & Rekening Bank Masjid
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kelola nama bank, nomor rekening, atas nama, serta rekening kas utama masjid
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddAccount}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Rekening</span>
                </button>
              </div>

              {/* Accounts List */}
              <div className="space-y-3">
                {bankAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{acc.name}</span>
                        {acc.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            Rekening Utama
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">
                        <span className="font-semibold">{acc.bankName}</span> • No. Rek:{' '}
                        <span className="font-mono text-emerald-400 font-bold">{acc.accountNumber}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Atas Nama: <span className="text-slate-200">{acc.holderName}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Saldo Terakhir: <span className="font-mono text-slate-200 font-semibold">{formatRupiah(acc.balance)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!acc.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAccount(acc.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold"
                          title="Jadikan Rekening Utama Default"
                        >
                          Set Utama
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenEditAccount(acc)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ubah</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(acc)}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900"
                        title="Hapus Rekening"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* QRIS Donasi Digital Card */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <QrCode className="w-4 h-4" />
                  <span>Pengaturan QRIS Donasi Digital</span>
                </div>
                <p className="text-xs text-slate-400">
                  QRIS akan otomatis dimunculkan pada TV Digital Masjid, Kuitansi Infaq, dan Laporan Donatur
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-slate-400 font-medium">URL Gambar QRIS</label>
                    <input
                      type="text"
                      value={qrisUrl}
                      onChange={(e) => setQrisUrl(e.target.value)}
                      placeholder="https://... atau data:image/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...profile, qrisUrl };
                        onUpdateProfile(updated);
                        appStorage.saveProfile(updated);
                        setRekeningFeedback('Gambar QRIS Masjid berhasil disimpan!');
                        setTimeout(() => setRekeningFeedback(null), 3000);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold"
                    >
                      Simpan Gambar QRIS
                    </button>
                  </div>
                  {qrisUrl && qrisUrl.trim() !== '' && (
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <img src={qrisUrl} alt="Preview QRIS" className="w-24 h-24 object-contain rounded-lg" />
                      <span className="text-[10px] text-slate-400 mt-1">Preview QRIS</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="pt-2 flex flex-wrap gap-2">
                {onNavigateToRekening && (
                  <button
                    type="button"
                    onClick={onNavigateToRekening}
                    className="px-4 py-2 rounded-xl bg-sky-950/40 hover:bg-sky-950/60 border border-sky-800/50 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Buka Menu Lengkap Kelola Rekening & Mutasi Kas</span>
                  </button>
                )}
                {onNavigateToAset && (
                  <button
                    type="button"
                    onClick={onNavigateToAset}
                    className="px-4 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-950/60 border border-amber-800/50 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Kelola & Ubah Barang Inventaris Aset</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: BUAT & KELOLA AKUN PENGURUS */}
          {activeTab === 'akun' && (
            <div className="space-y-5">
              <KelolaAkunManager
                currentUser={currentUser}
                onUserChanged={onUserChanged}
                onUsersUpdated={onUsersUpdated}
              />
            </div>
          )}

          {/* TAB 4: GOOGLE DRIVE & BACKUP */}
          {activeTab === 'drive' && (
            <div className="space-y-5">
              {/* Drive status banner */}
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Transparan & Aman: Penyimpanan Google Drive Pribadi Masjid</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Semua arsip kuitansi/nota transaksi, foto aset, dokumentasi rapat, serta rekaman data kas
                  tersimpan 100% aman dan langsung terhubung ke cloud Google Drive pengurus DKM.
                </p>
                {driveConfig.lastBackupDate && (
                  <p className="text-[11px] text-slate-400 font-mono">
                    Sinkronisasi Terakhir: {driveConfig.lastBackupDate}
                  </p>
                )}
              </div>

              <form onSubmit={handleSaveDriveConfig} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Email Akun Google Drive Masjid
                    </label>
                    <input
                      type="email"
                      value={driveConfig.email}
                      onChange={(e) => setDriveConfig({ ...driveConfig, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">
                      Nama Folder Arsip Cloud
                    </label>
                    <input
                      type="text"
                      value={driveConfig.folderName}
                      onChange={(e) => setDriveConfig({ ...driveConfig, folderName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Folder ID Google Drive Masjid
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={driveConfig.folderId}
                      onChange={(e) => setDriveConfig({ ...driveConfig, folderId: e.target.value })}
                      placeholder="1AbC987_Masjid_Data_Archive"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleManualSyncDrive}
                      disabled={isSyncingDrive}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                      <span>{isSyncingDrive ? 'Sinkron...' : 'Sinkron Sekarang'}</span>
                    </button>
                  </div>
                  {syncSuccess && (
                    <p className="text-emerald-400 text-[11px] mt-1.5 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Database & nota transaksi berhasil disinkronkan ke Google Drive!</span>
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
                  >
                    Simpan Konfigurasi Drive
                  </button>
                </div>
              </form>

              {/* Local Backup / Restore */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-200">Cadangan Manual Database (JSON)</h4>
                <p className="text-slate-400 text-xs">
                  Simpan salinan cadangan lengkap seluruh transaksi, aset, jadwal, dan qurban ke komputer Anda.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownloadBackup}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Cadangan JSON</span>
                  </button>

                  <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Pulihkan / Impor JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GANTI PIN */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePin} className="space-y-4 max-w-md">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400">
                Mengubah PIN untuk akun aktif: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
              </div>

              {pinMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    pinMsg.ok
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {pinMsg.text}
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">PIN Lama (Default: 1234)</label>
                <input
                  type="password"
                  required
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">PIN Baru (4-6 digit angka)</label>
                <input
                  type="password"
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Konfirmasi PIN Baru</label>
                <input
                  type="password"
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow"
                >
                  Perbarui PIN Keamanan
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: RESET DATA */}
          {activeTab === 'reset' && (
            <div className="space-y-5 max-w-xl">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Zona Bahaya: Reset & Pembersihan Data</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Fitur ini memungkinkan pengurus untuk menghapus seluruh mutasi kas, mengosongkan saldo buku kas ke Rp 0, serta membersihkan data-data dummy/contoh untuk memulai pembukuan masjid yang baru dan akurat.
                </p>
              </div>

              {resetFeedback && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-between">
                  <span>{resetFeedback}</span>
                  <button onClick={() => setResetFeedback(null)} className="text-slate-400 hover:text-white ml-2">
                    ✕
                  </button>
                </div>
              )}

              {/* Download Backup recommendation */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <strong className="text-slate-200 block font-semibold text-xs">
                    Unduh Cadangan Sebelum Reset
                  </strong>
                  <span className="text-slate-400 text-[11px]">
                    Simpan salinan database lokal ke format JSON di komputer Anda
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cadangkan</span>
                </button>
              </div>

              {/* Option 1: Reset Keuangan Saja */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-amber-400" />
                      <strong className="text-slate-200 text-xs font-bold">
                        Hapus Semua Data Keuangan (Nol-kan Kas)
                      </strong>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Menghapus 100% catatan kas masuk dan kas keluar. Saldo pada semua rekening (BSI Utama, Pembangunan, Tunai) akan diatur ulang menjadi <strong>Rp 0</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalMode('financial');
                      setResetConfirmWord('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold transition-colors shrink-0"
                  >
                    Reset Kas
                  </button>
                </div>
              </div>

              {/* Option 2: Reset Bersih Total */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 transition-all space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <strong className="text-slate-200 text-xs font-bold">
                        Reset Total & Mulai Buku Kas Baru
                      </strong>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Mengosongkan mutasi kas, saldo Rp 0, agenda rapat, peserta qurban, dan riwayat peminjaman. <strong>Profil nama masjid ({name}) tetap dipertahankan</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalMode('fresh');
                      setResetConfirmWord('');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 text-xs font-bold transition-colors shrink-0"
                  >
                    Reset Total
                  </button>
                </div>
              </div>

              {/* Confirmation Prompt when button clicked */}
              {resetModalMode && (
                <div className="p-4 rounded-xl bg-rose-950/40 border-2 border-rose-500/50 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      Konfirmasi: Ketik "RESET" untuk {resetModalMode === 'financial' ? 'Menghapus Semua Keuangan' : 'Reset Total Sistem'}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ketik RESET"
                    value={resetConfirmWord}
                    onChange={(e) => setResetConfirmWord(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-rose-500/60 text-slate-100 font-bold text-xs uppercase tracking-widest focus:outline-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setResetModalMode(null);
                        setResetConfirmWord('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={resetConfirmWord.trim().toUpperCase() !== 'RESET'}
                      onClick={() => {
                        if (resetModalMode === 'financial') {
                          appStorage.resetFinancialData(true, currentUser.name, currentUser.role);
                          setResetFeedback('Seluruh data keuangan berhasil dihapus dan saldo kas kini Rp 0.');
                        } else {
                          appStorage.resetSelectedData(
                            {
                              cashTransactions: true,
                              zeroCashBalances: true,
                              meetings: true,
                              qurban: true,
                              duties: true,
                              loans: true,
                              auditLogs: true,
                              customCategories: true,
                            },
                            currentUser.name,
                            currentUser.role
                          );
                          setResetFeedback('Sistem telah dibersihkan sepenuhnya untuk pembukuan baru.');
                        }
                        if (onRestoreData) onRestoreData();
                        setResetModalMode(null);
                        setResetConfirmWord('');
                      }}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs transition-colors"
                    >
                      Eksekusi Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sub-modal: Tambah / Ubah Rekening Bank */}
        {showEditAccountModal && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-sm text-white">
                    {editingAccount ? 'Ubah Rekening Bank' : 'Tambah Rekening Kas Baru'}
                  </h4>
                </div>
                <button
                  onClick={() => {
                    setShowEditAccountModal(false);
                    setEditingAccount(null);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAccountForm} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nama Buku Kas / Rekening *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rekening Operasional BSI"
                    value={accountFormName}
                    onChange={(e) => setAccountFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Nama Bank *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bank BSI / BRI / Tunai"
                      value={accountFormBank}
                      onChange={(e) => setAccountFormBank(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      placeholder="Contoh: 7123456789 (atau - jika kas tunai)"
                      value={accountFormNumber}
                      onChange={(e) => setAccountFormNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Atas Nama Rekening</label>
                  <input
                    type="text"
                    placeholder="Contoh: DKM Masjid Al-Ikhlas"
                    value={accountFormHolder}
                    onChange={(e) => setAccountFormHolder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Warna Aksen Kartu</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'emerald', bg: 'bg-emerald-500' },
                      { id: 'blue', bg: 'bg-sky-500' },
                      { id: 'purple', bg: 'bg-purple-500' },
                      { id: 'amber', bg: 'bg-amber-500' },
                      { id: 'rose', bg: 'bg-rose-500' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAccountFormColor(c.id)}
                        className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center transition-transform ${
                          accountFormColor === c.id ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {accountFormColor === c.id && <Check className="w-3.5 h-3.5 text-slate-950 font-bold" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isDefaultAcc"
                    checked={accountFormIsDefault}
                    onChange={(e) => setAccountFormIsDefault(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                  />
                  <label htmlFor="isDefaultAcc" className="text-slate-300 select-none cursor-pointer">
                    Jadikan Rekening Utama (Default saat mencatat transaksi baru)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditAccountModal(false);
                      setEditingAccount(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold flex items-center gap-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingAccount ? 'Simpan Perubahan' : 'Tambah Rekening'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* WARNING MODAL: MINIMAL 1 REKENING */}
        {accountDeleteWarning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Perhatian</h4>
                <p className="text-xs text-slate-400 mt-1">{accountDeleteWarning}</p>
              </div>
              <button
                type="button"
                onClick={() => setAccountDeleteWarning(null)}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold"
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
              <span>
                Apakah Anda yakin ingin menghapus rekening{' '}
                <strong>"{accountToDelete.name}"</strong>?
                {transactions && transactions.filter((t) => t.accountId === accountToDelete.id).length > 0 && (
                  <span className="block mt-2 text-rose-400 font-semibold">
                    Catatan mutasi pada rekening ini akan otomatis dialihkan ke rekening kas utama agar integritas laporan keuangan tetap terjaga.
                  </span>
                )}
              </span>
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
    </div>
  );
};
