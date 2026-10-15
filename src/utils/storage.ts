import {
  MosqueProfile,
  BankAccount,
  Transaction,
  DutySchedule,
  MeetingRecord,
  QurbanParticipant,
  MosqueAsset,
  AssetLoan,
  AuditLog,
  UserAccount,
  GoogleDriveConfig,
  UserRole,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'masjid_profile_v1',
  ACCOUNTS: 'masjid_accounts_v1',
  TRANSACTIONS: 'masjid_transactions_v1',
  DUTY_SCHEDULES: 'masjid_duties_v1',
  MEETINGS: 'masjid_meetings_v1',
  QURBAN: 'masjid_qurban_v1',
  ASSETS: 'masjid_assets_v1',
  LOANS: 'masjid_loans_v1',
  AUDIT_LOGS: 'masjid_audit_v1',
  USERS: 'masjid_users_v1',
  CURRENT_USER: 'masjid_current_user_v1',
  DRIVE_CONFIG: 'masjid_drive_config_v1',
};

// Default profile for Masjid Nurul Ilmi
export const DEFAULT_PROFILE: MosqueProfile = {
  name: 'Masjid Nurul Ilmi',
  address: 'Jl. H. Agus Salim No. 12, Menteng',
  city: 'Jakarta Pusat',
  province: 'DKI Jakarta',
  postalCode: '10340',
  phone: '',
  email: '',
  slogan: 'Pusat Ibadah, Kebajikan, dan Pembinaan Ummat',
  logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
  qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126590014ID.LINKAJA.WWW011893600911002150000002151234567890123455204581253033605802ID5918MASJID+NURUL+ILMI6013JAKARTA+PUSAT61051034062070703A016304ABCD',
  qrisNmid: 'ID1020304050607',
  ketuaTakmir: '',
  wakilKetua: '',
  bendahara: '',
  bendahara2: '',
  sekretaris: '',
  sekretaris2: '',
  sieKeamanan: '',
  siePerlengkapan: '',
  sieDakwah: '',
  siePeribadatan: '',
  sieSosial: '',
  sieRemaja: '',
  sieHumas: '',
  marbot: '',
  penasihat: '',
  customOfficers: [],
  runningTexts: [
    'Selamat datang di Masjid. Luruskan dan rapatkan shaf sholat demi kesempurnaan berjamaah.',
    'Kajian Rutin Ba\'da Maghrib: Tafsir Al-Qur\'an dan Hadits tematik terbuka untuk umum setiap hari Selasa.',
    'Pemberitahuan: Gerakan Infaq Beras Santri & Santunan Anak Yatim rutin dibuka setiap hari Jumat.',
    'Mohon menonaktifkan atau menyenyapkan nada dering HP selama berada di dalam ruang utama sholat.',
    'Rekening Resmi Donasi Operasional & Pembangunan telah dibuka dan tercatat transparan.'
  ],
  iqomahMinutes: {
    subuh: 15,
    dzuhur: 10,
    ashar: 10,
    maghrib: 8,
    isya: 10,
  },
  latitude: -6.1895,
  longitude: 106.8290,
  timezone: 7,
};

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-admin',
    name: '',
    role: 'admin',
    email: 'admin@masjid.id',
    phone: '',
    pin: '1234',
  },
  {
    id: 'user-bendahara',
    name: '',
    role: 'bendahara',
    email: 'bendahara@masjid.id',
    phone: '',
    pin: '1234',
  },
  {
    id: 'user-sekretaris',
    name: '',
    role: 'sekretaris',
    email: 'sekretaris@masjid.id',
    phone: '',
    pin: '1234',
  },
  {
    id: 'user-ketua',
    name: '',
    role: 'ketua_takmir',
    email: 'ketua@masjid.id',
    phone: '',
    pin: '1234',
  },
  {
    id: 'user-operator',
    name: '',
    role: 'operator_tv',
    email: 'operator@masjid.id',
    phone: '',
    pin: '1234',
  },
  {
    id: 'user-marbot',
    name: '',
    role: 'marbot',
    email: 'marbot@masjid.id',
    phone: '',
    pin: '1234',
  },
];

export const DEFAULT_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-utama',
    name: 'Rekening Utama',
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '',
    holderName: '',
    balance: 0,
    isDefault: true,
    color: '#10b981', // emerald
  },
  {
    id: 'acc-renovasi',
    name: 'Pembangunan dan Renovasi',
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '',
    holderName: '',
    balance: 0,
    color: '#f59e0b', // amber
  },
  {
    id: 'acc-tunai',
    name: 'Kas Tunai Tromol',
    bankName: 'Brankas Tunai Masjid',
    accountNumber: '',
    holderName: '',
    balance: 0,
    color: '#0284c7', // sky
  },
  {
    id: 'acc-sosial',
    name: 'Kas Zakat & Santunan Dhuafa',
    bankName: 'Bank Muamalat',
    accountNumber: '',
    holderName: '',
    balance: 0,
    color: '#8b5cf6', // purple
  },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [];

export const DEFAULT_DUTIES: DutySchedule[] = [];

export const DEFAULT_MEETINGS: MeetingRecord[] = [];

export const DEFAULT_QURBAN: QurbanParticipant[] = [];

export const DEFAULT_ASSETS: MosqueAsset[] = [];

export const DEFAULT_LOANS: AssetLoan[] = [];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [];

export const DEFAULT_DRIVE_CONFIG: GoogleDriveConfig = {
  connected: true,
  email: 'drive.masjid.alikhlas@gmail.com',
  folderName: 'Google Drive Masjid Al-Ikhlas (Data & Bukti Nota)',
  folderId: '1AbC987_Masjid_Data_Archive_Safe_Cloud_2026',
  lastBackupDate: '18 September 2026, 14:00 WIB',
  autoSync: true,
};

// Inisialisasi awal aman hanya jika data belum pernah tersimpan sama sekali di browser
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DUTY_SCHEDULES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.QURBAN, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    }
  } catch (e) {
    console.warn('Storage initial bootstrap notice:', e);
  }
}

// Generic storage getters and setters
export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

export const appStorage = {
  getProfile: () => {
    const p = loadFromStorage<MosqueProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    const merged = { ...DEFAULT_PROFILE, ...p };
    if (merged.name === 'Masjid Raya Al-Ikhlas') {
      merged.name = 'Masjid Nurul Ilmi';
    }

    // Pastikan tidak ada nama pengurus lama / dummy yang tersisa
    const legacyNames = [
      'H. Bambang Sulistyo, M.Ag',
      'Drs. H. Syamsudin Mansyur',
      'Ustadz Ahmad Fauzi, S.E.',
      'H. M. Taufik Hidayat, Ak.',
      'Muhammad Ridwan, S.Kom',
      'Agus Salim, S.Pd',
      'Kapten (Purn) Sudirman / Bpk. Yanto',
      'Pak Joko Subroto & Tim Sarpras',
      'Ustadz Dr. H. Khalid Mubarok, M.A.',
      'Hj. Maryam & Bpk. Hendra Wijaya',
      'Pak Slamet & Mas Wahyu',
      'Prof. Dr. KH. Nasaruddin Ilyas',
      'Rian Pratama, S.I.Kom',
      'Kang Ilham Maulana',
      'Pak Slamet Riyadi',
      'Fikri Haikal',
    ];

    const officerKeys = [
      'ketuaTakmir',
      'wakilKetua',
      'bendahara',
      'bendahara2',
      'sekretaris',
      'sekretaris2',
      'sieKeamanan',
      'siePerlengkapan',
      'sieDakwah',
      'siePeribadatan',
      'sieSosial',
      'sieRemaja',
      'sieHumas',
      'marbot',
      'penasihat',
    ] as const;

    let hasCleaned = false;
    officerKeys.forEach((key) => {
      if (merged[key] && legacyNames.includes(merged[key])) {
        merged[key] = '';
        hasCleaned = true;
      }
    });

    if (merged.customOfficers && merged.customOfficers.length > 0) {
      const filtered = merged.customOfficers.filter(
        (co) => !legacyNames.includes(co.name) && co.name !== 'Rian Pratama, S.I.Kom' && co.name !== 'Kang Ilham Maulana'
      );
      if (filtered.length !== merged.customOfficers.length) {
        merged.customOfficers = filtered;
        hasCleaned = true;
      }
    }

    if (hasCleaned) {
      saveToStorage(STORAGE_KEYS.PROFILE, merged);
    }

    if (!merged.logoUrl || merged.logoUrl.trim() === '') {
      merged.logoUrl = DEFAULT_PROFILE.logoUrl;
    }
    if (!merged.qrisUrl || merged.qrisUrl.trim() === '') {
      merged.qrisUrl = DEFAULT_PROFILE.qrisUrl;
    }
    return merged;
  },
  saveProfile: (p: MosqueProfile) => saveToStorage(STORAGE_KEYS.PROFILE, p),

  getUsers: () => {
    const users = loadFromStorage<UserAccount[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    if (!users || users.length === 0) {
      saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    return users;
  },
  saveUsers: (u: UserAccount[]) => saveToStorage(STORAGE_KEYS.USERS, u),

  getCurrentUser: (): UserAccount => {
    const cur = loadFromStorage<UserAccount | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (cur) return cur;
    const allUsers = appStorage.getUsers();
    return allUsers[0] || DEFAULT_USERS[0];
  },
  saveCurrentUser: (u: UserAccount) => saveToStorage(STORAGE_KEYS.CURRENT_USER, u),

  getFullState: () => ({
    profile: appStorage.getProfile(),
    accounts: appStorage.getAccounts(),
    transactions: appStorage.getTransactions(),
    duties: appStorage.getDuties(),
    meetings: appStorage.getMeetings(),
    qurban: appStorage.getQurban(),
    assets: appStorage.getAssets(),
    loans: appStorage.getLoans(),
    auditLogs: appStorage.getAuditLogs(),
    users: appStorage.getUsers(),
    driveConfig: appStorage.getDriveConfig(),
  }),

  setFullState: (state: any) => {
    if (!state) return;
    if (state.profile) appStorage.saveProfile(state.profile);
    if (state.accounts && Array.isArray(state.accounts)) appStorage.saveAccounts(state.accounts);
    if (state.transactions && Array.isArray(state.transactions)) appStorage.saveTransactions(state.transactions);
    if (state.duties && Array.isArray(state.duties)) appStorage.saveDuties(state.duties);
    if (state.meetings && Array.isArray(state.meetings)) appStorage.saveMeetings(state.meetings);
    if (state.qurban && Array.isArray(state.qurban)) appStorage.saveQurban(state.qurban);
    if (state.assets && Array.isArray(state.assets)) appStorage.saveAssets(state.assets);
    if (state.loans && Array.isArray(state.loans)) appStorage.saveLoans(state.loans);
    if (state.auditLogs && Array.isArray(state.auditLogs)) appStorage.saveAuditLogs(state.auditLogs);
    if (state.users && Array.isArray(state.users) && state.users.length > 0) appStorage.saveUsers(state.users);
    if (state.driveConfig) appStorage.saveDriveConfig(state.driveConfig);
  },

  getAccounts: () => {
    const accs = loadFromStorage<BankAccount[]>(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
    const mockHolders = [
      'DKM Masjid Nurul Ilmi',
      'Panitia Pembangunan Nurul Ilmi',
      'Bendahara Masjid Nurul Ilmi',
      'LAZIS Masjid Nurul Ilmi',
    ];
    let changed = false;
    const sanitized = accs.map((a) => {
      if (a.holderName && mockHolders.includes(a.holderName)) {
        changed = true;
        return { ...a, holderName: '' };
      }
      return a;
    });
    if (changed) {
      saveToStorage(STORAGE_KEYS.ACCOUNTS, sanitized);
    }
    // Ensure 'Rekening Utama' and 'Pembangunan dan Renovasi' are present
    const hasUtama = sanitized.some((a) => a.name.toLowerCase().includes('rekening utama'));
    const hasRenovasi = sanitized.some((a) => a.name.toLowerCase().includes('pembangunan'));
    if (!hasUtama || !hasRenovasi) {
      saveToStorage(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
      return DEFAULT_ACCOUNTS;
    }
    return sanitized;
  },
  saveAccounts: (a: BankAccount[]) => saveToStorage(STORAGE_KEYS.ACCOUNTS, a),

  getTransactions: () => loadFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS),
  saveTransactions: (t: Transaction[]) => saveToStorage(STORAGE_KEYS.TRANSACTIONS, t),

  getDuties: () => loadFromStorage<DutySchedule[]>(STORAGE_KEYS.DUTY_SCHEDULES, DEFAULT_DUTIES),
  saveDuties: (d: DutySchedule[]) => saveToStorage(STORAGE_KEYS.DUTY_SCHEDULES, d),

  getMeetings: () => loadFromStorage<MeetingRecord[]>(STORAGE_KEYS.MEETINGS, DEFAULT_MEETINGS),
  saveMeetings: (m: MeetingRecord[]) => saveToStorage(STORAGE_KEYS.MEETINGS, m),

  getQurban: () => loadFromStorage<QurbanParticipant[]>(STORAGE_KEYS.QURBAN, DEFAULT_QURBAN),
  saveQurban: (q: QurbanParticipant[]) => saveToStorage(STORAGE_KEYS.QURBAN, q),

  getAssets: () => loadFromStorage<MosqueAsset[]>(STORAGE_KEYS.ASSETS, DEFAULT_ASSETS),
  saveAssets: (a: MosqueAsset[]) => saveToStorage(STORAGE_KEYS.ASSETS, a),

  getLoans: () => loadFromStorage<AssetLoan[]>(STORAGE_KEYS.LOANS, DEFAULT_LOANS),
  saveLoans: (l: AssetLoan[]) => saveToStorage(STORAGE_KEYS.LOANS, l),

  getAuditLogs: () => loadFromStorage<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS),
  saveAuditLogs: (l: AuditLog[]) => saveToStorage(STORAGE_KEYS.AUDIT_LOGS, l),

  getDriveConfig: () => loadFromStorage<GoogleDriveConfig>(STORAGE_KEYS.DRIVE_CONFIG, DEFAULT_DRIVE_CONFIG),
  saveDriveConfig: (c: GoogleDriveConfig) => saveToStorage(STORAGE_KEYS.DRIVE_CONFIG, c),

  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const logs = appStorage.getAuditLogs();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: `${dateStr} ${timeStr}`,
      ...log,
    };
    const updated = [newLog, ...logs].slice(0, 200); // keep last 200 logs
    appStorage.saveAuditLogs(updated);
    return updated;
  },

  exportCompleteDatabaseJSON: () => {
    const fullData = {
      exportDate: new Date().toISOString(),
      version: '2.0',
      appName: 'Sistem Kas & Mading Digital Masjid',
      profile: appStorage.getProfile(),
      accounts: appStorage.getAccounts(),
      transactions: appStorage.getTransactions(),
      duties: appStorage.getDuties(),
      meetings: appStorage.getMeetings(),
      qurban: appStorage.getQurban(),
      assets: appStorage.getAssets(),
      loans: appStorage.getLoans(),
      auditLogs: appStorage.getAuditLogs(),
      users: appStorage.getUsers(),
      driveConfig: appStorage.getDriveConfig(),
    };
    return JSON.stringify(fullData, null, 2);
  },

  importCompleteDatabaseJSON: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) appStorage.saveProfile(data.profile);
      if (data.accounts) appStorage.saveAccounts(data.accounts);
      if (data.transactions) appStorage.saveTransactions(data.transactions);
      if (data.duties) appStorage.saveDuties(data.duties);
      if (data.meetings) appStorage.saveMeetings(data.meetings);
      if (data.qurban) appStorage.saveQurban(data.qurban);
      if (data.assets) appStorage.saveAssets(data.assets);
      if (data.loans) appStorage.saveLoans(data.loans);
      if (data.auditLogs) appStorage.saveAuditLogs(data.auditLogs);
      if (data.users && Array.isArray(data.users)) appStorage.saveUsers(data.users);
      if (data.driveConfig) appStorage.saveDriveConfig(data.driveConfig);
      return { success: true };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  },

  resetFinancialData: (resetAccountsBalanceToZero = true, userName = 'Pengurus', userRole: UserRole = 'admin') => {
    appStorage.saveTransactions([]);
    if (resetAccountsBalanceToZero) {
      const currentAccs = appStorage.getAccounts();
      const zeroedAccs = currentAccs.map((a) => ({ ...a, balance: 0 }));
      appStorage.saveAccounts(zeroedAccs);
    }
    appStorage.addAuditLog({
      userName,
      userRole,
      action: 'Reset Data Keuangan',
      details: 'Menghapus seluruh transaksi kas masuk/keluar dan mereset saldo kas ke Rp 0',
      category: 'kas',
    });
  },

  resetMeetingsData: (userName = 'Pengurus', userRole: UserRole = 'admin') => {
    appStorage.saveMeetings([]);
    appStorage.addAuditLog({
      userName,
      userRole,
      action: 'Reset Daftar Hadir Rapat',
      details: 'Menghapus semua arsip notulensi dan daftar hadir rapat',
      category: 'rapat',
    });
  },

  resetQurbanData: (userName = 'Pengurus', userRole: UserRole = 'admin') => {
    appStorage.saveQurban([]);
    appStorage.addAuditLog({
      userName,
      userRole,
      action: 'Reset Data Qurban',
      details: 'Menghapus seluruh daftar peserta shohibul qurban',
      category: 'qurban',
    });
  },

  resetDutiesData: (userName = 'Pengurus', userRole: UserRole = 'admin') => {
    appStorage.saveDuties([]);
    appStorage.addAuditLog({
      userName,
      userRole,
      action: 'Reset Jadwal Petugas',
      details: 'Mengosongkan seluruh jadwal imam & khatib Jumat',
      category: 'jadwal',
    });
  },

  resetLoansData: (userName = 'Pengurus', userRole: UserRole = 'admin') => {
    appStorage.saveLoans([]);
    appStorage.addAuditLog({
      userName,
      userRole,
      action: 'Reset Riwayat Peminjaman Aset',
      details: 'Mengosongkan seluruh riwayat peminjaman sarana dan aset',
      category: 'aset',
    });
  },

  resetAuditLogsOnly: (userName = 'Pengurus', userRole: UserRole = 'admin') => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    const initialLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: `${dateStr} ${timeStr}`,
      userName,
      userRole,
      action: 'Reset Log Audit',
      details: 'Riwayat log audit lama telah dibersihkan oleh pengurus',
      category: 'sistem',
    };
    appStorage.saveAuditLogs([initialLog]);
  },

  resetSelectedData: (
    options: {
      cashTransactions?: boolean;
      zeroCashBalances?: boolean;
      meetings?: boolean;
      qurban?: boolean;
      duties?: boolean;
      assets?: boolean;
      loans?: boolean;
      auditLogs?: boolean;
      customCategories?: boolean;
    },
    userName = 'Pengurus',
    userRole: UserRole = 'admin'
  ) => {
    if (options.cashTransactions) {
      appStorage.saveTransactions([]);
    }
    if (options.zeroCashBalances) {
      const currentAccs = appStorage.getAccounts();
      const zeroedAccs = currentAccs.map((a) => ({ ...a, balance: 0 }));
      appStorage.saveAccounts(zeroedAccs);
    }
    if (options.meetings) {
      appStorage.saveMeetings([]);
    }
    if (options.qurban) {
      appStorage.saveQurban([]);
    }
    if (options.duties) {
      appStorage.saveDuties([]);
    }
    if (options.assets) {
      appStorage.saveAssets([]);
    }
    if (options.loans) {
      appStorage.saveLoans([]);
    }
    if (options.customCategories && typeof window !== 'undefined') {
      localStorage.removeItem('masjid_custom_categories');
    }
    if (options.auditLogs) {
      appStorage.resetAuditLogsOnly(userName, userRole);
    } else {
      appStorage.addAuditLog({
        userName,
        userRole,
        action: 'Pembersihan Data Sistem',
        details: 'Menjalankan reset data terpilih untuk merapikan pembukuan masjid',
        category: 'sistem',
      });
    }
  },

  getStorageHealth: () => {
    let totalBytes = 0;
    const itemBreakdown: { key: string; name: string; sizeKB: number }[] = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('masjid_') || key.startsWith('app_') || key.startsWith('dkm_'))) {
          const val = localStorage.getItem(key) || '';
          const bytes = (key.length + val.length) * 2;
          totalBytes += bytes;
          itemBreakdown.push({
            key,
            name: key.replace(/^(masjid_|app_|dkm_)/, '').replace(/_/g, ' '),
            sizeKB: Math.round(bytes / 1024),
          });
        }
      }
    }
    const totalKB = Math.round(totalBytes / 1024);
    const quotaKB = 5120; // 5 MB typical browser quota
    const usagePercent = Math.min(100, Math.round((totalKB / quotaKB) * 100));
    return {
      totalKB,
      quotaKB,
      usagePercent,
      isNearLimit: usagePercent > 70,
      itemBreakdown: itemBreakdown.sort((a, b) => b.sizeKB - a.sizeKB),
    };
  },

  resetAllNames: (userName = 'Pengurus', userRole: UserRole = 'admin') => {
    const curProfile = appStorage.getProfile();
    const clearedProfile: MosqueProfile = {
      ...curProfile,
      ketuaTakmir: '',
      wakilKetua: '',
      bendahara: '',
      bendahara2: '',
      sekretaris: '',
      sekretaris2: '',
      sieKeamanan: '',
      siePerlengkapan: '',
      sieDakwah: '',
      siePeribadatan: '',
      sieSosial: '',
      sieRemaja: '',
      sieHumas: '',
      marbot: '',
      penasihat: '',
      customOfficers: [],
      phone: '',
      email: '',
      runningTexts: DEFAULT_PROFILE.runningTexts,
    };
    appStorage.saveProfile(clearedProfile);

    const clearedUsers = DEFAULT_USERS.map((u) => ({ ...u, name: '' }));
    appStorage.saveUsers(clearedUsers);
    appStorage.saveCurrentUser(clearedUsers[0]);

    const currentAccs = appStorage.getAccounts();
    const clearedAccs = currentAccs.map((a) => ({ ...a, holderName: '', accountNumber: '' }));
    appStorage.saveAccounts(clearedAccs);

    appStorage.addAuditLog({
      userName: userName || 'Admin',
      userRole,
      action: 'Kosongkan Semua Nama',
      details: 'Semua nama pengurus DKM, petugas, dan pemegang rekening telah dikosongkan',
      category: 'sistem',
    });

    return { profile: clearedProfile, users: clearedUsers, accounts: clearedAccs };
  },

  resetToDefault: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.reload();
    }
  }
};

/**
 * Format currency to Rupiah string
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Helper to download CSV/Excel file in browser
 */
export function exportToCSV(filename: string, rows: (string | number)[][]): void {
  const processRow = (row: (string | number)[]) => {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) {
        result = '"' + result + '"';
      }
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel to display Indonesian characters properly
  for (let i = 0; i < rows.length; i++) {
    csvContent += processRow(rows[i]);
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
