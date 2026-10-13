import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Calendar,
  User,
  Clock,
  FileSpreadsheet,
  Filter,
  CheckCircle,
} from 'lucide-react';
import { AuditLog, UserAccount } from '../../types';
import { exportToCSV } from '../../utils/storage';

interface AuditTrailProps {
  logs: AuditLog[];
  currentUser: UserAccount;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || log.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Waktu & Tanggal', 'Pengurus (User)', 'Role', 'Aktivitas / Aksi', 'Kategori', 'Rincian'];
    const rows = [
      ['LOG AUDIT AKTIVITAS DIGITAL PENGURUS MASJID'],
      headers,
      ...filtered.map((l) => [
        l.id,
        l.timestamp,
        l.userName,
        l.userRole.toUpperCase(),
        l.action,
        l.category.toUpperCase(),
        l.details,
      ]),
    ];
    exportToCSV(`Audit-Trail-Masjid-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'kas':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'aset':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'jadwal':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      case 'qurban':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'drive':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div id="audit-trail-module" className="space-y-6">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <span>Log Aktivitas Petugas (Audit Trail Digital)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Rekam jejak transparansi: siapa login, jam berapa, dan sedang mengubah atau mengunggah data apa
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Log Audit (CSV)</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Cari user / tindakan / kata kunci..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Semua Kategori Aktivitas</option>
            <option value="kas">Keuangan & Kas Masjid</option>
            <option value="aset">Inventaris & Peminjaman Aset</option>
            <option value="jadwal">Jadwal Petugas Sholat</option>
            <option value="rapat">Rapat & Kehadiran</option>
            <option value="qurban">Data Peserta Qurban</option>
            <option value="drive">Sinkronisasi Google Drive</option>
            <option value="sistem">Sistem & Login Admin</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="p-3.5 w-40">Waktu & Tanggal</th>
                <th className="p-3.5 w-48">Pengurus / Petugas</th>
                <th className="p-3.5 w-40">Aksi / Tindakan</th>
                <th className="p-3.5 w-24 text-center">Modul</th>
                <th className="p-3.5">Rincian Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <p className="font-bold text-slate-200">{log.userName}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{log.userRole}</p>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-200">
                    {log.action}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(log.category)}`}>
                      {log.category.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {log.details}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Tidak ada log audit yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
