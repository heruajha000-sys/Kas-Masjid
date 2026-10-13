import { PrayerTimeData } from '../types';

/**
 * Calculates standard Indonesian prayer times (Kemenag standard: Subuh -20°, Isya -18°)
 */
export function calculatePrayerTimes(
  date: Date = new Date(),
  latitude = -6.2088, // Default Jakarta / West Java
  longitude = 106.8456,
  timezone = 7
): PrayerTimeData {
  // Day of year calculation
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Solar declination (approximate equation)
  const d = (2 * Math.PI * (dayOfYear - 1)) / 365;
  const declination =
    0.006918 -
    0.399912 * Math.cos(d) +
    0.070257 * Math.sin(d) -
    0.006758 * Math.cos(2 * d) +
    0.000907 * Math.sin(2 * d);

  // Equation of time in minutes
  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(d) -
      0.032077 * Math.sin(d) -
      0.014615 * Math.cos(2 * d) -
      0.040849 * Math.sin(2 * d));

  // Solar noon
  const noon = 12 + timezone - longitude / 15 - eqtime / 60;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const latRad = toRad(latitude);

  // Helper to compute hour angle for sun altitude angle 'a'
  const hourAngle = (aDeg: number) => {
    const aRad = toRad(aDeg);
    const cosHA = (Math.sin(aRad) - Math.sin(latRad) * Math.sin(declination)) /
      (Math.cos(latRad) * Math.cos(declination));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return Math.PI;
    return Math.acos(cosHA);
  };

  // Sun angles for Indonesian standard
  const subuhHA = toDeg(hourAngle(-20)) / 15;
  const syuruqHA = toDeg(hourAngle(-0.833)) / 15;
  const maghribHA = toDeg(hourAngle(-0.833)) / 15;
  const isyaHA = toDeg(hourAngle(-18)) / 15;

  // Ashar: Shadow length = 1 + tan(|lat - dec|)
  const asharAlt = toDeg(
    Math.atan(1 / (1 + Math.tan(Math.abs(latRad - declination))))
  );
  const asharHA = toDeg(hourAngle(asharAlt)) / 15;

  const formatTime = (decimalHour: number) => {
    // Add 2 minutes ihtiyat (safety margin standard in Indonesian Mosques)
    const adjusted = decimalHour + 2 / 60;
    let hours = Math.floor(adjusted) % 24;
    let minutes = Math.floor((adjusted - Math.floor(adjusted)) * 60);
    if (minutes >= 60) {
      minutes -= 60;
      hours = (hours + 1) % 24;
    }
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  return {
    subuh: formatTime(noon - subuhHA),
    syuruq: formatTime(noon - syuruqHA),
    dzuhur: formatTime(noon),
    ashar: formatTime(noon + asharHA),
    maghrib: formatTime(noon + maghribHA),
    isya: formatTime(noon + isyaHA),
  };
}

export interface NextPrayerInfo {
  name: 'Subuh' | 'Syuruq' | 'Dzuhur' | 'Ashar' | 'Maghrib' | 'Isya';
  key: keyof PrayerTimeData;
  timeString: string;
  secondsRemaining: number;
  isIqomahCountdown: boolean;
  iqomahSecondsRemaining: number;
}

/**
 * Returns which prayer is next, remaining seconds to Adzan, and whether we are in the Iqomah window
 */
export function getNextPrayer(
  times: PrayerTimeData,
  now: Date = new Date(),
  iqomahMinutes = { subuh: 15, dzuhur: 10, ashar: 10, maghrib: 8, isya: 10 }
): NextPrayerInfo {
  const currentTotalSeconds =
    now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const parseToSeconds = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  const schedule: Array<{
    name: NextPrayerInfo['name'];
    key: keyof PrayerTimeData;
    sec: number;
    iqomahMin: number;
  }> = [
    { name: 'Subuh', key: 'subuh', sec: parseToSeconds(times.subuh), iqomahMin: iqomahMinutes.subuh },
    { name: 'Syuruq', key: 'syuruq', sec: parseToSeconds(times.syuruq), iqomahMin: 0 },
    { name: 'Dzuhur', key: 'dzuhur', sec: parseToSeconds(times.dzuhur), iqomahMin: iqomahMinutes.dzuhur },
    { name: 'Ashar', key: 'ashar', sec: parseToSeconds(times.ashar), iqomahMin: iqomahMinutes.ashar },
    { name: 'Maghrib', key: 'maghrib', sec: parseToSeconds(times.maghrib), iqomahMin: iqomahMinutes.maghrib },
    { name: 'Isya', key: 'isya', sec: parseToSeconds(times.isya), iqomahMin: iqomahMinutes.isya },
  ];

  // Check if we are currently in an Iqomah countdown window (right after prayer time)
  for (const item of schedule) {
    if (item.name === 'Syuruq') continue;
    const adzanSec = item.sec;
    const iqomahSecDuration = item.iqomahMin * 60;
    const iqomahEndSec = adzanSec + iqomahSecDuration;

    if (currentTotalSeconds >= adzanSec && currentTotalSeconds < iqomahEndSec) {
      return {
        name: item.name,
        key: item.key,
        timeString: times[item.key],
        secondsRemaining: 0,
        isIqomahCountdown: true,
        iqomahSecondsRemaining: iqomahEndSec - currentTotalSeconds,
      };
    }
  }

  // Otherwise, find the next upcoming prayer today
  for (const item of schedule) {
    if (currentTotalSeconds < item.sec) {
      return {
        name: item.name,
        key: item.key,
        timeString: times[item.key],
        secondsRemaining: item.sec - currentTotalSeconds,
        isIqomahCountdown: false,
        iqomahSecondsRemaining: 0,
      };
    }
  }

  // If passed Isya, next is Subuh tomorrow
  const subuhSecTomorrow = parseToSeconds(times.subuh) + 86400;
  return {
    name: 'Subuh',
    key: 'subuh',
    timeString: times.subuh,
    secondsRemaining: subuhSecTomorrow - currentTotalSeconds,
    isIqomahCountdown: false,
    iqomahSecondsRemaining: 0,
  };
}

/**
 * Format date in Indonesian Gregorian
 */
export function formatIndonesianDate(date: Date = new Date()): string {
  const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[date.getDay()];
  const dayNum = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${dayNum} ${monthName} ${year}`;
}

/**
 * Hijri calendar estimation (Kuwaiti algorithm variant)
 */
export function getHijriDate(date: Date = new Date(), adjustmentDays = 0): string {
  const hijriMonths = [
    'Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir',
    'Jumadil Ula', 'Jumadil Akhir', 'Rajab', 'Syaban',
    'Ramadhan', 'Syawal', 'Dzulqadah', 'Dzulhijjah'
  ];

  const adjusted = new Date(date.getTime() + adjustmentDays * 86400000);
  let day = adjusted.getDate();
  let month = adjusted.getMonth();
  let year = adjusted.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  let a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;
  b = 0;
  if (jd > 2299160) {
    a = Math.floor((jd - 1867216.25) / 36524.25);
    b = 1 + a - Math.floor(a / 4);
  }
  const bb = jd + b + 1524;
  let cc = Math.floor((bb - 122.1) / 365.25);
  let dd = Math.floor(365.25 * cc);
  let ee = Math.floor((bb - dd) / 30.6001);
  day = bb - dd - Math.floor(30.6001 * ee);
  month = ee - 1;
  if (ee > 13) {
    cc += 1;
    month = ee - 13;
  }
  year = cc - 4716;

  let wd = (jd + 1) % 7;
  let epochastro = 1948084;
  let shift1 = 8.01 / 60;

  let z = jd - epochastro;
  let cyc = Math.floor(z / 10631);
  z = z - 10631 * cyc;
  let j = Math.floor((z - shift1) / 354.36667);
  let iy = 30 * cyc + j;
  z = z - Math.floor(j * 354.36667 + shift1);
  let im = Math.floor((z + 28.5001) / 29.5);
  if (im === 13) im = 12;
  let id = z - Math.floor(29.5001 * im - 29);

  const hYear = iy + 1;
  const hMonth = hijriMonths[im - 1] || 'Ramadhan';
  const hDay = Math.max(1, Math.min(30, id));

  return `${hDay} ${hMonth} ${hYear} H`;
}
