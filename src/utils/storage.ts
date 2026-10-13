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
  phone: '0812-3456-7890',
  email: 'takmir.nurulilmi@gmail.com',
  slogan: 'Pusat Ibadah, Kebajikan, dan Pembinaan Ummat',
  logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
  qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021126590014ID.LINKAJA.WWW011893600911002150000002151234567890123455204581253033605802ID5918MASJID+NURUL+ILMI6013JAKARTA+PUSAT61051034062070703A016304ABCD',
  qrisNmid: 'ID1020304050607',
  ketuaTakmir: 'H. Bambang Sulistyo, M.Ag',
  wakilKetua: 'Drs. H. Syamsudin Mansyur',
  bendahara: 'Ustadz Ahmad Fauzi, S.E.',
  bendahara2: 'H. M. Taufik Hidayat, Ak.',
  sekretaris: 'Muhammad Ridwan, S.Kom',
  sekretaris2: 'Agus Salim, S.Pd',
  sieKeamanan: 'Kapten (Purn) Sudirman / Bpk. Yanto',
  siePerlengkapan: 'Pak Joko Subroto & Tim Sarpras',
  sieDakwah: 'Ustadz Dr. H. Khalid Mubarok, M.A.',
  sieSosial: 'Hj. Maryam & Bpk. Hendra Wijaya',
  marbot: 'Pak Slamet & Mas Wahyu',
  penasihat: 'Prof. Dr. KH. Nasaruddin Ilyas',
  customOfficers: [
    { id: 'off-1', roleTitle: 'Sie Humas & Media Digital', name: 'Rian Pratama, S.I.Kom', phone: '0812-9988-7766' },
    { id: 'off-2', roleTitle: 'Sie Remaja Masjid (RISMA)', name: 'Kang Ilham Maulana', phone: '0813-1122-3344' },
  ],
  runningTexts: [
    'Selamat datang di Masjid Nurul Ilmi. Luruskan dan rapatkan shaf sholat demi kesempurnaan berjamaah.',
    'Kajian Rutin Ba\'da Maghrib: Tafsir Ibnu Katsir setiap hari Selasa bersama Ustadz Dr. H. Khalid Mubarok, M.A.',
    'Pemberitahuan: Gerakan Infaq Beras Santri & Santunan Anak Yatim rutin dibuka setiap hari Jumat.',
    'Mohon menonaktifkan atau menyenyapkan nada dering HP selama berada di dalam ruang utama sholat.',
    'Rekening Resmi Donasi Operasional & Pembangunan BSI: 712-345-6789 a.n. Kas Masjid Nurul Ilmi.'
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
    name: 'Super Admin',
    role: 'admin',
    email: 'admin.nurulilmi@gmail.com',
    phone: '081234567890',
    pin: '1234',
  },
  {
    id: 'user-bendahara',
    name: 'Ustadz Ahmad Fauzi, S.E.',
    role: 'bendahara',
    email: 'bendahara.masjid@gmail.com',
    phone: '081298765432',
    pin: '1234',
  },
  {
    id: 'user-sekretaris',
    name: 'Muhammad Ridwan, S.Kom',
    role: 'sekretaris',
    email: 'sekretaris.masjid@gmail.com',
    phone: '081387654321',
    pin: '1234',
  },
  {
    id: 'user-ketua',
    name: 'H. Bambang Sulistyo, M.Ag',
    role: 'ketua_takmir',
    email: 'ketua.masjid@gmail.com',
    phone: '081122334455',
    pin: '1234',
  },
  {
    id: 'user-operator',
    name: 'Fikri Haikal',
    role: 'operator_tv',
    email: 'operator.tv@gmail.com',
    phone: '081555667788',
    pin: '1234',
  },
  {
    id: 'user-marbot',
    name: 'Pak Slamet Riyadi',
    role: 'marbot',
    email: 'marbot.masjid@gmail.com',
    phone: '081999887766',
    pin: '1234',
  },
];

export const DEFAULT_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-utama',
    name: 'Rekening Utama',
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '7123456789',
    holderName: 'DKM Masjid Nurul Ilmi',
    balance: 0,
    isDefault: true,
    color: '#10b981', // emerald
  },
  {
    id: 'acc-renovasi',
    name: 'Pembangunan dan Renovasi',
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '7199887766',
    holderName: 'Panitia Pembangunan Nurul Ilmi',
    balance: 0,
    color: '#f59e0b', // amber
  },
  {
    id: 'acc-tunai',
    name: 'Kas Tunai Tromol',
    bankName: 'Brankas Tunai Masjid',
    accountNumber: 'CASH-001',
    holderName: 'Bendahara Masjid Nurul Ilmi',
    balance: 0,
    color: '#0284c7', // sky
  },
  {
    id: 'acc-sosial',
    name: 'Kas Zakat & Santunan Dhuafa',
    bankName: 'Bank Muamalat',
    accountNumber: '3410098765',
    holderName: 'LAZIS Masjid Nurul Ilmi',
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

// Inisialisasi pengosongan seluruh data sesuai instruksi pengguna ("Kosongkan semua data")
const CLEAR_ALL_DATA_FLAG = 'masjid_cleared_empty_v5';
if (typeof window !== 'undefined' && window.localStorage) {
  if (localStorage.getItem(CLEAR_ALL_DATA_FLAG) !== 'true') {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DUTY_SCHEDULES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.QURBAN, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));

      const zeroedAccounts = DEFAULT_ACCOUNTS.map((a) => ({ ...a, balance: 0 }));
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(zeroedAccounts));

      localStorage.setItem(CLEAR_ALL_DATA_FLAG, 'true');
    } catch (e) {
      console.error('Error emptying initial localStorage data:', e);
    }
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
    if (!users.some((u) => u.role === 'admin' || u.name === 'Super Admin')) {
      const updated = [...DEFAULT_USERS];
      saveToStorage(STORAGE_KEYS.USERS, updated);
      return updated;
    }
    return users;
  },
  saveUsers: (u: UserAccount[]) => saveToStorage(STORAGE_KEYS.USERS, u),

  getCurrentUser: (): UserAccount => {
    const cur = loadFromStorage<UserAccount>(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
    if (!cur || cur.name === 'Ustadz Ahmad Fauzi, S.E.' && cur.role === 'bendahara') {
      // Default to Super Admin as requested
      return DEFAULT_USERS[0];
    }
    return cur;
  },
  saveCurrentUser: (u: UserAccount) => saveToStorage(STORAGE_KEYS.CURRENT_USER, u),

  getAccounts: () => {
    const accs = loadFromStorage<BankAccount[]>(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
    // Ensure 'Rekening Utama' and 'Pembangunan dan Renovasi' are present
    const hasUtama = accs.some((a) => a.name.toLowerCase().includes('rekening utama'));
    const hasRenovasi = accs.some((a) => a.name.toLowerCase().includes('pembangunan'));
    if (!hasUtama || !hasRenovasi) {
      saveToStorage(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
      return DEFAULT_ACCOUNTS;
    }
    return accs;
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
