import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  ShieldCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  AlertTriangle,
  Lock,
  Phone,
  Mail,
  Shield,
  Plus,
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import { appStorage } from '../../utils/storage';
import { ROLES_CONFIG } from '../../utils/rbac';
import { syncService } from '../../utils/syncService';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface KelolaAkunManagerProps {
  currentUser: UserAccount;
  onUserChanged?: (user: UserAccount) => void;
  onUsersUpdated?: (users: UserAccount[]) => void;
}

export const KelolaAkunManager: React.FC<KelolaAkunManagerProps> = ({
  currentUser,
  onUserChanged,
  onUsersUpdated,
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => appStorage.getUsers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('bendahara');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formPinConfirm, setFormPinConfirm] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  // Delete State
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Show/Hide PIN for list items
  const [revealedPins, setRevealedPins] = useState<{ [id: string]: boolean }>({});

  const togglePinReveal = (id: string) => {
    setRevealedPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetForm = () => {
    setFormName('');
    setFormRole('bendahara');
    setFormEmail('');
    setFormPhone('');
    setFormPin('');
    setFormPinConfirm('');
    setShowPin(false);
    setFeedback(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setEditingUser(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    resetForm();
    setEditingUser(user);
    setFormName(user.name);
    setFormRole(user.role);
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormPin(user.pin);
    setFormPinConfirm(user.pin);
    setShowAddModal(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!formName.trim()) {
      setFeedback({ text: 'Nama lengkap pengurus wajib diisi!', ok: false });
      return;
    }

    if (!formPin || formPin.length < 4) {
      setFeedback({ text: 'PIN keamanan minimal harus 4 digit angka!', ok: false });
      return;
    }

    if (formPin !== formPinConfirm) {
      setFeedback({ text: 'Konfirmasi PIN tidak cocok dengan PIN baru!', ok: false });
      return;
    }

    let updatedUsers: UserAccount[];

    if (editingUser) {
      // Edit existing user
      updatedUsers = users.map((u) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formName.trim(),
            role: formRole,
            email: formEmail.trim(),
            phone: formPhone.trim(),
            pin: formPin.trim(),
          };
        }
        return u;
      });

      appStorage.addAuditLog({
        userName: currentUser.name || 'Admin',
        userRole: currentUser.role,
        action: 'Ubah Data Akun Pengurus',
        details: `Memperbarui akun ${formName} (Role: ${ROLES_CONFIG[formRole]?.label || formRole})`,
        category: 'sistem',
      });
    } else {
      // Create new user
      const newUser: UserAccount = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: formName.trim(),
        role: formRole,
        email: formEmail.trim(),
        phone: formPhone.trim(),
        pin: formPin.trim(),
      };
      updatedUsers = [...users, newUser];

      appStorage.addAuditLog({
        userName: currentUser.name || 'Admin',
        userRole: currentUser.role,
        action: 'Buat Akun Pengurus Baru',
        details: `Membuat akun baru ${formName} (Role: ${ROLES_CONFIG[formRole]?.label || formRole})`,
        category: 'sistem',
      });
    }

    // Save and sync
    setUsers(updatedUsers);
    appStorage.saveUsers(updatedUsers);

    // If current logged in user was modified, update active user state
    if (editingUser && currentUser.id === editingUser.id) {
      const updatedCurrent = updatedUsers.find((u) => u.id === editingUser.id);
      if (updatedCurrent) {
        appStorage.saveCurrentUser(updatedCurrent);
        if (onUserChanged) onUserChanged(updatedCurrent);
      }
    }

    if (onUsersUpdated) onUsersUpdated(updatedUsers);

    // Push full state to server for multi-device synchronization
    syncService.pushStateToServer(appStorage.getFullState(), true);

    setShowAddModal(false);
    resetForm();
  };

  const handleSwitchActiveUser = (targetUser: UserAccount) => {
    appStorage.saveCurrentUser(targetUser);
    if (onUserChanged) onUserChanged(targetUser);

    appStorage.addAuditLog({
      userName: targetUser.name || 'Pengurus',
      userRole: targetUser.role,
      action: 'Beralih Akun Aktif',
      details: `Beralih ke akun ${targetUser.name || ROLES_CONFIG[targetUser.role]?.label}`,
      category: 'sistem',
    });
  };

  const handleDeleteUserClick = (user: UserAccount) => {
    setDeleteError(null);
    if (user.id === currentUser.id) {
      setDeleteError('Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini!');
      return;
    }

    const adminCount = users.filter((u) => u.role === 'admin').length;
    if (user.role === 'admin' && adminCount <= 1) {
      setDeleteError('Tidak dapat menghapus Super Admin terakhir! Sistem harus memiliki minimal 1 Admin.');
      return;
    }

    setUserToDelete(user);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    const filtered = users.filter((u) => u.id !== userToDelete.id);
    setUsers(filtered);
    appStorage.saveUsers(filtered);

    appStorage.addAuditLog({
      userName: currentUser.name || 'Admin',
      userRole: currentUser.role,
      action: 'Hapus Akun Pengurus',
      details: `Menghapus akun ${userToDelete.name || userToDelete.id} (${userToDelete.role})`,
      category: 'sistem',
    });

    if (onUsersUpdated) onUsersUpdated(filtered);

    // Sync to server
    syncService.pushStateToServer(appStorage.getFullState(), true);

    setUserToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Kelola & Buat Akun Pengurus</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {users.length} Akun Terdaftar
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Buat akun baru atau edit kredensial (nama, peran jabatan, nomor HP, dan PIN login) untuk setiap pengurus takmir.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Buat Akun Baru</span>
        </button>
      </div>

      {deleteError && (
        <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{deleteError}</span>
        </div>
      )}

      {/* Users List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {users.map((user) => {
          const roleConfig = ROLES_CONFIG[user.role] || ROLES_CONFIG.bendahara;
          const isCurrent = currentUser.id === user.id;
          const isPinRevealed = revealedPins[user.id] || false;

          return (
            <div
              key={user.id}
              className={`p-4 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-md shadow-emerald-950/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">
                      {user.name && user.name.trim() !== '' ? user.name : '(Nama belum diatur)'}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500 text-slate-950 shadow-xs">
                        Aktif Saat Ini
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleConfig.badgeClass}`}
                    >
                      {roleConfig.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ID: {user.id.slice(0, 14)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Data Akun & PIN"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteUserClick(user)}
                    disabled={isCurrent}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isCurrent
                        ? 'opacity-30 cursor-not-allowed bg-slate-900 text-slate-600'
                        : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 cursor-pointer'
                    }`}
                    title={isCurrent ? 'Tidak dapat menghapus akun aktif' : 'Hapus Akun'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* User details (Email, Phone, PIN) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email:</span>
                  </span>
                  <span className="font-mono text-slate-200 truncate max-w-[180px]">
                    {user.email || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>WhatsApp / HP:</span>
                  </span>
                  <span className="font-mono text-slate-200">
                    {user.phone || '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>PIN Masuk:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold tracking-widest text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {isPinRevealed ? user.pin : '••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePinReveal(user.id)}
                      className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                      title={isPinRevealed ? 'Sembunyikan PIN' : 'Lihat PIN'}
                    >
                      {isPinRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Switch button */}
              {!isCurrent && (
                <div className="mt-3 pt-2 border-t border-slate-800/60">
                  <button
                    onClick={() => handleSwitchActiveUser(user)}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Jadikan Akun Aktif Saat Ini</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT USER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                {editingUser ? <Edit2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingUser ? 'Edit Akun Pengurus' : 'Buat Akun Pengurus Baru'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingUser
                    ? 'Perbarui informasi profil dan PIN keamanan akun'
                    : 'Tambahkan pengurus DKM baru dengan otoritas hak akses spesifik'}
                </p>
              </div>
            </div>

            {feedback && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-semibold ${
                  feedback.ok
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/20 border border-rose-500/30 text-rose-300'
                }`}
              >
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nama Lengkap Pengurus *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Ahmad Fauzi, S.E."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Peran & Otoritas Jabatan *
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="admin">Super Admin (Akses Penuh Seluruh Modul & Pengaturan)</option>
                  <option value="bendahara">Bendahara (Manajemen Kas, Bank, Rekening & Keuangan)</option>
                  <option value="sekretaris">Sekretaris (Jadwal Petugas, Notulensi Rapat & Aset)</option>
                  <option value="ketua_takmir">Ketua DKM (Otoritas Kebijakan & Pengawasan)</option>
                  <option value="operator_tv">Operator TV (Display TV Mading & Teks Berjalan)</option>
                  <option value="marbot">Marbot (Sarpras & Peminjaman Barang)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {ROLES_CONFIG[formRole]?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Email Pengurus
                  </label>
                  <input
                    type="email"
                    placeholder="nama@masjid.id"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PIN Keamanan Masuk (4-6 Angka) *</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPin ? 'Tutup' : 'Lihat'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">
                      PIN Baru (4-6 digit)
                    </label>
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      maxLength={6}
                      placeholder="1234"
                      value={formPin}
                      onChange={(e) => setFormPin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1">
                      Ulangi Konfirmasi PIN
                    </label>
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      maxLength={6}
                      placeholder="1234"
                      value={formPinConfirm}
                      onChange={(e) => setFormPinConfirm(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingUser ? 'Simpan Perubahan Akun' : 'Buat & Daftarkan Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {userToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(userToDelete)}
          title="Hapus Akun Pengurus"
          message={`Apakah Anda yakin ingin menghapus akun pengurus "${userToDelete.name || userToDelete.id}" (${ROLES_CONFIG[userToDelete.role]?.label || userToDelete.role})? Pengurus ini tidak akan dapat login lagi menggunakan PIN akun tersebut.`}
          itemDetails={[
            { label: 'Nama Pengurus', value: userToDelete.name || '-' },
            { label: 'Peran / Jabatan', value: ROLES_CONFIG[userToDelete.role]?.label || userToDelete.role },
            { label: 'No. WhatsApp / HP', value: userToDelete.phone || '-' },
            { label: 'Email', value: userToDelete.email || '-' },
          ]}
          confirmLabel="Ya, Hapus Akun"
          onConfirm={confirmDeleteUser}
          onClose={() => setUserToDelete(null)}
        />
      )}
    </div>
  );
};
