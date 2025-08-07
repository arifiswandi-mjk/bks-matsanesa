import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RekapTable from '../components/RekapTable';
import '../styles/RekapPage.css'; // Import CSS eksternal

const API = import.meta.env.VITE_API_URL;

function RekapPage() {
  const [rekap, setRekap] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm] = useState('');
  const [kelasFilter] = useState('');
  
  // Fungsi untuk kembali ke halaman sebelumnya
  const handleBack = () => {
    navigate(-1);
  };

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

  // Fungsi untuk navigasi ke halaman detail siswa
  const handleSelectSiswa = (nisn) => {
    navigate(`/siswa/${nisn}`);
  };

  // Ekstrak daftar kelas unik untuk filter

  // Filter data berdasarkan pencarian dan filter kelas
  const filteredData = rekap.filter(item => {
    return (
      (searchTerm === '' || 
       item.Nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.Nisn.includes(searchTerm)) &&
      (kelasFilter === '' || item.Kelas === kelasFilter)
    );
  });

  return (
    <div className="rekap-container">
      {/* Pisahkan tombol kembali dari judul */}
      <div className="back-button-container">
        <button onClick={handleBack} className="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Kembali
        </button>
      </div>
      
      {/* Pindahkan judul ke bawah tombol */}
      <h2 className="page-title">Rekap Skor Pelanggaran Siswa</h2>
   
      {loading ? (
        <div className="loading-message">⏳ Memuat data...</div>
      ) : rekap.length === 0 ? (
        <div className="empty-message">Tidak ada data rekap pelanggaran.</div>
      ) : filteredData.length === 0 ? (
        <div className="empty-message">Tidak ditemukan data yang sesuai dengan pencarian.</div>
      ) : (
        <div className="rekap-table-container">
          <RekapTable 
            data={filteredData} 
            onSelectSiswa={handleSelectSiswa}
            className="rekap-table"
          />
        </div>
      )}
    </div>
  );
}

export default RekapPage;
