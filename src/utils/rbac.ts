import { UserRole } from '../types';

export interface RoleConfig {
  role: UserRole;
  label: string;
  shortLabel: string;
  badgeClass: string;
  badgeLightClass: string;
  description: string;
  permissions: {
    kas: boolean;
    rekening: boolean;
    jadwal: boolean;
    qurban: boolean;
    aset: boolean;
    pengaturanMasjid: boolean;
    pengaturanTv: boolean;
    resetData: boolean;
    auditLogs: boolean;
  };
}

export const ROLES_CONFIG: Record<UserRole, RoleConfig> = {
  admin: {
    role: 'admin',
    label: 'Super Admin',
    shortLabel: 'Super Admin',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    badgeLightClass: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Akses penuh tanpa batas ke semua data keuangan, operasional, & master sistem.',
    permissions: {
      kas: true,
      rekening: true,
      jadwal: true,
      qurban: true,
      aset: true,
      pengaturanMasjid: true,
      pengaturanTv: true,
      resetData: true,
      auditLogs: true,
    },
  },
  ketua_takmir: {
    role: 'ketua_takmir',
    label: 'Ketua Takmir (DKM)',
    shortLabel: 'Ketua',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    badgeLightClass: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Pengawas tertinggi: Otoritas verifikasi pembukuan, jadwal, aset, dan tata kelola.',
    permissions: {
      kas: true,
      rekening: true,
      jadwal: true,
      qurban: true,
      aset: true,
      pengaturanMasjid: true,
      pengaturanTv: true,
      resetData: true,
      auditLogs: true,
    },
  },
  bendahara: {
    role: 'bendahara',
    label: 'Bendahara Masjid',
    shortLabel: 'Bendahara',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    badgeLightClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Pengelola keuangan: Input kas masuk/keluar, mutasi bank, qurban, dan laporan.',
    permissions: {
      kas: true,
      rekening: true,
      jadwal: false,
      qurban: true,
      aset: false,
      pengaturanMasjid: false,
      pengaturanTv: false,
      resetData: false,
      auditLogs: true,
    },
  },
  sekretaris: {
    role: 'sekretaris',
    label: 'Sekretaris DKM',
    shortLabel: 'Sekretaris',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    badgeLightClass: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Administrasi & kegiatan: Jadwal imam/khatib, notulensi, inventaris sarana & WA.',
    permissions: {
      kas: false,
      rekening: false,
      jadwal: true,
      qurban: true,
      aset: true,
      pengaturanMasjid: true,
      pengaturanTv: false,
      resetData: false,
      auditLogs: true,
    },
  },
  operator_tv: {
    role: 'operator_tv',
    label: 'Operator TV Digital',
    shortLabel: 'Operator TV',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    badgeLightClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Spesialis layar mading: Mengatur running text, slide dakwah, timer adzan & iqomah.',
    permissions: {
      kas: false,
      rekening: false,
      jadwal: true,
      qurban: false,
      aset: false,
      pengaturanMasjid: false,
      pengaturanTv: true,
      resetData: false,
      auditLogs: false,
    },
  },
  marbot: {
    role: 'marbot',
    label: 'Marbot / Perlengkapan',
    shortLabel: 'Marbot',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    badgeLightClass: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'Pemeliharaan fisik: Pengecekan barang masjid, peminjaman aset, sound & sarana.',
    permissions: {
      kas: false,
      rekening: false,
      jadwal: true,
      qurban: false,
      aset: true,
      pengaturanMasjid: false,
      pengaturanTv: false,
      resetData: false,
      auditLogs: false,
    },
  },
};

/**
 * Check if a role can access a specific navigation tab
 */
export function canAccessTab(role: UserRole | undefined, tab: string): boolean {
  if (!role) return true;
  const cfg = ROLES_CONFIG[role] || ROLES_CONFIG.admin;

  if (tab === 'dashboard' || tab === 'storage-health' || tab === 'whatsapp-hub') {
    return true;
  }

  if (tab === 'riwayat-kas' || tab.startsWith('account-') || tab === 'kategori-kas') {
    return cfg.permissions.kas;
  }

  if (tab === 'kelola-rekening') {
    return cfg.permissions.rekening;
  }

  if (tab === 'jadwal') {
    return cfg.permissions.jadwal;
  }

  if (tab === 'qurban') {
    return cfg.permissions.qurban;
  }

  if (tab === 'aset') {
    return cfg.permissions.aset;
  }

  if (tab === 'pengaturan-masjid') {
    return cfg.permissions.pengaturanMasjid;
  }

  if (tab === 'pengaturan-tv') {
    return cfg.permissions.pengaturanTv;
  }

  if (tab === 'reset-data') {
    return cfg.permissions.resetData;
  }

  if (tab === 'audit') {
    return cfg.permissions.auditLogs;
  }

  return true;
}
