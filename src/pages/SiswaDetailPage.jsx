import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

function SiswaDetailPage({ nisn, onBack }) {
  const { id } = useParams();
  const [dataPelanggaran, setDataPelanggaran] = useState([]);
  const [loading, setLoading] = useState(true);

  nisn = id || nisn; // Gunakan nisn dari props atau dari URL params
  console.log('nisn = ', { nisn });

  useEffect(() => {
    async function fetchPelanggaran() {
      try {
        const res = await fetch(API, {
          method: 'POST',
          body: JSON.stringify({
            action: 'readPelanggaranByNisn',
            data: { nisn },
          }),
        });

        const json = await res.json();
        setDataPelanggaran(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error('Gagal mengambil data pelanggaran:', err);
        setDataPelanggaran([]);
      } finally {
        setLoading(false);
      }
    }

    if (nisn) {
      fetchPelanggaran();
    }
  }, [nisn]);

  return (
    <div className="p-4">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        ⬅ Kembali
      </button>

      <h2 className="text-xl font-semibold mb-4">Riwayat Pelanggaran Siswa</h2>

      {loading ? (
        <p>Memuat data...</p>
      ) : dataPelanggaran.length === 0 ? (
        <p>Tidak ada data pelanggaran.</p>
      ) : (
        <table className="w-full border border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Tanggal</th>
              <th className="border px-2 py-1">Pelanggaran</th>
              <th className="border px-2 py-1">Skor</th>
              <th className="border px-2 py-1">Kelas</th>
              <th className="border px-2 py-1">Pencatat</th>
            </tr>
          </thead>
          <tbody>
            {dataPelanggaran.map(item => (
              <tr key={item.ID}>
                <td className="border px-2 py-1">{item.Timestamp}</td>
                <td className="border px-2 py-1">{item.Pelanggaran}</td>
                <td className="border px-2 py-1 text-center">{item.Skor}</td>
                <td className="border px-2 py-1">{item.Kelas}</td>
                <td className="border px-2 py-1">{item.Pencatat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SiswaDetailPage;
