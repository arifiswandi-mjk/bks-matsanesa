/**
 * Mengonversi string tanggal dari:
 * - "dd-MM-yyyy HH:mm"
 * - "dd-MM-yyyy HH:mm:ss"
 * - ISO string (mis. "2025-07-25T09:04:00Z")
 *
 * Menjadi format ISO pendek "yyyy-MM-ddTHH:mm"
 * agar bisa digunakan di input type="datetime-local"
 */
export function convertToISODateTime(str) {
  if (!str || typeof str !== 'string') return '';

  // Tangani format: "dd-MM-yyyy HH:mm" atau "dd-MM-yyyy HH:mm:ss"
  const indoRegex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}(:\d{2})?$/;
  if (indoRegex.test(str)) {
    const [d, m, rest] = str.split('-');
    const [y, time] = rest.split(' ');
    const [h, min] = time.split(':');
    return `${y}-${m}-${d}T${h}:${min}`;
  }

  // Jika string ISO atau valid untuk new Date()
  const isoCandidate = new Date(str);
  if (!isNaN(isoCandidate)) {
    return isoCandidate.toISOString().slice(0, 16);
  }

  return ''; // fallback jika format tidak dikenali
}

/**
 * Mengambil waktu lokal saat ini dalam format "yyyy-MM-ddTHH:mm"
 * untuk dipakai sebagai default input datetime-local.
 */
export function getLocalDateTimeNow() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}
