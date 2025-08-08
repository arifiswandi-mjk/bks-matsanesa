import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/LoginSiswa.css';
import logoSekolah from '../assets/logo.svg';

const API = import.meta.env.VITE_API_URL;

function LoginSiswaPage() {
  const navigate = useNavigate();
  const [nisn, setNisn] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  // Tambahkan state untuk tracking digit count
  const [digitCount, setDigitCount] = useState(0);
  
  useEffect(() => {
    const siswaNisn = sessionStorage.getItem('siswa_nisn');
    if (siswaNisn) {
      navigate('/siswa');
    }
    
    const adminUsername = sessionStorage.getItem('username');
    if (adminUsername) {
      navigate('/');
    }
  }, [navigate]);
  
  const validateNisn = (nisnValue) => {
    const cleanNisn = nisnValue.trim().replace(/\D/g, '');
    
    if (cleanNisn.length === 0) {
      return { valid: false, error: 'NISN tidak boleh kosong', cleanNisn };
    }
    
    if (cleanNisn.length !== 10) {
      return { 
        valid: false, 
        error: `NISN harus terdiri dari 10 digit angka (saat ini ${cleanNisn.length} digit)`, 
        cleanNisn 
      };
    }
    
    return { valid: true, error: '', cleanNisn };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const { valid, error, cleanNisn } = validateNisn(nisn);
    
    if (!valid) {
      setError(error);
      return;
    }
    
    // Pastikan NISN diproses dalam berbagai format
    const nisnAsString = cleanNisn.toString();
    const nisnAsNumber = parseInt(cleanNisn, 10);
    
    // Tambahkan log untuk debugging
    console.log("Searching for NISN in formats:", {
      string: nisnAsString,
      number: nisnAsNumber,
      original: cleanNisn
    });
    
    try {
      setLoading(true);
      setError('');
      setNotFound(false);
      
      console.log("Mengirim NISN:", cleanNisn);
      
      // Perbaiki format request untuk memastikan NISN ditemukan
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',  // Pastikan ini sesuai dengan ekspektasi server
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'readSiswaByNisn',
          nisn: cleanNisn,
          nisnStr: nisnAsString,
          nisnNum: nisnAsNumber,
          // Tambahkan variasi format untuk memastikan kompatibilitas
          Nisn: cleanNisn,
          NISN: cleanNisn,
          data: {
            nisn: cleanNisn
          }
        })
      });
      
      console.log("Response status:", response.status);
      
      let responseText = '';
      try {
        const responseClone = response.clone();
        responseText = await responseClone.text();
        console.log("Raw response:", responseText);
      } catch (err) {
        console.log("Couldn't read response text", err);
      }
      
      let data;
      try {
        // Coba parse sebagai JSON
        data = await response.json();
        console.log("Response data:", data);
        
        // Periksa jika data adalah string, mungkin perlu di-parse lagi
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
            console.log("Re-parsed data:", data);
          } catch (e) {
            console.log("Couldn't parse string data as JSON",e);
          }
        }
      } catch (err) {
        console.error("Error parsing JSON:", err);
        setError(`Error memproses response: ${responseText.substring(0, 100)}`);
        return;
      }
      
      // Perbaiki pengecekan data siswa
      console.log("Full response structure:", JSON.stringify(data, null, 2));
      
      // Cek struktur data yang benar
      if (data.status === 'success' && data.siswa) {
        console.log("Siswa data found:", data.siswa);
        
        // Periksa dengan case insensitive
        const nisnFound = data.siswa.Nisn || data.siswa.nisn || data.siswa.NISN;
        const namaFound = data.siswa.Nama || data.siswa.nama || data.siswa.NAME;
        
        if (nisnFound && namaFound) {
          setSuccess(true);
          
          // Simpan data dengan format yang konsisten
          sessionStorage.setItem('siswa_nisn', nisnFound);
          sessionStorage.setItem('siswa_nama', namaFound);
          sessionStorage.setItem('siswa_kelas', data.siswa.Kelas || data.siswa.kelas || '');
          sessionStorage.setItem('role', 'siswa');
          
          setTimeout(() => navigate('/siswa'), 800);
          return;
        }
      }
      
      // Jika kode mencapai sini, berarti struktur data tidak sesuai ekspektasi
      console.error("Invalid data structure:", data);
      
      if (data.status === 'error' || data.error) {
        const errorMsg = data.message || data.error || 'Error tidak diketahui';
        
        if (
          errorMsg.toLowerCase().includes('tidak ditemukan') ||
          errorMsg.toLowerCase().includes('tidak terdaftar') ||
          errorMsg.toLowerCase().includes('tidak ada') ||
          errorMsg.toLowerCase().includes('nisn kosong')
        ) {
          console.log("Setting notFound to true");
          setNotFound(true);
          setError(`NISN ${cleanNisn} tidak ditemukan dalam sistem`);
        } else {
          setError(errorMsg);
        }
        return;
      }
      
      if (!data.siswa) {
        setNotFound(true);
        setError(`NISN ${cleanNisn} tidak ditemukan`);
        return;
      }
      
      if (!data.siswa.Nisn || !data.siswa.Nama) {
        setError('Data siswa tidak lengkap');
        console.error('Invalid siswa data:', data.siswa);
        return;
      }
      
      setSuccess(true);
      
      sessionStorage.setItem('siswa_nisn', data.siswa.Nisn);
      sessionStorage.setItem('siswa_nama', data.siswa.Nama);
      sessionStorage.setItem('siswa_kelas', data.siswa.Kelas);
      sessionStorage.setItem('role', 'siswa');
      
      setTimeout(() => navigate('/siswa'), 800);
    } catch (err) {
      console.error('Login error:', err);
      setError('Gagal login. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNisnChange = (e) => {
    const newValue = e.target.value;
    setNisn(newValue);
    
    // Hitung jumlah digit
    const digitOnly = newValue.replace(/\D/g, '');
    setDigitCount(digitOnly.length);
  };

  const closeWarning = () => {
    console.log("closeWarning called - setting notFound to false");
    setTimeout(() => {
      setNotFound(false);
      setError('');
    }, 0);
  };

  useEffect(() => {
    console.log("State updated - notFound:", notFound, "error:", error);
  }, [notFound, error]);

  return (
    <div className="siswa-login-page">
      <div className="siswa-login-container">
        <div className="siswa-brand-section">
          <div className="siswa-logo">
            <img src={logoSekolah} alt="Logo Sekolah" />
          </div>
          <h1>BKS Digital</h1>
          <h2>MTsN 1 Mojokerto</h2>
          <div className="siswa-portal-badge">Portal Siswa</div>
        </div>
        
        <div className="siswa-form-section">
          <form onSubmit={handleLogin} className={`siswa-login-card ${success ? 'success' : ''}`}>
            <h2 className="siswa-login-heading">Login Siswa</h2>
            
            {(notFound || error) && (
              <div className={`siswa-error-message ${notFound ? 'not-found-warning' : ''}`}>
                {console.log("Rendering warning, notFound:", notFound, "error:", error)}
                
                {notFound ? (
                  <>
                    <div className="warning-header">
                      <h4>Siswa Tidak Ditemukan</h4>
                      <button 
                        type="button" 
                        className="close-warning-btn"
                        onClick={() => {
                          console.log("Close warning clicked");
                          closeWarning();
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <div className="warning-content">
                      <div className="warning-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>
                        </svg>
                      </div>
                      <p>{error}</p>
                      <ul className="warning-tips">
                        <li>Pastikan NISN yang dimasukkan sudah benar</li>
                        <li>Periksa apakah ada kesalahan pengetikan</li>
                        <li>Hubungi admin jika Anda yakin NISN sudah benar</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
                    </svg>
                    <span>{error}</span>
                    <button 
                      type="button" 
                      className="close-error-btn"
                      onClick={closeWarning}
                      aria-label="Tutup pesan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="siswa-input-group">
              <label htmlFor="nisn">NISN</label>
              <div className="siswa-input-with-icon">
                <svg className="siswa-input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/>
                </svg>
                <input
                  id="nisn"
                  type="text"
                  placeholder="Masukkan NISN Anda"
                  value={nisn}
                  onChange={handleNisnChange}
                  className={`siswa-login-input ${digitCount > 0 && digitCount !== 10 ? 'nisn-invalid' : ''}`}
                  disabled={loading}
                  autoComplete="off"
                  inputMode="numeric"
                />
              </div>
              <small className="siswa-input-helper">NISN terdiri dari 10 digit angka</small>
            </div>

            {/* Tambahkan indikator panjang NISN */}
            <div className="nisn-length-indicator">
              <div className="digit-count">
                <span className={digitCount === 10 ? 'valid-count' : (digitCount > 0 ? 'invalid-count' : '')}>
                  {digitCount}
                </span>/10 digit
              </div>
              {digitCount === 10 && (
                <div className="valid-format">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Format valid
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="siswa-login-button" 
              disabled={loading || success}
            >
              {loading ? (
                <span className="siswa-loader-container">
                  <span className="siswa-loader"></span>
                  <span>Memproses...</span>
                </span>
              ) : success ? (
                <span className="siswa-success-container">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                  <span>Login Berhasil</span>
                </span>
              ) : 'Masuk'}
            </button>
            
            {/* Tombol debug untuk testing (hapus setelah selesai) */}
            <button 
              type="button"
              className="siswa-debug-button"
              onClick={() => {
                setNotFound(true);
                setError('NISN 123456789 tidak ditemukan dalam sistem');
                console.log("Debug: notFound diatur ke true");
              }}
            >
              Test Warning
            </button>

            <div className="siswa-login-footer">
              <Link to="/login" className="siswa-admin-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.83-3.4 8.94-7 10-3.6-1.06-7-5.17-7-10V6.3l7-3.12z"/>
                </svg>
                Login sebagai Admin
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      <div className="siswa-footer">
        <p>© 2025 MTsN 1 Mojokerto - BKS Digital</p>
      </div>
    </div>
  );
}

export default LoginSiswaPage;