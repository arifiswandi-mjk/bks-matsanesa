import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PelanggaranTabel from '../components/PelanggaranTable';
import TambahPelanggaranForm from '../components/TambahPelanggaranForm';
import SiswaDetailPage from './SiswaDetailPage';
import { getLocalDateTimeNow } from '../utils/dateHelpers';

import '../styles/Dashboard.css';

const API = import.meta.env.VITE_API_URL;

function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [userID, setUserID] = useState('');

  const [siswa, setSiswa] = useState([]);
  const [jenisList, setJenisList] = useState([]);
  const [pelanggaranList, setPelanggaranList] = useState([]);

  const [kelasDipilih, setKelasDipilih] = useState('');
  const [namaDipilih, setNamaDipilih] = useState('');
  const [jenisDipilih, setJenisDipilih] = useState('');
  const [tanggalDipilih, setTanggalDipilih] = useState('');
  const [modeTanggal, setModeTanggal] = useState('otomatis');
  const [loadingTambah, setLoadingTambah] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  const [dataForm, setDataForm] = useState(null); // data yang diedit
  const [modeEdit, setModeEdit] = useState(false);
  const [nisnTerpilih, setNisnTerpilih] = useState(null); // tombol detail

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    const storedUserID = sessionStorage.getItem('userID');

    if (!storedUsername || !storedUserID) {
      navigate('/login');
    } else {
      setUsername(storedUsername);
      setUserID(storedUserID);
    }
  }, [navigate]);

  const muatPelanggaran = useCallback(async () => {
    if (!userID) return;
    const res = await fetch(API, {
      method: 'POST',
      body: JSON.stringify({ action: 'readPelanggaran', data: { userID } }),
    });
    const data = await res.json();
    setPelanggaranList(data);
  }, [userID]);

  const muatSemuaData = useCallback(async () => {
    setLoadingPage(true);
    try {
      await Promise.all([muatPelanggaran(), muatSiswa(), muatJenis()]);
    } catch (error) {
      console.error('❌ Gagal memuat data:', error);
      alert('Terjadi kesalahan saat memuat data.');
    } finally {
      setLoadingPage(false);
    }
  },[muatPelanggaran]);

  useEffect(() => {
    if (userID) {
      muatSemuaData();
    }
  }, [muatSemuaData, userID]);

  const muatSiswa = async () => {
    const res = await fetch(API, {
      method: 'POST',
      body: JSON.stringify({ action: 'readSiswa' }),
    });
    const data = await res.json();
    setSiswa(data);
  };

  const muatJenis = async () => {
    const res = await fetch(API, {
      method: 'POST',
      body: JSON.stringify({ action: 'readJenis' }),
    });
    const data = await res.json();
    setJenisList(data);
  };
  // Update pelanggaran (edit) - pindahkan ke scope utama
  const updatePelanggaran = async () => {
    if (!dataForm) return;
    let tanggalFinal = tanggalDipilih;
    if (modeTanggal === 'otomatis') {
      tanggalFinal = getLocalDateTimeNow();
    }
    if (!kelasDipilih || !namaDipilih || !jenisDipilih || !tanggalFinal) {
      alert('❗ Lengkapi semua pilihan terlebih dahulu!');
      return;
    }
    setLoadingTambah(true);
    try {
      const response = await fetch(API, {
        method: 'POST',
        body: JSON.stringify({
          action: 'updatePelanggaran',
          data: {
            id: dataForm.ID,
            nama: namaDipilih,
            kelas: kelasDipilih,
            pelanggaran: jenisDipilih,
            tanggal: tanggalFinal,
            userID,
          },
        }),
      });
      if (!response.ok) throw new Error('Gagal update pelanggaran');
      await muatPelanggaran();
      setKelasDipilih('');
      setNamaDipilih('');
      setJenisDipilih('');
      setTanggalDipilih('');
      setModeTanggal('otomatis');
      setDataForm(null);
      setModeEdit(false);
      alert('✅ Data berhasil diupdate!');
    } catch (error) {
      console.error(error);
      alert('❌ Terjadi kesalahan saat update.');
    } finally {
      setLoadingTambah(false);
    }
  };

  const cancelEdit = () => {
    setDataForm(null);
    setModeEdit(false);
    setKelasDipilih('');
    setNamaDipilih('');
    setJenisDipilih('');
    setTanggalDipilih('');
    setModeTanggal('otomatis');
  };

  const tambahPelanggaran = async () => {
    // Tanggal otomatis: gunakan hari ini
    let tanggalFinal = tanggalDipilih;
    if (modeTanggal === 'otomatis') {
      tanggalFinal = getLocalDateTimeNow();
    }
    if (!kelasDipilih || !namaDipilih || !jenisDipilih || !tanggalFinal) {
      alert('❗ Lengkapi semua pilihan terlebih dahulu!');
      return;
    }

    setLoadingTambah(true);
    setModeEdit(false);
    setDataForm(null);

    try {
      const response = await fetch(API, {
        method: 'POST',
        body: JSON.stringify({
          action: 'createPelanggaran',
          data: {
            nama: namaDipilih,
            kelas: kelasDipilih,
            pelanggaran: jenisDipilih,
            pencatat: username,
            userID,
            tanggal: tanggalFinal,
          },
        }),
      });

      if (!response.ok) throw new Error('Gagal menambahkan pelanggaran');

      await muatPelanggaran();

      setKelasDipilih('');
      setNamaDipilih('');
      setJenisDipilih('');
      setTanggalDipilih('');
      setModeTanggal('otomatis');

      alert('✅ Pelanggaran berhasil ditambahkan!');
    } catch (error) {
      console.error(error);
      alert('❌ Terjadi kesalahan saat menambahkan pelanggaran.');
    } finally {
      setLoadingTambah(false);
    }
  };

  const handleDelete = async id => {
    const konfirmasi = window.confirm('Yakin ingin menghapus data ini?');
    if (!konfirmasi) return;

    try {
      const res = await fetch(API, {
        method: 'POST',
        body: JSON.stringify({
          action: 'deletePelanggaran',
          data: { id, userID },
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert('✅ Data berhasil dihapus');
        muatPelanggaran();
      } else {
        alert('❌ Gagal menghapus data');
      }
    } catch (err) {
      console.error('❌ Error saat menghapus:', err);
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userID');
    sessionStorage.removeItem('name');
    navigate('/login');
  };

  const daftarKelas = [...new Set(siswa.map(s => s.Kelas))];
  const daftarNama = siswa.filter(s => s.Kelas === kelasDipilih);

  // ✅ Tampilkan halaman detail jika ada nisn yang dipilih
  if (nisnTerpilih) {
    return <SiswaDetailPage nisn={nisnTerpilih} onBack={() => setNisnTerpilih(null)} />;
  }

  if (loadingPage) {
    return (
      <div className="loading-screen">
        <h2>⏳ Memuat data, mohon tunggu...</h2>
      </div>
    );
  }

  return (
    <div className="main-app-container">
      <div className="top-bar">
        <button onClick={handleLogout} className="logout-button">
          🚪 Logout
        </button>
      </div>

      <h2 className="heading">Selamat datang, {username}</h2>

      <h3 className="subheading">Catat Pelanggaran</h3>
      <TambahPelanggaranForm
        daftarKelas={daftarKelas}
        daftarNama={daftarNama}
        jenisList={jenisList}
        kelasDipilih={kelasDipilih}
        namaDipilih={namaDipilih}
        jenisDipilih={jenisDipilih}
        tanggalDipilih={tanggalDipilih}
        modeTanggal={modeTanggal}
        loadingTambah={loadingTambah}
        setKelasDipilih={setKelasDipilih}
        setNamaDipilih={setNamaDipilih}
        setJenisDipilih={setJenisDipilih}
        setTanggalDipilih={setTanggalDipilih}
        setModeTanggal={setModeTanggal}
        onTambah={tambahPelanggaran}
        modeEdit={modeEdit}
        dataEdit={dataForm}
        onUpdate={updatePelanggaran}
        onCancelEdit={cancelEdit}
      />

      <div className="table-container">
        <PelanggaranTabel
          data={pelanggaranList}
          onSelectSiswa={nisn => setNisnTerpilih(nisn)}
          onEdit={item => {
            setDataForm(item);
            setModeEdit(true);
          }}
          onDelete={id => handleDelete(id)}
        />
      </div>

      <div className="button-group">
        <button onClick={() => navigate('/rekap')} className="button-yellow">
          Lihat Rekap Skor
        </button>
        <button onClick={() => navigate('/grafik')} className="button-blue">
          Lihat Grafik Pelanggaran
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
