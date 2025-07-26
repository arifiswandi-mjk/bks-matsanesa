import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_URL;

function GrafikPage() {
  const navigate = useNavigate();
  const [rekapData, setRekapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (!storedUsername) {
      navigate('/login');
    } else {
      fetchRekap();
    }
  }, [navigate]);

  const fetchRekap = async () => {
    try {
      const res = await fetch(API, {
        method: 'POST',
        body: JSON.stringify({ action: 'rekapPelanggaran' }),
      });
      const data = await res.json();
      setRekapData(data);
    } catch (error) {
      console.error('Gagal memuat data:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Grafik Total Skor Pelanggaran</h2>
      {loading ? (
        <p className="text-center">Memuat data...</p>
      ) : (
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={rekapData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Nama" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Total" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <button onClick={() => navigate('/')} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
        Kembali ke Dashboard
      </button>
    </div>
  );
}

export default GrafikPage;
