import React, { useState } from 'react';
import {
  Users,
  Printer,
  Upload,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  PlusCircle,
  Eye,
  Trash2,
  Camera,
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { MeetingRecord, MosqueProfile, UserAccount } from '../../types';
import { formatIndonesianDate } from '../../utils/prayerTimes';
import { appStorage } from '../../utils/storage';

interface DaftarHadirRapatProps {
  meetings: MeetingRecord[];
  profile: MosqueProfile;
  currentUser: UserAccount;
  onUpdateMeetings: (meetings: MeetingRecord[]) => void;
}

export const DaftarHadirRapat: React.FC<DaftarHadirRapatProps> = ({
  meetings,
  profile,
  currentUser,
  onUpdateMeetings,
}) => {
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRecord | null>(meetings[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<MeetingRecord | null>(null);

  const executeDeleteMeeting = (meeting: MeetingRecord) => {
    const updated = meetings.filter((m) => m.id !== meeting.id);
    onUpdateMeetings(updated);
    if (selectedMeeting?.id === meeting.id) {
      setSelectedMeeting(updated[0] || null);
    }
    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Hapus Arsip Rapat',
      details: `Menghapus arsip rapat & notulen "${meeting.title}" tanggal ${meeting.date}`,
      category: 'rapat',
    });
    setMeetingToDelete(null);
  };

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('20:00 WIB');
  const [location, setLocation] = useState('Ruang Rapat Utama Masjid');
  const [leader, setLeader] = useState(profile.ketuaTakmir);
  const [agenda, setAgenda] = useState('');
  const [minutes, setMinutes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Generate attendee template dynamically from updated DKM officers
  const getDefaultAttendees = () => {
    const list: Array<{ name: string; role: string; present: boolean }> = [];
    if (profile.ketuaTakmir) {
      list.push({ name: profile.ketuaTakmir, role: 'Ketua Takmir', present: true });
    }
    if (profile.wakilKetua) {
      list.push({ name: profile.wakilKetua, role: 'Wakil Ketua Takmir', present: true });
    }
    if (profile.sekretaris) {
      list.push({ name: profile.sekretaris, role: 'Sekretaris 1', present: true });
    }
    if (profile.sekretaris2) {
      list.push({ name: profile.sekretaris2, role: 'Sekretaris 2', present: true });
    }
    if (profile.bendahara) {
      list.push({ name: profile.bendahara, role: 'Bendahara 1', present: true });
    }
    if (profile.bendahara2) {
      list.push({ name: profile.bendahara2, role: 'Bendahara 2', present: true });
    }
    if (profile.sieKeamanan) {
      list.push({ name: profile.sieKeamanan, role: 'Sie Keamanan & Ketertiban', present: true });
    }
    if (profile.siePerlengkapan) {
      list.push({ name: profile.siePerlengkapan, role: 'Sie Pemeliharaan & Aset', present: true });
    }
    if (profile.siePeribadatan) {
      list.push({ name: profile.siePeribadatan, role: 'Sie Dakwah & Ibadah', present: true });
    }
    if (profile.sieRemaja) {
      list.push({ name: profile.sieRemaja, role: 'Sie Remaja Masjid (RISMA)', present: true });
    }
    if (profile.sieHumas) {
      list.push({ name: profile.sieHumas, role: 'Sie Humas & Kemitraan', present: true });
    }
    if (profile.customOfficers && profile.customOfficers.length > 0) {
      profile.customOfficers.forEach((co) => {
        if (co.name) {
          list.push({ name: co.name, role: co.roleTitle, present: true });
        }
      });
    }
    if (list.length === 0) {
      list.push({ name: 'Pengurus Masjid', role: 'Takmir', present: true });
    }
    return list;
  };

  const handleToggleAttendance = (meetingId: string, attendeeIndex: number) => {
    const updated = meetings.map((m) => {
      if (m.id === meetingId) {
        const newAttendees = [...m.attendees];
        newAttendees[attendeeIndex] = {
          ...newAttendees[attendeeIndex],
          present: !newAttendees[attendeeIndex].present,
        };
        return { ...m, attendees: newAttendees };
      }
      return m;
    });

    onUpdateMeetings(updated);
    if (selectedMeeting && selectedMeeting.id === meetingId) {
      setSelectedMeeting(updated.find((m) => m.id === meetingId) || null);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, meetingId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        const updated = meetings.map((m) => (m.id === meetingId ? { ...m, photoUrl: url } : m));
        onUpdateMeetings(updated);
        if (selectedMeeting && selectedMeeting.id === meetingId) {
          setSelectedMeeting({ ...selectedMeeting, photoUrl: url });
        }
        appStorage.addAuditLog({
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Upload Foto Dokumentasi Rapat',
          details: `Mengunggah foto bukti fisik rapat ke Google Drive & arsip aplikasi`,
          category: 'rapat',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeet: MeetingRecord = {
      id: 'meet-' + Date.now(),
      title,
      date,
      time,
      location,
      leader,
      agenda,
      minutes: minutes || 'Notulensi dalam proses pencatatan.',
      attendees: getDefaultAttendees(),
      photoUrl: photoUrl || undefined,
    };

    const updated = [newMeet, ...meetings];
    onUpdateMeetings(updated);
    setSelectedMeeting(newMeet);
    setShowAddModal(false);

    // Reset
    setTitle('');
    setAgenda('');
    setMinutes('');
    setPhotoUrl('');

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Tambah Data Rapat',
      details: `Membuat rapat baru: ${title} pada ${date}`,
      category: 'rapat',
    });
  };

  return (
    <div id="daftar-hadir-rapat-module" className="space-y-6">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Daftar Hadir Rapat & Notulensi Pengurus</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Histori absensi kehadiran, dokumen notulen, upload foto fisik, dan cetak format absensi instan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedMeeting && (
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Form Absensi PDF</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Rapat Baru</span>
          </button>
        </div>
      </div>

      {/* 2-Column Layout: Meeting List on Left, Active Meeting Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Meeting List Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Arsip Pertemuan & Rapat ({meetings.length})
          </h4>

          {meetings.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
              <Calendar className="w-8 h-8 mx-auto text-slate-600 mb-2 stroke-1" />
              <p className="font-semibold text-slate-400">Belum ada notulen rapat</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Klik "+ Buat Notulen Rapat" di atas untuk mencatat agenda rapat baru.
              </p>
            </div>
          ) : (
            meetings.map((m) => {
              const isSelected = selectedMeeting?.id === m.id;
              const presentCount = m.attendees.filter((a) => a.present).length;
              return (
              <div
                key={m.id}
                onClick={() => setSelectedMeeting(m)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {m.date}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-400">
                      {presentCount}/{m.attendees.length} Hadir
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMeetingToDelete(m);
                      }}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-700/50 transition-colors"
                      title="Hapus Rapat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h5 className="font-bold text-sm text-slate-100 line-clamp-2">{m.title}</h5>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{m.location}</span>
                </p>
              </div>
            );
          }))}
        </div>

        {/* Selected Meeting Details */}
        <div className="lg:col-span-8">
          {selectedMeeting ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              {/* Meeting Header */}
              <div className="border-b border-slate-800 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Notulen Resmi DKM
                    </span>
                    <button
                      onClick={() => setMeetingToDelete(selectedMeeting)}
                      className="px-2.5 py-0.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-medium flex items-center gap-1 transition-colors border border-rose-500/20"
                      title="Hapus Arsip Rapat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Notulen</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {selectedMeeting.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {selectedMeeting.time}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-white">{selectedMeeting.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Pimpinan Rapat: <strong className="text-slate-200">{selectedMeeting.leader}</strong> • Lokasi: {selectedMeeting.location}
                </p>
              </div>

              {/* Agenda & Notulensi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Agenda Pembahasan</span>
                  </h5>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {selectedMeeting.agenda}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Keputusan & Notulensi</span>
                  </h5>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {selectedMeeting.minutes}
                  </p>
                </div>
              </div>

              {/* Attendance Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Daftar Kehadiran Pengurus Takmir</span>
                  </h5>
                  <span className="text-xs text-slate-400">
                    Klik status untuk ubah Hadir / Izin
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="p-3 w-10 text-center">No</th>
                        <th className="p-3">Nama Pengurus</th>
                        <th className="p-3">Jabatan / Amanah</th>
                        <th className="p-3 w-28 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedMeeting.attendees.map((att, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 text-center text-slate-500">{idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-200">{att.name}</td>
                          <td className="p-3 text-slate-400">{att.role}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleToggleAttendance(selectedMeeting.id, idx)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                att.present
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {att.present ? '✓ Hadir' : '✕ Izin'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dokumentasi Foto Bukti Rapat (Google Drive Sync) */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>Foto & Berkas Bukti Fisik Rapat</span>
                    </h5>
                    <p className="text-xs text-slate-400">
                      Tersimpan aman di arsip Google Drive masjid untuk audit LPJ
                    </p>
                  </div>

                  <label className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e, selectedMeeting.id)}
                    />
                  </label>
                </div>

                {selectedMeeting.photoUrl && selectedMeeting.photoUrl.trim() !== '' ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-72 bg-slate-950 flex items-center justify-center">
                    <img
                      src={selectedMeeting.photoUrl}
                      alt="Dokumentasi Rapat"
                      className="max-h-72 w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500 bg-slate-950/40">
                    Belum ada foto dokumentasi fisik rapat. Klik "Upload Foto" di atas untuk menyimpan bukti ke Google Drive.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
              {meetings.length === 0
                ? 'Belum ada notulen rapat. Klik "+ Buat Notulen Rapat" di atas untuk membuat rapat perdana.'
                : 'Pilih salah satu rapat dari daftar di sebelah kiri.'}
            </div>
          )}
        </div>
      </div>

      {/* CREATE NEW MEETING MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h4 className="font-bold text-base text-white">Buat Notulen & Agenda Rapat Baru</h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Judul / Topik Rapat *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rapat Koordinasi Panitia Ramadhan & Buka Bersama"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

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
                  <label className="block text-slate-400 font-medium mb-1">Waktu / Jam *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 20:00 WIB"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Lokasi Rapat</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Pimpinan Rapat</label>
                  <input
                    type="text"
                    value={leader}
                    onChange={(e) => setLeader(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Agenda Pembahasan *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tulis poin-poin agenda pembahasan..."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Keputusan & Notulensi Awal</label>
                <textarea
                  rows={2}
                  placeholder="Tulis hasil keputusan atau catatan rapat..."
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
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
                  Simpan Rapat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT FORM ABSENSI MODAL (Siap Tanda Tangan Basah) */}
      {showPrintModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl">
            <div className="no-print p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm text-white">Preview Cetak Formulir Absensi Rapat Resmi</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen Sekarang</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900">
              {/* Kop Surat */}
              <div className="border-b-4 border-double border-slate-900 pb-3 mb-5 flex items-center gap-4">
                {profile.logoUrl && profile.logoUrl.trim() !== '' ? (
                  <img
                    src={profile.logoUrl}
                    alt="Logo"
                    className="w-16 h-16 object-cover rounded-xl border border-slate-300"
                  />
                ) : null}
                <div>
                  <h1 className="text-xl font-black uppercase text-slate-900">
                    DEWAN KEMAKMURAN MASJID (DKM)
                  </h1>
                  <h2 className="text-lg font-bold text-emerald-800">{profile.name}</h2>
                  <p className="text-xs text-slate-600">
                    {profile.address}, {profile.city} • Telp/WA: {profile.phone}
                  </p>
                </div>
              </div>

              <div className="text-center mb-5">
                <h3 className="text-base font-black uppercase underline underline-offset-4">
                  DAFTAR HADIR RAPAT PENGURUS
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-1">{selectedMeeting.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-4 p-3 bg-slate-50 border rounded-lg">
                <div>
                  <p><strong>Hari/Tanggal:</strong> {selectedMeeting.date}</p>
                  <p><strong>Waktu:</strong> {selectedMeeting.time}</p>
                </div>
                <div>
                  <p><strong>Tempat:</strong> {selectedMeeting.location}</p>
                  <p><strong>Pimpinan Rapat:</strong> {selectedMeeting.leader}</p>
                </div>
              </div>

              {/* Table of Attendance with Signature column */}
              <table className="w-full text-left text-xs border-collapse border border-slate-400 mb-8">
                <thead>
                  <tr className="bg-slate-100 font-bold">
                    <th className="border border-slate-400 p-2 w-8 text-center">No</th>
                    <th className="border border-slate-400 p-2">Nama Pengurus</th>
                    <th className="border border-slate-400 p-2 w-48">Amanah / Jabatan</th>
                    <th className="border border-slate-400 p-2 w-28 text-center">Status</th>
                    <th className="border border-slate-400 p-2 w-32 text-center">Tanda Tangan</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMeeting.attendees.map((att, idx) => (
                    <tr key={idx}>
                      <td className="border border-slate-400 p-2.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-400 p-2.5 font-bold">{att.name}</td>
                      <td className="border border-slate-400 p-2.5 text-slate-600">{att.role}</td>
                      <td className="border border-slate-400 p-2.5 text-center font-semibold">
                        {att.present ? 'HADIR' : 'IZIN'}
                      </td>
                      <td className="border border-slate-400 p-2.5 text-center text-slate-400 font-mono text-[10px]">
                        {att.present ? `${idx + 1}. .........` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signature footer */}
              <div className="grid grid-cols-2 text-center text-xs mt-10">
                <div>
                  <p className="text-slate-600 mb-14">Mengetahui,<br /><strong>Pimpinan Rapat</strong></p>
                  <p className="font-bold underline">{selectedMeeting.leader}</p>
                </div>
                <div>
                  <p className="text-slate-600 mb-14">
                    {profile.city}, {formatIndonesianDate(new Date())}<br />
                    <strong>Notulis / Sekretaris</strong>
                  </p>
                  <p className="font-bold underline">{profile.sekretaris}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MEETING MODAL */}
      <DeleteConfirmModal
        isOpen={!!meetingToDelete}
        title="Hapus Arsip Rapat & Notulen"
        message={
          meetingToDelete ? (
            <span>
              Apakah Anda yakin ingin menghapus arsip rapat{' '}
              <strong>"{meetingToDelete.title}"</strong> tanggal{' '}
              <strong>{meetingToDelete.date}</strong>? Semua catatan notulensi dan daftar hadir akan dihapus secara permanen.
            </span>
          ) : (
            ''
          )
        }
        itemDetails={
          meetingToDelete
            ? [
                { label: 'Agenda / Judul', value: meetingToDelete.title },
                { label: 'Tanggal', value: meetingToDelete.date },
                { label: 'Waktu', value: meetingToDelete.time },
                { label: 'Lokasi', value: meetingToDelete.location },
                { label: 'Pimpinan Rapat', value: meetingToDelete.leader },
                {
                  label: 'Kehadiran Pengurus',
                  value: `${meetingToDelete.attendees.filter((a) => a.present).length} dari ${meetingToDelete.attendees.length} hadir`,
                },
              ]
            : []
        }
        confirmLabel="Ya, Hapus Rapat"
        onConfirm={() => {
          if (meetingToDelete) {
            executeDeleteMeeting(meetingToDelete);
          }
        }}
        onClose={() => setMeetingToDelete(null)}
      />
    </div>
  );
};
