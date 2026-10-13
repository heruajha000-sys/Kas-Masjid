import React, { useState } from 'react';
import {
  Calendar,
  UserCheck,
  Phone,
  Send,
  PlusCircle,
  Clock,
  Sparkles,
  BookOpen,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { DutySchedule, MosqueProfile, UserAccount } from '../../types';
import { createWhatsAppUrl, buildDutyReminderWaMessage } from '../../utils/whatsapp';
import { appStorage } from '../../utils/storage';

interface JadwalPetugasProps {
  duties: DutySchedule[];
  profile: MosqueProfile;
  currentUser: UserAccount;
  onUpdateDuties: (duties: DutySchedule[]) => void;
}

export const JadwalPetugas: React.FC<JadwalPetugasProps> = ({
  duties,
  profile,
  currentUser,
  onUpdateDuties,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [dutyToDelete, setDutyToDelete] = useState<DutySchedule | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<DutySchedule['type']>('Jumat');
  const [khatib, setKhatib] = useState('');
  const [imam, setImam] = useState('');
  const [muadzin, setMuadzin] = useState('');
  const [penceramah, setPenceramah] = useState('');
  const [theme, setTheme] = useState('');
  const [phone, setPhone] = useState('');

  const filtered = duties.filter((d) => {
    if (filterType === 'all') return true;
    return d.type === filterType;
  });

  const handleSendWA = (duty: DutySchedule) => {
    const officerName = duty.khatib && duty.khatib !== '-' ? duty.khatib : (duty.penceramah || duty.imam);
    const roleTitle = duty.type === 'Jumat' ? 'Khatib Sholat Jumat' : (duty.penceramah ? 'Penceramah Kajian' : 'Imam Sholat');

    const msg = buildDutyReminderWaMessage({
      mosqueName: profile.name,
      dutyType: duty.type,
      date: duty.date,
      officerName: officerName,
      role: roleTitle,
      theme: duty.theme,
      contactPerson: `${profile.sekretaris} (${profile.phone})`,
    });

    const url = createWhatsAppUrl(duty.phone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');

    // Update duty status to waSent: true
    const updated = duties.map((d) => (d.id === duty.id ? { ...d, waSent: true } : d));
    onUpdateDuties(updated);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Kirim Pengingat WA Petugas',
      details: `Mengirim pesan WhatsApp pengingat tugas ${duty.type} kepada ${officerName} (${duty.phone})`,
      category: 'jadwal',
    });
  };

  const handleAddDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      alert('Nomor WhatsApp petugas wajib diisi untuk fitur pengingat otomatis');
      return;
    }

    const newDuty: DutySchedule = {
      id: 'duty-' + Date.now(),
      date,
      type,
      khatib: khatib.trim() || '-',
      imam: imam.trim() || '-',
      muadzin: muadzin.trim() || '-',
      penceramah: penceramah.trim() || undefined,
      theme: theme.trim() || 'Kajian Rutin & Ibadah Berjamaah',
      phone: phone.trim(),
      waSent: false,
    };

    const updated = [newDuty, ...duties];
    onUpdateDuties(updated);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Tambah Jadwal Petugas',
      details: `Menambahkan jadwal ${type} tgl ${date} dengan Khatib/Imam ${khatib || imam}`,
      category: 'jadwal',
    });

    // Reset
    setKhatib('');
    setImam('');
    setMuadzin('');
    setPenceramah('');
    setTheme('');
    setPhone('');
    setShowAddModal(false);
  };

  const handleDeleteDuty = (id: string) => {
    const duty = duties.find((d) => d.id === id);
    if (!duty) return;
    setDutyToDelete(duty);
  };

  const executeDeleteDuty = (duty: DutySchedule) => {
    const updated = duties.filter((d) => d.id !== duty.id);
    onUpdateDuties(updated);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Hapus Jadwal Petugas',
      details: `Menghapus jadwal ${duty.type} tanggal ${duty.date} (${duty.khatib || duty.imam || duty.penceramah || '-'})`,
      category: 'jadwal',
    });

    setDutyToDelete(null);
  };

  return (
    <div id="jadwal-petugas-module" className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>Manajemen Jadwal Petugas & Pengingat WhatsApp</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Database Imam, Khatib, Penceramah kajian dengan pesan konfirmasi otomatis langsung ke WA
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Jenis Kegiatan</option>
            <option value="Jumat">Sholat Jumat</option>
            <option value="Kajian Ahad">Kajian Ahad</option>
            <option value="Subuh Akbar">Subuh Akbar</option>
            <option value="Tarawih">Tarawih / Ramadhan</option>
            <option value="Sholat Id">Sholat Idul Fitri / Adha</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Buat Jadwal Baru</span>
          </button>
        </div>
      </div>

      {/* Grid of Schedules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((duty) => (
          <div
            key={duty.id}
            id={`duty-card-${duty.id}`}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {duty.type}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {duty.date}
                </span>
              </div>

              {/* Tema / Judul */}
              <h4 className="font-bold text-slate-100 text-sm mb-3">
                "{duty.theme}"
              </h4>

              {/* Rincian Petugas */}
              <div className="space-y-1.5 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {duty.khatib && duty.khatib !== '-' && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Khatib:</span>
                    <span className="font-bold text-slate-200">{duty.khatib}</span>
                  </div>
                )}
                {duty.penceramah && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Penceramah:</span>
                    <span className="font-bold text-slate-200">{duty.penceramah}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Imam:</span>
                  <span className="font-bold text-slate-200">{duty.imam}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Muadzin:</span>
                  <span className="font-semibold text-slate-300">{duty.muadzin}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px]">
                  <span className="text-slate-500">No. WhatsApp:</span>
                  <span className="font-mono text-emerald-400">{duty.phone}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {duty.waSent ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>WA Terkirim</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Belum Diingatkan</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendWA(duty)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
                  title="Kirim pesan WhatsApp otomatis ke nomor petugas"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim WA</span>
                </button>

                <button
                  onClick={() => handleDeleteDuty(duty.id)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 p-10 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            Belum ada jadwal penugasan untuk kategori ini.
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h4 className="font-bold text-base text-white">Tambah Jadwal Penugasan Petugas</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDuty} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Jenis Kegiatan *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DutySchedule['type'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Jumat">Sholat Jumat</option>
                    <option value="Kajian Ahad">Kajian Ahad</option>
                    <option value="Subuh Akbar">Subuh Akbar</option>
                    <option value="Tarawih">Tarawih / Ramadhan</option>
                    <option value="Sholat Id">Sholat Idul Fitri / Adha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Khatib / Penceramah</label>
                <input
                  type="text"
                  placeholder="Contoh: Prof. Dr. KH. Syukron Ma'mun"
                  value={type === 'Jumat' ? khatib : penceramah}
                  onChange={(e) => {
                    if (type === 'Jumat') setKhatib(e.target.value);
                    else setPenceramah(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Imam Sholat *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ustadz Hafizh Al-Bantani"
                    value={imam}
                    onChange={(e) => setImam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Muadzin / Bilal</label>
                  <input
                    type="text"
                    placeholder="Contoh: Ust. Bilal Mansur"
                    value={muadzin}
                    onChange={(e) => setMuadzin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Tema Khutbah / Materi Kajian</label>
                <input
                  type="text"
                  placeholder="Contoh: Menjaga Hati Bersih Menghadapi Godaan Duniawi"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nomor WhatsApp Petugas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Format angka biasa (08... atau 62...). Sistem otomatis mengonversi ke link WA.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DUTY SCHEDULE MODAL */}
      <DeleteConfirmModal
        isOpen={!!dutyToDelete}
        title="Hapus Jadwal Penugasan"
        message={
          dutyToDelete ? (
            <span>
              Apakah Anda yakin ingin menghapus jadwal penugasan{' '}
              <strong>{dutyToDelete.type}</strong> pada tanggal{' '}
              <strong>{dutyToDelete.date}</strong>?
            </span>
          ) : (
            ''
          )
        }
        itemDetails={
          dutyToDelete
            ? [
                { label: 'Jenis Tugas', value: dutyToDelete.type },
                { label: 'Tanggal', value: dutyToDelete.date },
                { label: 'Khatib', value: dutyToDelete.khatib || '-' },
                { label: 'Imam', value: dutyToDelete.imam || '-' },
                { label: 'Muadzin', value: dutyToDelete.muadzin || '-' },
                { label: 'Penceramah', value: dutyToDelete.penceramah || '-' },
                { label: 'Judul / Tema', value: dutyToDelete.theme || '-' },
              ]
            : []
        }
        confirmLabel="Ya, Hapus Jadwal"
        onConfirm={() => {
          if (dutyToDelete) {
            executeDeleteDuty(dutyToDelete);
          }
        }}
        onClose={() => setDutyToDelete(null)}
      />
    </div>
  );
};
