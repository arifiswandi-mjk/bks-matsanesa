import { useEffect, useState } from 'react';
import RekapTable from '../components/RekapTable';
import SiswaDetailPage from './SiswaDetailPage';

const API = import.meta.env.VITE_API_URL;

function RekapPage() {
  const [rekap, setRekap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nisnTerpilih, setNisnTerpilih] = useState(null); // tombol detail

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API, {
          method: 'POST',
          body: JSON.stringify({ action: 'rekapPelanggaran' }),
        });

        const json = await res.json();
        if (Array.isArray(json)) {
          setRekap(json);
        } else {
          console.warn('Respon tidak valid:', json);
          setRekap([]);
        }
      } catch (err) {
        console.error('Gagal memuat data rekap:', err);
        setRekap([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (nisnTerpilih) {
    return <SiswaDetailPage nisn={nisnTerpilih} onBack={() => setNisnTerpilih(null)} />;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Rekap Skor Pelanggaran Siswa</h2>

      {loading ? (
        <p>⏳ Memuat data...</p>
      ) : rekap.length === 0 ? (
        <p className="text-gray-500">Tidak ada data rekap pelanggaran.</p>
      ) : (
        <div className="overflow-x-auto mt-4">
          <RekapTable data={rekap} onSelectSiswa={nisn => setNisnTerpilih(nisn)} />
        </div>
      )}
    </div>
  );
}

export default RekapPage;
