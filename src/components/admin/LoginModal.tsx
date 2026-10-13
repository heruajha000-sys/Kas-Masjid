import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldCheck, ArrowRight, CheckCircle2, Tv, Wrench } from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import { appStorage } from '../../utils/storage';
import { ROLES_CONFIG } from '../../utils/rbac';

interface LoginModalProps {
  onLoginSuccess: (user: UserAccount) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onClose }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('bendahara');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = appStorage.getUsers();
    let found = users.find(
      (u) => u.role === selectedRole && (u.pin === pin || pin === '1234')
    );

    // If not in storage yet, create fallback account
    if (!found && (pin === '1234' || pin === '')) {
      found = {
        id: `user-${selectedRole}`,
        name: ROLES_CONFIG[selectedRole]?.label || 'Pengurus DKM',
        role: selectedRole,
        email: `${selectedRole}@masjid.id`,
        phone: '081234567890',
        pin: '1234',
      };
    }

    if (found) {
      appStorage.saveCurrentUser(found);
      appStorage.addAuditLog({
        userName: found.name,
        userRole: found.role,
        action: 'Login Admin Masuk',
        details: `Petugas berhasil login sebagai ${ROLES_CONFIG[found.role]?.label || found.role}`,
        category: 'sistem',
      });
      onLoginSuccess(found);
    } else {
      setErrorMsg('PIN keamanan tidak sesuai! (PIN bawaan: 1234)');
    }
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    const users = appStorage.getUsers();
    let found = users.find((u) => u.role === role);
    if (!found) {
      found = {
        id: `user-${role}`,
        name: ROLES_CONFIG[role]?.label || 'Pengurus DKM',
        role: role,
        email: `${role}@masjid.id`,
        phone: '081234567890',
        pin: '1234',
      };
    }
    appStorage.saveCurrentUser(found);
    appStorage.addAuditLog({
      userName: found.name,
      userRole: found.role,
      action: 'Login Cepat Masuk',
      details: `Masuk sebagai ${ROLES_CONFIG[found.role]?.label || found.role}`,
      category: 'sistem',
    });
    onLoginSuccess(found);
  };

  const activeRoleConfig = ROLES_CONFIG[selectedRole] || ROLES_CONFIG.bendahara;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-5">
          <div className="w-13 h-13 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-2.5 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Login Pengurus DKM</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistem Hak Akses Berjenjang (RBAC) & Verifikasi Otoritas
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Pilih Peran & Jabatan Pengurus</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('bendahara')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'bendahara'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold'
                }`}
              >
                <div>Bendahara</div>
                <div className="text-[10px] opacity-75 font-normal">Kas & Bank</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('sekretaris')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'sekretaris'
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold'
                }`}
              >
                <div>Sekretaris</div>
                <div className="text-[10px] opacity-75 font-normal">Jadwal & Aset</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('ketua_takmir')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'ketua_takmir'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold'
                }`}
              >
                <div>Ketua DKM</div>
                <div className="text-[10px] opacity-75 font-normal">Otoritas Penuh</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('operator_tv')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'operator_tv'
                    ? 'bg-indigo-500 text-slate-950 border-indigo-400 font-bold shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold'
                }`}
              >
                <div>Operator TV</div>
                <div className="text-[10px] opacity-75 font-normal">Display & Jam</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('marbot')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'marbot'
                    ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold'
                }`}
              >
                <div>Marbot</div>
                <div className="text-[10px] opacity-75 font-normal">Fisik & Sarana</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-purple-500 text-slate-950 border-purple-400 font-bold shadow-md'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold'
                }`}
              >
                <div>Super Admin</div>
                <div className="text-[10px] opacity-75 font-normal">Master Control</div>
              </button>
            </div>
          </div>

          {/* Role permissions card */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Hak Akses: {activeRoleConfig.label}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${activeRoleConfig.badgeClass}`}>
                {activeRoleConfig.shortLabel}
              </span>
            </div>
            <p className="text-slate-400">{activeRoleConfig.description}</p>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">PIN Pengurus (Default: 1234)</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                required
                maxLength={6}
                placeholder="Masukkan 4 digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono tracking-widest text-center text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors mt-2"
          >
            <span>Masuk ke Panel Pengurus</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Access */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Atau Akses Cepat Langsung
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
            <button
              onClick={() => handleQuickRoleLogin('bendahara')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 transition-colors"
            >
              <div className="font-bold text-emerald-400 text-[11px]">Bendahara</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Kas & Bank</div>
            </button>
            <button
              onClick={() => handleQuickRoleLogin('sekretaris')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-sky-500/50 transition-colors"
            >
              <div className="font-bold text-sky-400 text-[11px]">Sekretaris</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Jadwal & Aset</div>
            </button>
            <button
              onClick={() => handleQuickRoleLogin('ketua_takmir')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition-colors"
            >
              <div className="font-bold text-amber-400 text-[11px]">Ketua DKM</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Otoritas</div>
            </button>
            <button
              onClick={() => handleQuickRoleLogin('operator_tv')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition-colors"
            >
              <div className="font-bold text-indigo-400 text-[11px]">Operator TV</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Mading & Jam</div>
            </button>
            <button
              onClick={() => handleQuickRoleLogin('marbot')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50 transition-colors"
            >
              <div className="font-bold text-teal-400 text-[11px]">Marbot</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Sarana Fisik</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
