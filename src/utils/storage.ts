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
    balance: 51250000,
    isDefault: true,
    color: '#10b981', // emerald
  },
  {
    id: 'acc-renovasi',
    name: 'Pembangunan dan Renovasi',
    bankName: 'Bank Syariah Indonesia (BSI)',
    accountNumber: '7199887766',
    holderName: 'Panitia Pembangunan Nurul Ilmi',
    balance: 78500000,
    color: '#f59e0b', // amber
  },
  {
    id: 'acc-tunai',
    name: 'Kas Tunai Tromol',
    bankName: 'Brankas Tunai Masjid',
    accountNumber: 'CASH-001',
    holderName: 'Bendahara Masjid Nurul Ilmi',
    balance: 8450000,
    color: '#0284c7', // sky
  },
  {
    id: 'acc-sosial',
    name: 'Kas Zakat & Santunan Dhuafa',
    bankName: 'Bank Muamalat',
    accountNumber: '3410098765',
    holderName: 'LAZIS Masjid Nurul Ilmi',
    balance: 19300000,
    color: '#8b5cf6', // purple
  },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx-1',
    date: '2026-09-18',
    type: 'in',
    amount: 5850000,
    accountId: 'acc-tunai',
    category: 'Kotak Infaq Jumat',
    description: 'Penerimaan infaq dan sedekah tromol sholat Jumat pekan ke-3',
    recordedBy: 'Ustadz Ahmad Fauzi, S.E.',
    userRole: 'bendahara',
    receiptName: 'berita-acara-jumat.jpg',
    driveSynced: true,
  },
  {
    id: 'trx-2',
    date: '2026-09-17',
    type: 'in',
    amount: 15000000,
    accountId: 'acc-renovasi',
    category: 'Donasi Renovasi Kubah',
    description: 'Infaq jariyah pembangunan kanopi selasar dari Hamba Allah via transfer',
    recordedBy: 'Ustadz Ahmad Fauzi, S.E.',
    userRole: 'bendahara',
    receiptName: 'bukti-transfer-kanopi.pdf',
    driveSynced: true,
  },
  {
    id: 'trx-3',
    date: '2026-09-16',
    type: 'out',
    amount: 1450000,
    accountId: 'acc-utama',
    category: 'Listrik & Air PLN/PDAM',
    description: 'Pembayaran tagihan listrik token utama masjid dan pompa air wudhu',
    recordedBy: 'Ustadz Ahmad Fauzi, S.E.',
    userRole: 'bendahara',
    receiptName: 'struk-pln-sept.jpg',
    driveSynced: true,
  },
  {
    id: 'trx-4',
    date: '2026-09-15',
    type: 'out',
    amount: 2500000,
    accountId: 'acc-tunai',
    category: 'Kebersihan & Perlengkapan',
    description: 'Belanja cairan pembersih lantai, pewangi karpet, sabun cuci tangan & tisu',
    recordedBy: 'Muhammad Ridwan, S.Kom',
    userRole: 'sekretaris',
    receiptName: 'nota-toko-bersih.jpg',
    driveSynced: true,
  },
  {
    id: 'trx-5',
    date: '2026-09-14',
    type: 'in',
    amount: 2350000,
    accountId: 'acc-utama',
    category: 'QRIS Non-Tunai',
    description: 'Akumulasi infaq jamaah scan barcode QRIS pekan berjalan',
    recordedBy: 'Ustadz Ahmad Fauzi, S.E.',
    userRole: 'bendahara',
    driveSynced: true,
  },
  {
    id: 'trx-6',
    date: '2026-09-12',
    type: 'out',
    amount: 3000000,
    accountId: 'acc-sosial',
    category: 'Santunan Yatim & Dhuafa',
    description: 'Penyaluran beasiswa santri dhuafa dan sembako 10 janda lansia sekitar masjid',
    recordedBy: 'Ustadz Ahmad Fauzi, S.E.',
    userRole: 'bendahara',
    receiptName: 'tanda-terima-santunan.pdf',
    driveSynced: true,
  },
  {
    id: 'trx-7',
    date: '2026-09-11',
    type: 'in',
    amount: 6200000,
    accountId: 'acc-tunai',
    category: 'Kotak Infaq Jumat',
    description: 'Penerimaan infaq dan sedekah tromol sholat Jumat pekan ke-2',
    recordedBy: 'Ustadz Ahmad Fauzi, S.E.',
    userRole: 'bendahara',
    driveSynced: true,
  }
];

export const DEFAULT_DUTIES: DutySchedule[] = [
  {
    id: 'duty-1',
    date: '2026-09-18',
    type: 'Jumat',
    khatib: 'Prof. Dr. KH. Syukron Ma\'mun',
    imam: 'Ustadz Hafizh Al-Bantani, Lc.',
    muadzin: 'Ust. Bilal Mansur',
    theme: 'Memakmurkan Rumah Allah dengan Kejujuran dan Keteladanan Sosial',
    phone: '081234567801',
    waSent: true,
  },
  {
    id: 'duty-2',
    date: '2026-09-20',
    type: 'Kajian Ahad',
    khatib: '-',
    imam: 'Ustadz Farhan Kamil',
    muadzin: 'Kang Ilham',
    penceramah: 'Ustadz Dr. H. Khalid Mubarok, M.A.',
    theme: 'Bedah Kitab Riyadush Shalihin: Adab Bertetangga & Ukhuwah',
    phone: '081399887766',
    waSent: false,
  },
  {
    id: 'duty-3',
    date: '2026-09-25',
    type: 'Jumat',
    khatib: 'Ustadz H. Anshori Muslim, M.Ag',
    imam: 'Ustadz Qari Muhammad Fatih',
    muadzin: 'Ust. Bilal Mansur',
    theme: 'Tazkiyatun Nafs: Menjaga Hati Bersih Menghadapi Godaan Duniawi',
    phone: '081577889900',
    waSent: false,
  },
  {
    id: 'duty-4',
    date: '2026-09-27',
    type: 'Subuh Akbar',
    khatib: '-',
    imam: 'Syeikh Tareq Al-Madani',
    muadzin: 'Kang Ilham',
    penceramah: 'KH. Abdullah Gymnastiar',
    theme: 'Kekuatan Doa dan Keberkahan Sholat Subuh Berjamaah',
    phone: '081288990011',
    waSent: false,
  }
];

export const DEFAULT_MEETINGS: MeetingRecord[] = [
  {
    id: 'meet-1',
    title: 'Rapat Pleno Koordinasi Persiapan Maulid Nabi & Evaluasi Keuangan',
    date: '2026-09-10',
    time: '20:00 WIB',
    location: 'Ruang Rapat Utama Lantai 2 Masjid',
    leader: 'H. Bambang Sulistyo, M.Ag (Ketua Takmir)',
    agenda: '1. Laporan keuangan kas agustus-september. 2. Pembentukan panitia peringatan hari besar Islam. 3. Usulan perbaikan sound system.',
    minutes: 'Disepakati alokasi anggaran Rp 12.000.000 untuk kegiatan tabligh akbar, serta perbaikan kabel mikrofon mihrab yang sudah kresek. Bendahara diminta menyiapkan laporan kas cetak untuk mading digital.',
    attendees: [
      { name: 'H. Bambang Sulistyo, M.Ag', role: 'Ketua Takmir', present: true },
      { name: 'Ustadz Ahmad Fauzi, S.E.', role: 'Bendahara', present: true },
      { name: 'Muhammad Ridwan, S.Kom', role: 'Sekretaris', present: true },
      { name: 'Ustadz Farhan Kamil', role: 'Sie Ibadah', present: true },
      { name: 'Pak Joko Subroto', role: 'Sie Pemeliharaan & Aset', present: true },
      { name: 'Ibu Hj. Maryam', role: 'Sie Muslimah & Sosial', present: false, notes: 'Izin ke luar kota' },
    ],
    photoUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=500&auto=format&fit=crop&q=80',
  }
];

export const DEFAULT_QURBAN: QurbanParticipant[] = [
  {
    id: 'qrb-1',
    year: 2026,
    type: 'sapi',
    groupNumber: 1,
    participantName: 'H. Bambang Sulistyo & Keluarga',
    phone: '081122334455',
    address: 'Jl. Melati Blok C No. 12',
    targetAmount: 3800000,
    paidAmount: 3800000,
    paymentStatus: 'lunas',
    payments: [
      { id: 'p-1', date: '2026-07-15', amount: 2000000, note: 'DP Awal Pendaftaran' },
      { id: 'p-2', date: '2026-08-20', amount: 1800000, note: 'Pelunasan Qurban Sapi Kelompok 1' }
    ],
    notes: 'Qurban atas nama 1 keluarga, bagian daging mohon diantar.'
  },
  {
    id: 'qrb-2',
    year: 2026,
    type: 'sapi',
    groupNumber: 1,
    participantName: 'Drs. Hendra Setiawan',
    phone: '081288776655',
    address: 'Komplek Permata Indah B4',
    targetAmount: 3800000,
    paidAmount: 2500000,
    paymentStatus: 'cicilan',
    payments: [
      { id: 'p-3', date: '2026-08-05', amount: 2500000, note: 'Cicilan ke-1' }
    ],
    notes: 'Sisa cicilan akan ditransfer akhir bulan ini'
  },
  {
    id: 'qrb-3',
    year: 2026,
    type: 'kambing',
    participantName: 'Ibu Ratna Dewi',
    phone: '081377665544',
    address: 'Jl. Anggrek No. 8',
    targetAmount: 3200000,
    paidAmount: 3200000,
    paymentStatus: 'lunas',
    payments: [
      { id: 'p-4', date: '2026-08-10', amount: 3200000, note: 'Pelunasan Langsung Kambing Kelas A' }
    ]
  }
];

export const DEFAULT_ASSETS: MosqueAsset[] = [
  {
    id: 'ast-1',
    code: 'AST-SND-001',
    name: 'Wireless Microphone Shure Dual Handheld',
    category: 'Audio & Sound System',
    totalQuantity: 4,
    availableQuantity: 3,
    unit: 'Set',
    purchaseDate: '2025-11-20',
    fundingSource: 'Infaq Tromol Kas Tunai',
    condition: 'baik',
    location: 'Ruang Operator Audio Lt. 1',
    estimatedValue: 4800000,
    photoUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'ast-2',
    code: 'AST-KRS-002',
    name: 'Kursi Lipat Futura Stainless Polos',
    category: 'Furnitur & Tenda',
    totalQuantity: 80,
    availableQuantity: 50,
    unit: 'Buah',
    purchaseDate: '2025-06-14',
    fundingSource: 'Wakaf Donatur Tetap',
    condition: 'baik',
    location: 'Gudang Sayap Kanan',
    estimatedValue: 17600000,
    photoUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'ast-3',
    code: 'AST-GEN-003',
    name: 'Genset Silent Honda 5500 Watt',
    category: 'Kelistrikan & Mesin',
    totalQuantity: 1,
    availableQuantity: 1,
    unit: 'Unit',
    purchaseDate: '2024-03-10',
    fundingSource: 'Kas Pembangunan',
    condition: 'baik',
    location: 'Ruang Mesin Belakang',
    estimatedValue: 14500000,
  },
  {
    id: 'ast-4',
    code: 'AST-PRJ-004',
    name: 'Proyektor Epson EB-E01 3300 Lumens',
    category: 'Elektronik & Multimedia',
    totalQuantity: 2,
    availableQuantity: 2,
    unit: 'Unit',
    purchaseDate: '2025-01-18',
    fundingSource: 'Kas Operasional BSI',
    condition: 'baik',
    location: 'Lemari Kantor Sekretariat',
    estimatedValue: 6200000,
  },
  {
    id: 'ast-5',
    code: 'AST-TND-005',
    name: 'Tenda Lipat Portable Ukuran 3x3 Meter',
    category: 'Furnitur & Tenda',
    totalQuantity: 4,
    availableQuantity: 2,
    unit: 'Unit',
    purchaseDate: '2025-08-01',
    fundingSource: 'Infaq Khusus Pemuda Remaja',
    condition: 'baik',
    location: 'Gudang Perlengkapan Luar',
    estimatedValue: 3600000,
  }
];

export const DEFAULT_LOANS: AssetLoan[] = [
  {
    id: 'loan-1',
    assetId: 'ast-2',
    assetName: 'Kursi Lipat Futura Stainless Polos',
    borrowerName: 'Pak Dedi Supriyadi (Jamaah RT 04)',
    borrowerPhone: '081290887766',
    borrowerAddress: 'Jl. Dahlia No. 15 RT 04/06',
    quantity: 30,
    borrowDate: '2026-09-17',
    expectedReturnDate: '2026-09-19',
    status: 'dipinjam',
    notes: 'Untuk acara tasyakuran khitanan keluarga'
  },
  {
    id: 'loan-2',
    assetId: 'ast-5',
    assetName: 'Tenda Lipat Portable Ukuran 3x3 Meter',
    borrowerName: 'Remaja Karang Taruna RW 06',
    borrowerPhone: '085611223344',
    borrowerAddress: 'Pos Balai Warga RW 06',
    quantity: 2,
    borrowDate: '2026-09-16',
    expectedReturnDate: '2026-09-18',
    status: 'dipinjam',
    notes: 'Posko cek kesehatan gratis lansia'
  },
  {
    id: 'loan-3',
    assetId: 'ast-1',
    assetName: 'Wireless Microphone Shure Dual Handheld',
    borrowerName: 'Ust. Salman Al-Farisi',
    borrowerPhone: '081322334455',
    borrowerAddress: 'Pesantren Tahfizh Dhuafa',
    quantity: 1,
    borrowDate: '2026-09-10',
    expectedReturnDate: '2026-09-12',
    actualReturnDate: '2026-09-12',
    status: 'kembali',
    notes: 'Dikembalikan lengkap dengan baterai baru'
  }
];

export const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-18 10:45:12',
    userName: 'Ustadz Ahmad Fauzi, S.E.',
    userRole: 'bendahara',
    action: 'Pencatatan Infaq Kas',
    details: 'Mencatat penerimaan Infaq Tromol Jumat sebesar Rp 5.850.000 ke Kas Tunai Utama',
    category: 'kas',
  },
  {
    id: 'log-2',
    timestamp: '2026-09-18 09:15:00',
    userName: 'Muhammad Ridwan, S.Kom',
    userRole: 'sekretaris',
    action: 'Kirim Pengingat WhatsApp Petugas',
    details: 'Mengirim WA konfirmasi tugas Khotib Jumat kepada Prof. Dr. KH. Syukron Ma\'mun',
    category: 'jadwal',
  },
  {
    id: 'log-3',
    timestamp: '2026-09-17 16:30:21',
    userName: 'Muhammad Ridwan, S.Kom',
    userRole: 'sekretaris',
    action: 'Peminjaman Aset',
    details: 'Mencatat peminjaman 30 Kursi Lipat oleh Bpk Dedi Supriyadi (Stok otomatis berkurang)',
    category: 'aset',
  },
  {
    id: 'log-4',
    timestamp: '2026-09-17 14:00:10',
    userName: 'Ustadz Ahmad Fauzi, S.E.',
    userRole: 'bendahara',
    action: 'Sinkronisasi Google Drive',
    details: 'Berhasil backup otomatis database kas dan nota kuitansi ke folder Google Drive Masjid',
    category: 'drive',
  },
  {
    id: 'log-5',
    timestamp: '2026-09-15 20:10:05',
    userName: 'H. Bambang Sulistyo, M.Ag',
    userRole: 'ketua_takmir',
    action: 'Login Sistem',
    details: 'Ketua Takmir berhasil login dari perangkat pengawas',
    category: 'sistem',
  }
];

export const DEFAULT_DRIVE_CONFIG: GoogleDriveConfig = {
  connected: true,
  email: 'drive.masjid.alikhlas@gmail.com',
  folderName: 'Google Drive Masjid Al-Ikhlas (Data & Bukti Nota)',
  folderId: '1AbC987_Masjid_Data_Archive_Safe_Cloud_2026',
  lastBackupDate: '18 September 2026, 14:00 WIB',
  autoSync: true,
};

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
