import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SiswaPage.css';

// Tambahkan API URL
const API = import.meta.env.VITE_API_URL;

function SiswaPage() {
  const navigate = useNavigate();
  const [siswaData, setSiswaData] = useState({
    nama: '',
    nisn: '',
    kelas: ''
  });
  const [pelanggaranData, setPelanggaranData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    // Ambil data dari session storage
    const siswaNisn = sessionStorage.getItem('siswa_nisn');
    const siswaNama = sessionStorage.getItem('siswa_nama');
    const siswaKelas = sessionStorage.getItem('siswa_kelas');
    
    console.log("NISN dari session:", siswaNisn);
    
    if (!siswaNisn) {
      navigate('/login-siswa');
      return;
    }
    
    setSiswaData({
      nama: siswaNama || 'Siswa',
      nisn: siswaNisn,
      kelas: siswaKelas || 'Kelas Tidak Diketahui'
    });
    
    // Fetch pelanggaran data
    fetchPelanggaranSiswa(siswaNisn);
  }, [navigate]);

  // Fungsi untuk mengambil data pelanggaran siswa
  const fetchPelanggaranSiswa = async (nisn) => {
    try {
      setDetailLoading(true);
      
      // Pastikan nisn tidak kosong
      if (!nisn) {
        console.error("NISN kosong");
        setPelanggaranData([]);
        return;
      }
      
      console.log("Mengirim request dengan NISN:", nisn); // Debugging
      
      // 1. Ubah format request
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'readPelanggaranByNisn',
          data: { nisn },
          // data: {
          //   nisn: nisn.trim()
          // },
          // Nisn: nisn.trim() // Coba dengan huruf kapital jika backend case-sensitive
        })
      });
      
      // 2. Perbaiki pengecekan respons API
      const data = await response.json();
      console.log("Pelanggaran data:", data);
      
      // Pengecekan yang benar
      if (data) {
        setPelanggaranData(data);
      } else {
        setPelanggaranData([]);
        // console.log('Tidak ada data pelanggaran:', data.message || data.error);
      }
    } catch (err) {
      console.error('Error fetching pelanggaran:', err);
      setPelanggaranData([]);
    } finally {
      setDetailLoading(false);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('siswa_nisn');
    sessionStorage.removeItem('siswa_nama');
    sessionStorage.removeItem('siswa_kelas');
    sessionStorage.removeItem('role');
    navigate('/login-siswa');
  };

  // Format tanggal ke format Indonesia
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      console.log("Format tanggal input:", dateString);
      
      // Parse format DD-MM-YYYY HH:MM:SS ke format yang valid
      if (typeof dateString === 'string' && dateString.includes('-')) {
        // Pecah string menjadi tanggal dan waktu
        const [datePart, timePart] = dateString.split(' ');
        
        // Pecah bagian tanggal (DD-MM-YYYY)
        const [day, month, year] = datePart.split('-');
        
        // Buat format ISO yang valid: YYYY-MM-DDThh:mm:ss
        dateString = `${year}-${month}-${day}T${timePart || '00:00:00'}`;
        console.log("Tanggal setelah dikonversi:", dateString);
      }
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.error("Tanggal tidak valid:", dateString);
        return dateString;
      }
      
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      return date.toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error("Error saat memformat tanggal:", error);
      return dateString;
    }
  };

  if (loading) {
    return <div className="loading-container">Memuat...</div>;
  }

  return (
    <div className="siswa-page">
      <header className="siswa-header">
        <h1>Portal Siswa</h1>
        <button onClick={handleLogout} className="logout-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Keluar
        </button>
      </header>

      <div className="siswa-info">
        <h2>Selamat Datang,</h2>
        <p>Nama : {siswaData.nama}</p>
        <p>NISN : {siswaData.nisn}</p>
        {siswaData.kelas && <p>Kelas : {siswaData.kelas}</p>}
      </div>

      <div className="siswa-content">
        <div className="siswa-card">
          <h3>Catatan Pelanggaran</h3>
          
          {detailLoading ? (
            <div className="detail-loading">
              <div className="spinner"></div>
              <span>Memuat data pelanggaran...</span>
            </div>
          ) : pelanggaranData.length > 0 ? (
            <div className="pelanggaran-table-container">
              <table className="pelanggaran-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Tanggal</th>
                    <th>Jenis Pelanggaran</th>
                    <th>Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {pelanggaranData.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                      <td>{index + 1}</td>
                      {console.log('tangal= ',item.Timestamp)}
                      <td>{formatDate(item.Timestamp)}</td>
                      <td>{item.Pelanggaran}</td>
                      <td className="poin-cell">{item.Skor}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="total-label">Total Poin Pelanggaran</td>
                    <td className="total-poin">
                      {pelanggaranData.reduce((sum, item) => sum + (parseInt(item.Skor) || 0), 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              
              <div className="pelanggaran-summary">
                <div className="summary-item">
                  <div className="summary-label">Total Pelanggaran</div>
                  <div className="summary-value">{pelanggaranData.length}</div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Total Skor</div>
                  <div className="summary-value warning">
                    {pelanggaranData.reduce((sum, item) => sum + (parseInt(item.Skor) || 0), 0)}
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Status</div>
                  <div className="summary-value status">
                    {pelanggaranData.reduce((sum, item) => sum + (parseInt(item.Skor) || 0), 0) >= 100 ? 
                      <span className="status-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Peringatan
                      </span> : 
                      <span className="status-safe">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Baik
                      </span>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <div className="no-data-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h4>Tidak Ada Pelanggaran</h4>
              <p>Selamat! Anda belum memiliki catatan pelanggaran. Pertahankan perilaku baik Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SiswaPage;