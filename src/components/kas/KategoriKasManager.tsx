import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Tag,
  CheckCircle,
  BarChart3,
  Filter,
} from 'lucide-react';
import { Transaction, BankAccount, UserAccount } from '../../types';
import { formatRupiah, appStorage } from '../../utils/storage';

interface KategoriKasManagerProps {
  transactions: Transaction[];
  accounts: BankAccount[];
  currentUser: UserAccount;
  onNavigateToKasCategory?: (category: string) => void;
}

export const KategoriKasManager: React.FC<KategoriKasManagerProps> = ({
  transactions,
  accounts,
  currentUser,
  onNavigateToKasCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'in' | 'out'>('in');
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('masjid_custom_categories');
    return saved
      ? JSON.parse(saved)
      : [
          'Kotak Infaq Jumat',
          'Infaq Subuh Berkah',
          'Donasi Renovasi Kubah',
          'QRIS Non-Tunai',
          'Wakaf Karpet & Sarana',
          'Zakat Fitrah & Maal',
          'Listrik & Air PLN/PDAM',
          'Kebersihan & Perlengkapan',
          'Honorarium Imam & Muadzin',
          'Santunan Yatim & Dhuafa',
          'Operasional Kantor & IT',
          'Konsumsi Jamaah & Kajian',
        ];
  });

  const [newCatName, setNewCatName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Group transactions by category for in and out
  const categoryStats = React.useMemo(() => {
    const mapIn: Record<string, number> = {};
    const mapOut: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === 'in') {
        mapIn[t.category] = (mapIn[t.category] || 0) + t.amount;
      } else {
        mapOut[t.category] = (mapOut[t.category] || 0) + t.amount;
      }
    });

    const totalIn = Object.values(mapIn).reduce((a, b) => a + b, 0);
    const totalOut = Object.values(mapOut).reduce((a, b) => a + b, 0);

    return { mapIn, mapOut, totalIn, totalOut };
  }, [transactions]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (customCategories.includes(newCatName.trim())) {
      alert('Kategori sudah ada.');
      return;
    }

    const updated = [...customCategories, newCatName.trim()];
    setCustomCategories(updated);
    localStorage.setItem('masjid_custom_categories', JSON.stringify(updated));
    setNewCatName('');
    setShowAddModal(false);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Tambah Kategori Kas',
      details: `Menambahkan kategori kas baru: "${newCatName.trim()}"`,
      category: 'kas',
    });
  };

  const currentMap = activeTab === 'in' ? categoryStats.mapIn : categoryStats.mapOut;
  const currentTotal = activeTab === 'in' ? categoryStats.totalIn : categoryStats.totalOut;

  // Sorted list of categories with totals
  const sortedCategories = Object.entries(currentMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Kategori Kas & Anggaran
            </h1>
            <p className="text-xs text-slate-500">
              Monitoring alokasi pengeluaran dan sumber infaq pemasukan masjid
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>

      {/* Tabs Pemasukan vs Pengeluaran */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('in')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
            activeTab === 'in'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Kategori Pemasukan Infaq (Total: {formatRupiah(categoryStats.totalIn)})</span>
        </button>

        <button
          onClick={() => setActiveTab('out')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
            activeTab === 'out'
              ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <TrendingDown className="w-4 h-4 text-rose-600" />
          <span>Kategori Pengeluaran Operasional (Total: {formatRupiah(categoryStats.totalOut)})</span>
        </button>
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCategories.map(([category, amount]) => {
          const percentage = currentTotal > 0 ? Math.round((amount / currentTotal) * 100) : 0;
          return (
            <div
              key={category}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeTab === 'in'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{category}</h3>
                    <span className="text-[11px] text-slate-400">
                      {percentage}% dari total {activeTab === 'in' ? 'pemasukan' : 'pengeluaran'}
                    </span>
                  </div>
                </div>

                <div
                  className={`text-base font-extrabold ${
                    activeTab === 'in' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatRupiah(amount)}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeTab === 'in' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(4, percentage))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Daftar Semua Kategori Terdaftar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Daftar Kategori Tersedia pada Form Transaksi
        </h3>
        <p className="text-xs text-slate-500">
          Kategori berikut dapat dipilih bendahara saat mencatat infaq atau pengeluaran
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {customCategories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-default"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-800">
              Tambah Kategori Kas Baru
            </h3>
            <p className="text-xs text-slate-500">
              Kategori baru akan langsung dapat dipilih pada pencatatan kas masuk & keluar.
            </p>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemeliharaan Sound System & Mic"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
