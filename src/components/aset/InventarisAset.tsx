import React, { useState } from 'react';
import {
  Package,
  ArrowRightLeft,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  XCircle,
  Camera,
  Send,
  Calendar,
  Clock,
  User,
  Phone,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
  Edit2,
  AlertCircle,
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import {
  MosqueAsset,
  AssetLoan,
  AssetCondition,
  MosqueProfile,
  UserAccount,
} from '../../types';
import { formatRupiah, appStorage, exportToCSV } from '../../utils/storage';
import { createWhatsAppUrl, buildAssetLoanWaMessage } from '../../utils/whatsapp';
import { compressImage } from '../../utils/imageCompression';

interface InventarisAsetProps {
  assets: MosqueAsset[];
  loans: AssetLoan[];
  profile: MosqueProfile;
  currentUser: UserAccount;
  onUpdateAssets: (assets: MosqueAsset[], loans: AssetLoan[]) => void;
}

export const InventarisAset: React.FC<InventarisAsetProps> = ({
  assets,
  loans,
  profile,
  currentUser,
  onUpdateAssets,
}) => {
  const [activeTab, setActiveTab] = useState<'aset' | 'pinjam'>('aset');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');

  // Modals
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showEditAssetModal, setShowEditAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MosqueAsset | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedAssetForLoan, setSelectedAssetForLoan] = useState<MosqueAsset | null>(null);

  // Form State: Add Asset
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('Audio & Sound System');
  const [assetQuantity, setAssetQuantity] = useState('1');
  const [assetUnit, setAssetUnit] = useState('Unit');
  const [assetPurchaseDate, setAssetPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [assetFunding, setAssetFunding] = useState('Kas Operasional BSI');
  const [assetCondition, setAssetCondition] = useState<AssetCondition>('baik');
  const [assetLocation, setAssetLocation] = useState('Ruang Utama Masjid');
  const [assetValue, setAssetValue] = useState('1000000');
  const [assetPhoto, setAssetPhoto] = useState('');

  // Form State: Edit Asset
  const [editAssetName, setEditAssetName] = useState('');
  const [editAssetCode, setEditAssetCode] = useState('');
  const [editAssetCategory, setEditAssetCategory] = useState('Audio & Sound System');
  const [editAssetTotalQuantity, setEditAssetTotalQuantity] = useState('1');
  const [editAssetAvailableQuantity, setEditAssetAvailableQuantity] = useState('1');
  const [editAssetUnit, setEditAssetUnit] = useState('Unit');
  const [editAssetPurchaseDate, setEditAssetPurchaseDate] = useState('');
  const [editAssetFunding, setEditAssetFunding] = useState('');
  const [editAssetCondition, setEditAssetCondition] = useState<AssetCondition>('baik');
  const [editAssetLocation, setEditAssetLocation] = useState('');
  const [editAssetValue, setEditAssetValue] = useState('');
  const [editAssetPhoto, setEditAssetPhoto] = useState('');

  // Form State: Borrow Asset
  const [borrowAssetId, setBorrowAssetId] = useState(assets[0]?.id || '');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [borrowerAddress, setBorrowerAddress] = useState('');
  const [borrowQuantity, setBorrowQuantity] = useState('1');
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().slice(0, 10));
  const [returnExpectedDate, setReturnExpectedDate] = useState(
    new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)
  );
  const [loanNotes, setLoanNotes] = useState('');

  // Delete & Return Modals
  const [assetToDelete, setAssetToDelete] = useState<MosqueAsset | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [loanToReturn, setLoanToReturn] = useState<AssetLoan | null>(null);

  // Filters
  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === 'all' || a.category === filterCategory;
    const matchCond = filterCondition === 'all' || a.condition === filterCondition;
    return matchSearch && matchCat && matchCond;
  });

  const filteredLoans = loans.filter((l) => {
    return (
      l.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.borrowerPhone.includes(searchTerm)
    );
  });

  // Photo Upload Handler with Client-Side Canvas Compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.72);
        setAssetPhoto(compressed.dataUrl);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAssetPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Add Asset Submit
  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(assetQuantity, 10) || 1;
    const val = parseFloat(assetValue.replace(/[^0-9]/g, '')) || 0;

    const newAsset: MosqueAsset = {
      id: 'ast-' + Date.now(),
      code: `AST-${assetCategory.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: assetName,
      category: assetCategory,
      totalQuantity: qty,
      availableQuantity: qty,
      unit: assetUnit,
      purchaseDate: assetPurchaseDate,
      fundingSource: assetFunding,
      condition: assetCondition,
      location: assetLocation,
      estimatedValue: val,
      photoUrl: assetPhoto || undefined,
    };

    const updated = [newAsset, ...assets];
    onUpdateAssets(updated, loans);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Tambah Aset Inventaris',
      details: `Mendaftarkan ${qty} ${assetUnit} ${assetName} (${formatRupiah(val)})`,
      category: 'aset',
    });

    // Reset
    setAssetName('');
    setAssetPhoto('');
    setShowAddAssetModal(false);
  };

  const openEditAssetModal = (asset: MosqueAsset) => {
    setEditingAsset(asset);
    setEditAssetName(asset.name);
    setEditAssetCode(asset.code);
    setEditAssetCategory(asset.category);
    setEditAssetTotalQuantity(asset.totalQuantity.toString());
    setEditAssetAvailableQuantity(asset.availableQuantity.toString());
    setEditAssetUnit(asset.unit);
    setEditAssetPurchaseDate(asset.purchaseDate || new Date().toISOString().slice(0, 10));
    setEditAssetFunding(asset.fundingSource || 'Kas Operasional BSI');
    setEditAssetCondition(asset.condition);
    setEditAssetLocation(asset.location);
    setEditAssetValue(asset.estimatedValue.toString());
    setEditAssetPhoto(asset.photoUrl || '');
    setShowEditAssetModal(true);
  };

  const handlePhotoUploadEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.72);
        setEditAssetPhoto(compressed.dataUrl);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditAssetPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveEditAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    const totalQty = parseInt(editAssetTotalQuantity, 10) || 1;
    const availQty = parseInt(editAssetAvailableQuantity, 10);
    const validAvailQty = isNaN(availQty) ? totalQty : Math.min(availQty, totalQty);
    const val = parseFloat(editAssetValue.replace(/[^0-9]/g, '')) || 0;

    const updatedAssets = assets.map((a) => {
      if (a.id === editingAsset.id) {
        return {
          ...a,
          code: editAssetCode || a.code,
          name: editAssetName,
          category: editAssetCategory,
          totalQuantity: totalQty,
          availableQuantity: validAvailQty,
          unit: editAssetUnit,
          purchaseDate: editAssetPurchaseDate,
          fundingSource: editAssetFunding,
          condition: editAssetCondition,
          location: editAssetLocation,
          estimatedValue: val,
          photoUrl: editAssetPhoto || undefined,
        };
      }
      return a;
    });

    // Also synchronize loans if asset name changed
    const updatedLoans = loans.map((l) => {
      if (l.assetId === editingAsset.id) {
        return { ...l, assetName: editAssetName };
      }
      return l;
    });

    onUpdateAssets(updatedAssets, updatedLoans);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Edit Aset Inventaris',
      details: `Mengubah data barang aset: ${editAssetName} (${editAssetCode}), total: ${totalQty} ${editAssetUnit}, kondisi: ${editAssetCondition}`,
      category: 'aset',
    });

    setShowEditAssetModal(false);
    setEditingAsset(null);
  };

  const handleDeleteAsset = (asset: MosqueAsset) => {
    const activeLoan = loans.find((l) => l.assetId === asset.id && l.status === 'dipinjam');
    if (activeLoan) {
      setDeleteWarning(
        `Barang "${asset.name}" (${asset.code}) saat ini sedang dalam status dipinjam oleh ${activeLoan.borrowerName}. Harap selesaikan pengembalian barang terlebih dahulu sebelum menghapus aset.`
      );
      return;
    }
    setAssetToDelete(asset);
  };

  const executeDeleteAsset = (asset: MosqueAsset) => {
    const updatedAssets = assets.filter((a) => a.id !== asset.id);
    onUpdateAssets(updatedAssets, loans);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Hapus Aset Inventaris',
      details: `Menghapus barang inventaris: ${asset.name} (${asset.code})`,
      category: 'aset',
    });

    setAssetToDelete(null);
    setShowEditAssetModal(false);
    setEditingAsset(null);
  };

  // Submit Loan with Real-Time Stock Deduction
  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAsset = assets.find((a) => a.id === borrowAssetId);
    if (!targetAsset) return;

    const qty = parseInt(borrowQuantity, 10) || 1;
    if (qty > targetAsset.availableQuantity) {
      setDeleteWarning(`Stok tersedia hanya ada ${targetAsset.availableQuantity} ${targetAsset.unit}!`);
      return;
    }

    // Deduct stock in real time
    const updatedAssets = assets.map((a) => {
      if (a.id === targetAsset.id) {
        return {
          ...a,
          availableQuantity: a.availableQuantity - qty,
        };
      }
      return a;
    });

    const newLoan: AssetLoan = {
      id: 'loan-' + Date.now(),
      assetId: targetAsset.id,
      assetName: targetAsset.name,
      borrowerName,
      borrowerPhone,
      borrowerAddress,
      quantity: qty,
      borrowDate,
      expectedReturnDate: returnExpectedDate,
      status: 'dipinjam',
      notes: loanNotes,
    };

    const updatedLoans = [newLoan, ...loans];
    onUpdateAssets(updatedAssets, updatedLoans);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Peminjaman Aset',
      details: `${borrowerName} meminjam ${qty} ${targetAsset.name}. Stok berkurang menjadi ${targetAsset.availableQuantity - qty}`,
      category: 'aset',
    });

    if (borrowerPhone) {
      handleSendLoanWA(newLoan, 'pinjam');
    }

    // Reset
    setBorrowerName('');
    setBorrowerPhone('');
    setBorrowerAddress('');
    setLoanNotes('');
    setShowLoanModal(false);
    setSelectedAssetForLoan(null);
  };

  // Handle Return Asset (Restores stock unit)
  const handleReturnAsset = (loan: AssetLoan) => {
    if (loan.status === 'kembali') return;
    setLoanToReturn(loan);
  };

  const executeReturnAsset = (loan: AssetLoan) => {
    // Restore stock
    const updatedAssets = assets.map((a) => {
      if (a.id === loan.assetId) {
        return {
          ...a,
          availableQuantity: Math.min(a.totalQuantity, a.availableQuantity + loan.quantity),
        };
      }
      return a;
    });

    const updatedLoans = loans.map((l) => {
      if (l.id === loan.id) {
        return {
          ...l,
          status: 'kembali' as const,
          actualReturnDate: new Date().toISOString().slice(0, 10),
        };
      }
      return l;
    });

    onUpdateAssets(updatedAssets, updatedLoans);

    appStorage.addAuditLog({
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Pengembalian Aset',
      details: `${loan.borrowerName} telah mengembalikan ${loan.quantity} unit ${loan.assetName}. Stok kembali normal.`,
      category: 'aset',
    });

    if (loan.borrowerPhone) {
      handleSendLoanWA(loan, 'kembali');
    }

    setLoanToReturn(null);
  };

  // Send WA for Asset Loan
  const handleSendLoanWA = (loan: AssetLoan, mode: 'pinjam' | 'reminder' | 'kembali') => {
    const msg = buildAssetLoanWaMessage({
      mosqueName: profile.name,
      borrowerName: loan.borrowerName,
      assetName: loan.assetName,
      quantity: loan.quantity,
      borrowDate: loan.borrowDate,
      expectedReturnDate: loan.expectedReturnDate,
      status: mode,
      adminName: `${profile.sekretaris} (${profile.phone})`,
    });

    const url = createWhatsAppUrl(loan.borrowerPhone, msg);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleExportCSV = () => {
    const headers = [
      'Kode Aset',
      'Nama Barang',
      'Kategori',
      'Total Stok',
      'Stok Tersedia',
      'Satuan',
      'Kondisi',
      'Lokasi',
      'Tgl Pembelian',
      'Sumber Dana',
      'Estimasi Nilai',
    ];
    const rows = [
      [`INVENTARIS ASET MILIK ${profile.name.toUpperCase()}`],
      headers,
      ...filteredAssets.map((a) => [
        a.code,
        a.name,
        a.category,
        a.totalQuantity,
        a.availableQuantity,
        a.unit,
        a.condition.toUpperCase(),
        a.location,
        a.purchaseDate,
        a.fundingSource,
        a.estimatedValue,
      ]),
    ];
    exportToCSV(`Inventaris-Aset-${profile.name.replace(/\s+/g, '_')}.csv`, rows);
  };

  const conditionLabels: Record<AssetCondition, { label: string; color: string }> = {
    baik: { label: 'Baik & Siap Pakai', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    rusak_ringan: { label: 'Rusak Ringan', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    rusak_berat: { label: 'Rusak Berat', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    servis: { label: 'Sedang Diservis', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  };

  return (
    <div id="inventaris-aset-module" className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>Inventaris Aset & Peminjaman Barang Jamaah</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pendataan perlengkapan masjid, pengurangan stok real-time saat dipinjam, dan konfirmasi WhatsApp
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('aset')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'aset' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Daftar Aset ({assets.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('pinjam')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'pinjam' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Peminjaman Aktif ({loans.filter((l) => l.status === 'dipinjam').length})</span>
            </button>
          </div>

          {activeTab === 'aset' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs"
                title="Download CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowAddAssetModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Tambah Aset</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoanModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Form Pinjam Barang</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: DAFTAR ASET INVENTARIS */}
      {activeTab === 'aset' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari barang / kode / ruangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Semua Kategori</option>
                <option value="Audio & Sound System">Audio & Sound System</option>
                <option value="Furnitur & Tenda">Furnitur & Tenda</option>
                <option value="Kelistrikan & Mesin">Kelistrikan & Mesin</option>
                <option value="Elektronik & Multimedia">Elektronik & Multimedia</option>
                <option value="Alat Kebersihan">Alat Kebersihan</option>
              </select>
            </div>

            <div>
              <select
                value={filterCondition}
                onChange={(e) => setFilterCondition(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Semua Kondisi</option>
                <option value="baik">Kondisi Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
                <option value="servis">Sedang Diservis</option>
              </select>
            </div>
          </div>

          {/* Asset Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => {
              const cond = conditionLabels[asset.condition] || conditionLabels.baik;
              return (
                <div
                  key={asset.id}
                  id={`asset-card-${asset.id}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-md flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    {/* Image if available */}
                    {asset.photoUrl && asset.photoUrl.trim() !== '' ? (
                      <div className="rounded-xl overflow-hidden mb-3 h-36 bg-slate-950 border border-slate-800">
                        <img
                          src={asset.photoUrl}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {asset.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cond.color}`}>
                        {cond.label}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-100 mb-1">{asset.name}</h4>
                    <p className="text-xs text-slate-400 mb-3">{asset.category}</p>

                    {/* Stock status */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Stok Tersedia:</span>
                        <span className="font-bold font-mono-num text-emerald-400">
                          {asset.availableQuantity} / {asset.totalQuantity} {asset.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Lokasi Simpan:</span>
                        <span className="text-slate-300 font-medium truncate max-w-[140px]">
                          {asset.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/50">
                        <span className="text-slate-500">Estimasi Nilai:</span>
                        <span className="font-mono-num text-slate-300 font-semibold">
                          {formatRupiah(asset.estimatedValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditAssetModal(asset)}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                        title="Ubah / Edit Data Barang"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ubah</span>
                      </button>

                      <button
                        onClick={() => handleDeleteAsset(asset)}
                        className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/50 transition-colors"
                        title="Hapus Barang Aset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAssetForLoan(asset);
                        setBorrowAssetId(asset.id);
                        setShowLoanModal(true);
                      }}
                      disabled={asset.availableQuantity <= 0}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors ${
                        asset.availableQuantity > 0
                          ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{asset.availableQuantity > 0 ? 'Pinjamkan' : 'Habis'}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredAssets.length === 0 && (
              <div className="col-span-full p-10 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
                <Package className="w-10 h-10 mx-auto text-slate-600 mb-2 stroke-1" />
                <p className="font-semibold text-slate-400">Belum ada inventaris aset terdaftar</p>
                <p className="text-xs text-slate-500 mt-1">
                  Klik "+ Tambah Aset Baru" di atas untuk mendaftarkan barang dan sarana masjid.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SUB-MENU PEMINJAMAN ASET (REAL-TIME STOK & WA KONFIRMASI) */}
      {activeTab === 'pinjam' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-lg">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[720px]">
                <thead>
                  <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="p-3.5 w-12 text-center">No</th>
                    <th className="p-3.5 w-44">Barang Dipinjam</th>
                    <th className="p-3.5 w-20 text-center">Jumlah</th>
                    <th className="p-3.5">Nama Peminjam & Alamat</th>
                    <th className="p-3.5 w-32">No. WhatsApp</th>
                    <th className="p-3.5 w-28">Tgl Pinjam</th>
                    <th className="p-3.5 w-28">Batas Kembali</th>
                    <th className="p-3.5 w-24 text-center">Status</th>
                    <th className="p-3.5 w-48 text-center">Aksi / WA Notif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLoans.map((loan, idx) => {
                    const isDipinjam = loan.status === 'dipinjam';
                    return (
                      <tr key={loan.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 text-center text-slate-500">{idx + 1}</td>
                        <td className="p-3.5 font-bold text-slate-200">
                          {loan.assetName}
                        </td>
                        <td className="p-3.5 text-center font-mono-num font-bold text-emerald-400">
                          {loan.quantity} unit
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-100">{loan.borrowerName}</p>
                          <p className="text-[11px] text-slate-500">{loan.borrowerAddress}</p>
                          {loan.notes && (
                            <p className="text-[10px] text-amber-400 mt-0.5 italic">{loan.notes}</p>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">
                          {loan.borrowerPhone}
                        </td>
                        <td className="p-3.5 text-slate-400 font-mono-num">
                          {loan.borrowDate}
                        </td>
                        <td className="p-3.5 font-mono-num font-semibold text-amber-400">
                          {loan.expectedReturnDate}
                        </td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isDipinjam
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {isDipinjam ? '⏳ Dipinjam' : '✓ Kembali'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* WhatsApp reminder / receipt */}
                            <button
                              onClick={() => handleSendLoanWA(loan, isDipinjam ? 'reminder' : 'kembali')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow"
                              title="Kirim pesan WhatsApp tanda bukti atau pengingat"
                            >
                              <Send className="w-3 h-3" />
                              <span>{isDipinjam ? 'Ingatkan WA' : 'Bukti WA'}</span>
                            </button>

                            {/* Return Button */}
                            {isDipinjam && (
                              <button
                                onClick={() => handleReturnAsset(loan)}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-[11px] font-semibold"
                                title="Konfirmasi barang telah dikembalikan"
                              >
                                Pulihkan Stok
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLoans.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500">
                        Tidak ada catatan peminjaman barang saat ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD ASSET MODAL */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h4 className="font-bold text-base text-white">Tambah Aset Inventaris Masjid</h4>
              <button
                onClick={() => setShowAddAssetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Vacuum Cleaner Karpet Sharp 2000W"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Kategori Barang *</label>
                  <select
                    value={assetCategory}
                    onChange={(e) => setAssetCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Audio & Sound System">Audio & Sound System</option>
                    <option value="Furnitur & Tenda">Furnitur & Tenda</option>
                    <option value="Kelistrikan & Mesin">Kelistrikan & Mesin</option>
                    <option value="Elektronik & Multimedia">Elektronik & Multimedia</option>
                    <option value="Alat Kebersihan">Alat Kebersihan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Kondisi Barang *</label>
                  <select
                    value={assetCondition}
                    onChange={(e) => setAssetCondition(e.target.value as AssetCondition)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="baik">Baik & Siap Pakai</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                    <option value="servis">Sedang Diservis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Jumlah Unit *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={assetQuantity}
                    onChange={(e) => setAssetQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Satuan</label>
                  <input
                    type="text"
                    placeholder="Buah / Unit / Set"
                    value={assetUnit}
                    onChange={(e) => setAssetUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Lokasi Ruangan Simpan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gudang Sayap Kiri"
                    value={assetLocation}
                    onChange={(e) => setAssetLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Estimasi Nilai Barang (Rp)</label>
                  <input
                    type="number"
                    value={assetValue}
                    onChange={(e) => setAssetValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tanggal Pembelian</label>
                  <input
                    type="date"
                    value={assetPurchaseDate}
                    onChange={(e) => setAssetPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Sumber Dana Pengadaan</label>
                  <input
                    type="text"
                    value={assetFunding}
                    onChange={(e) => setAssetFunding(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Foto Fisik Barang (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full text-slate-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssetModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow"
                >
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ASSET MODAL */}
      {showEditAssetModal && editingAsset && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-base text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-amber-400" />
                  Ubah Data Barang Inventaris
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Kode: {editingAsset.code}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditAssetModal(false);
                  setEditingAsset(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditAsset} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 font-medium mb-1">Nama Barang *</label>
                  <input
                    type="text"
                    required
                    value={editAssetName}
                    onChange={(e) => setEditAssetName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Kode Barang</label>
                  <input
                    type="text"
                    required
                    value={editAssetCode}
                    onChange={(e) => setEditAssetCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Kategori Barang *</label>
                  <select
                    value={editAssetCategory}
                    onChange={(e) => setEditAssetCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Audio & Sound System">Audio & Sound System</option>
                    <option value="Furnitur & Tenda">Furnitur & Tenda</option>
                    <option value="Kelistrikan & Mesin">Kelistrikan & Mesin</option>
                    <option value="Elektronik & Multimedia">Elektronik & Multimedia</option>
                    <option value="Alat Kebersihan">Alat Kebersihan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Kondisi Barang *</label>
                  <select
                    value={editAssetCondition}
                    onChange={(e) => setEditAssetCondition(e.target.value as AssetCondition)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="baik">Baik & Siap Pakai</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                    <option value="servis">Sedang Diservis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Total Stok *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editAssetTotalQuantity}
                    onChange={(e) => setEditAssetTotalQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Stok Tersedia *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editAssetAvailableQuantity}
                    onChange={(e) => setEditAssetAvailableQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Satuan</label>
                  <input
                    type="text"
                    placeholder="Unit / Set"
                    value={editAssetUnit}
                    onChange={(e) => setEditAssetUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Lokasi Ruangan Simpan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Gudang Sayap Kiri"
                    value={editAssetLocation}
                    onChange={(e) => setEditAssetLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Estimasi Nilai Barang (Rp)</label>
                  <input
                    type="text"
                    value={editAssetValue}
                    onChange={(e) => setEditAssetValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tanggal Pembelian</label>
                  <input
                    type="date"
                    value={editAssetPurchaseDate}
                    onChange={(e) => setEditAssetPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Sumber Dana Pengadaan</label>
                  <input
                    type="text"
                    value={editAssetFunding}
                    onChange={(e) => setEditAssetFunding(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Foto Fisik Barang</label>
                {editAssetPhoto && editAssetPhoto.trim() !== '' ? (
                  <div className="mb-2 h-24 w-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={editAssetPhoto} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUploadEdit}
                  className="w-full text-slate-400 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteAsset(editingAsset)}
                  className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/60 border border-rose-900/50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Aset
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditAssetModal(false);
                      setEditingAsset(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BORROW ASSET MODAL */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h4 className="font-bold text-base text-white">Formulir Peminjaman Aset Masjid</h4>
                <p className="text-xs text-slate-400">Stok unit akan otomatis terpotong saat disimpan</p>
              </div>
              <button
                onClick={() => setShowLoanModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLoan} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Pilih Barang yang Dipinjam *</label>
                <select
                  value={borrowAssetId}
                  onChange={(e) => setBorrowAssetId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id} disabled={a.availableQuantity <= 0}>
                      {a.name} (Tersedia: {a.availableQuantity} {a.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Jumlah Pinjam *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={borrowQuantity}
                    onChange={(e) => setBorrowQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tanggal Rencana Kembali *</label>
                  <input
                    type="date"
                    required
                    value={returnExpectedDate}
                    onChange={(e) => setReturnExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nama Jamaah Peminjam *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama jamaah / warga peminjam"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Nomor WhatsApp Jamaah *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 081298765432"
                  value={borrowerPhone}
                  onChange={(e) => setBorrowerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Alamat / RT / RW Peminjam</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Delima No. 12 RT 02/05"
                  value={borrowerAddress}
                  onChange={(e) => setBorrowerAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Keperluan / Catatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengajian keluarga di rumah"
                  value={loanNotes}
                  onChange={(e) => setLoanNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow"
                >
                  Simpan & Potong Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WARNING MODAL */}
      {deleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Perhatian</h4>
              <p className="text-xs text-slate-400 mt-1">{deleteWarning}</p>
            </div>
            <button
              onClick={() => setDeleteWarning(null)}
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE ASSET MODAL */}
      <DeleteConfirmModal
        isOpen={!!assetToDelete}
        title="Hapus Barang Inventaris Aset"
        message={
          assetToDelete ? (
            <span>
              Apakah Anda yakin ingin menghapus barang aset{' '}
              <strong>"{assetToDelete.name}"</strong> ({assetToDelete.code}) dari catatan inventaris masjid?
            </span>
          ) : (
            ''
          )
        }
        itemDetails={
          assetToDelete
            ? [
                { label: 'Nama Barang', value: assetToDelete.name },
                { label: 'Kode Aset', value: assetToDelete.code },
                { label: 'Kategori', value: assetToDelete.category },
                { label: 'Kondisi', value: assetToDelete.condition.toUpperCase() },
                { label: 'Total Stok', value: `${assetToDelete.totalQuantity} ${assetToDelete.unit}` },
                { label: 'Lokasi', value: assetToDelete.location || '-' },
              ]
            : []
        }
        confirmLabel="Ya, Hapus Barang"
        onConfirm={() => {
          if (assetToDelete) {
            executeDeleteAsset(assetToDelete);
          }
        }}
        onClose={() => setAssetToDelete(null)}
      />

      {/* CONFIRM RETURN LOAN MODAL */}
      <DeleteConfirmModal
        isOpen={!!loanToReturn}
        title="Konfirmasi Pengembalian Barang"
        isDanger={false}
        message={
          loanToReturn ? (
            <span>
              Konfirmasi bahwa <strong>{loanToReturn.borrowerName}</strong> telah mengembalikan{' '}
              <strong>
                {loanToReturn.quantity} unit {loanToReturn.assetName}
              </strong>
              ? Stok inventaris masjid akan otomatis dipulihkan.
            </span>
          ) : (
            ''
          )
        }
        itemDetails={
          loanToReturn
            ? [
                { label: 'Nama Peminjam', value: loanToReturn.borrowerName },
                { label: 'Barang', value: loanToReturn.assetName },
                { label: 'Jumlah Dikembalikan', value: `${loanToReturn.quantity} unit` },
                { label: 'Tanggal Pinjam', value: loanToReturn.borrowDate },
                { label: 'Tenggat Kembali', value: loanToReturn.expectedReturnDate },
              ]
            : []
        }
        confirmLabel="Ya, Konfirmasi Kembali"
        onConfirm={() => {
          if (loanToReturn) {
            executeReturnAsset(loanToReturn);
          }
        }}
        onClose={() => setLoanToReturn(null)}
      />
    </div>
  );
};
