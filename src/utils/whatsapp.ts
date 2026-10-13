/**
 * WhatsApp formatted message links for Mosque administrative notifications.
 * Automatically cleans phone numbers to Indonesian standard format (+62 / 62).
 */

export function cleanIndonesianPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function createWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = cleanIndonesianPhone(phone);
  const encodedText = encodeURIComponent(text.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Message template: Pengingat Petugas Sholat / Khatib Jumat
 */
export function buildDutyReminderWaMessage(params: {
  mosqueName: string;
  dutyType: string;
  date: string;
  officerName: string;
  role: string;
  theme?: string;
  contactPerson: string;
}): string {
  return `*PENGINGAT JADWAL PETUGAS ${params.dutyType.toUpperCase()}*
*${params.mosqueName}*

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Yth. *${params.officerName}*

Mengingatkan kembali amanah tugas pada kegiatan ibadah:
🗓️ *Hari/Tanggal:* ${params.date}
🕌 *Kegiatan:* ${params.dutyType}
👤 *Amanah:* ${params.role}
${params.theme ? `📖 *Tema/Materi:* ${params.theme}\n` : ''}
Mohon konfirmasi kesediaan dan kehadirannya 15 menit sebelum waktu adzan. 

Jazakumullahu khairan katsiran atas dedikasi dan khidmatnya untuk kemakmuran masjid kita.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Pengurus Takmir ${params.mosqueName}_
(Narahubung: ${params.contactPerson})`;
}

/**
 * Message template: Konfirmasi Pembayaran Qurban
 */
export function buildQurbanReceiptWaMessage(params: {
  mosqueName: string;
  year: number;
  participantName: string;
  qurbanType: 'sapi' | 'kambing';
  groupNumber?: number;
  amountPaid: number;
  totalPaid: number;
  targetAmount: number;
  status: 'lunas' | 'cicilan';
  treasurerName: string;
}): string {
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  });

  const remaining = Math.max(0, params.targetAmount - params.totalPaid);
  const isCow = params.qurbanType === 'sapi';
  const typeText = isCow
    ? `Sapi (Patungan 1/7)${params.groupNumber ? ` - Kelompok ${params.groupNumber}` : ''}`
    : 'Kambing / Domba Perorangan';

  return `*BUKTI PEMBAYARAN QURBAN ${params.year} H / M*
*${params.mosqueName}*

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Bapak/Ibu/Sdr. *${params.participantName}*

Alhamdulillah, pembayaran qurban telah kami terima dengan rincian:
📦 *Jenis Qurban:* ${typeText}
💵 *Pembayaran Baru:* ${formatter.format(params.amountPaid)}
📈 *Total Terbayar:* ${formatter.format(params.totalPaid)}
🎯 *Target Biaya:* ${formatter.format(params.targetAmount)}
📊 *Status:* ${params.status === 'lunas' ? '✅ LUNAS' : `⏳ CICILAN (Sisa: ${formatter.format(remaining)})`}

Semoga Allah SWT menerima ibadah qurban ini, melipatgandakan rezeki, dan membawa keberkahan bagi antum sekeluarga. Aamiin.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Bendahara Panitia Qurban: ${params.treasurerName}_`;
}

/**
 * Message template: Bukti Peminjaman Aset Masjid & Pengingat
 */
export function buildAssetLoanWaMessage(params: {
  mosqueName: string;
  borrowerName: string;
  assetName: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  status: 'pinjam' | 'reminder' | 'kembali';
  adminName: string;
}): string {
  if (params.status === 'kembali') {
    return `*KONFIRMASI PENGEMBALIAN ASET INVENTARIS*
*${params.mosqueName}*

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Terima kasih kepada Bpk/Ibu *${params.borrowerName}*,

Barang inventaris berupa:
📦 *Nama Barang:* ${params.assetName}
🔢 *Jumlah:* ${params.quantity} unit

Telah kami terima kembali dalam kondisi baik. Terima kasih atas kerja samanya dalam menjaga amanah aset masjid.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Pengurus Aset: ${params.adminName}_`;
  }

  if (params.status === 'reminder') {
    return `*PENGINGAT BATAS WAKTU PINJAM ASET*
*${params.mosqueName}*

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Yth. Bpk/Ibu *${params.borrowerName}*

Mengingatkan batas waktu pengembalian inventaris masjid:
📦 *Barang:* ${params.assetName} (${params.quantity} unit)
🗓️ *Batas Pengembalian:* ${params.expectedReturnDate}

Mohon untuk dapat dikembalikan tepat waktu demi kelancaran kegiatan jamaah lainnya. Terima kasih atas pengertiannya.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Pengurus Aset: ${params.adminName}_`;
  }

  return `*BUKTI PEMINJAMAN ASET MASJID*
*${params.mosqueName}*

Assalamu'alaikum Warahmatullahi Wabarakatuh,
Bapak/Ibu/Sdr. *${params.borrowerName}*

Peminjaman aset masjid telah tercatat di sistem:
📦 *Nama Barang:* ${params.assetName}
🔢 *Jumlah Pinjam:* ${params.quantity} unit
📅 *Tanggal Pinjam:* ${params.borrowDate}
⏳ *Rencana Kembali:* ${params.expectedReturnDate}

Harap merawat barang dengan sebaik-baiknya dan mengembalikan tepat waktu. 

Wassalamu'alaikum Warahmatullahi Wabarakatuh.
_Pengurus Inventaris: ${params.adminName}_`;
}
