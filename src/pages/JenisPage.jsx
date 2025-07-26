import { useEffect, useState, lazy } from 'react';
import { useNavigate } from 'react-router-dom';

const JenisForm = lazy(() => import('../components/JenisForm'));

function JenisPage() {
  const navigate = useNavigate();
  const [jenisList, setJenisList] = useState([]);

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (!storedUsername) {
      navigate('/login');
    } else {
      muatJenis();
    }
  }, [navigate]);

  const muatJenis = async () => {
    const API = import.meta.env.VITE_API_URL;

    const res = await fetch(API, {
      method: 'POST',
      body: JSON.stringify({ action: 'readJenis' }),
    });
    const data = await res.json();
    setJenisList(data);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Kelola Jenis Pelanggaran</h2>
      <JenisForm jenisList={jenisList} refresh={muatJenis} />
      <button onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
        Kembali ke Dashboard
      </button>
    </div>
  );
}

export default JenisPage;
