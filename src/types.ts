export type UserRole = 'admin' | 'bendahara' | 'sekretaris' | 'ketua_takmir' | 'operator_tv' | 'marbot';

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  pin: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  holderName: string;
  balance: number;
  isDefault?: boolean;
  color: string;
}

export type TransactionType = 'in' | 'out';

export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  amount: number;
  accountId: string;
  category: string;
  description: string;
  recordedBy: string;
  userRole: UserRole;
  receiptUrl?: string;
  receiptName?: string;
  receiptDriveId?: string;
  driveSynced?: boolean;
}

export interface DkmOfficer {
  id: string;
  roleTitle: string;
  name: string;
  phone?: string;
}

export interface MosqueProfile {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  slogan: string;
  logoUrl: string;
  qrisUrl: string;
  qrisNmid?: string;
  ketuaTakmir: string;
  wakilKetua?: string;
  bendahara: string;
  bendahara2?: string;
  sekretaris: string;
  sekretaris2?: string;
  sieKeamanan?: string;
  siePerlengkapan?: string;
  sieDakwah?: string;
  siePeribadatan?: string;
  sieSosial?: string;
  sieRemaja?: string;
  sieHumas?: string;
  marbot?: string;
  penasihat?: string;
  customOfficers?: DkmOfficer[];
  runningTexts: string[];
  iqomahMinutes: {
    subuh: number;
    dzuhur: number;
    ashar: number;
    maghrib: number;
    isya: number;
  };
  latitude: number;
  longitude: number;
  timezone: number; // 7 for WIB, 8 for WITA, 9 for WIT
}

export interface PrayerTimeData {
  subuh: string;
  syuruq: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface DutySchedule {
  id: string;
  date: string;
  type: 'Jumat' | 'Subuh Akbar' | 'Kajian Ahad' | 'Kajian Muslimah' | 'Tarawih' | 'Sholat Id';
  khatib: string;
  imam: string;
  muadzin: string;
  penceramah?: string;
  theme: string;
  phone: string;
  waSent: boolean;
}

export interface MeetingAttendance {
  name: string;
  role: string;
  present: boolean;
  notes?: string;
}

export interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  leader: string;
  agenda: string;
  minutes: string;
  attendees: MeetingAttendance[];
  photoUrl?: string;
}

export type QurbanType = 'sapi' | 'kambing';
export type PaymentStatus = 'lunas' | 'cicilan';

export interface QurbanPayment {
  id: string;
  date: string;
  amount: number;
  note: string;
}

export interface QurbanParticipant {
  id: string;
  year: number;
  type: QurbanType;
  groupNumber?: number; // 1 to 7 for cow group
  participantName: string;
  phone: string;
  address: string;
  targetAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  payments: QurbanPayment[];
  notes?: string;
}

export type AssetCondition = 'baik' | 'rusak_ringan' | 'rusak_berat' | 'servis';

export interface MosqueAsset {
  id: string;
  code: string;
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  unit: string;
  purchaseDate: string;
  fundingSource: string;
  condition: AssetCondition;
  location: string;
  estimatedValue: number;
  photoUrl?: string;
}

export interface AssetLoan {
  id: string;
  assetId: string;
  assetName: string;
  borrowerName: string;
  borrowerPhone: string;
  borrowerAddress: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: 'dipinjam' | 'kembali';
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  category: 'kas' | 'aset' | 'jadwal' | 'rapat' | 'qurban' | 'sistem' | 'drive';
}

export interface GoogleDriveConfig {
  connected: boolean;
  email: string;
  folderName: string;
  folderId: string;
  lastBackupDate?: string;
  autoSync: boolean;
}
