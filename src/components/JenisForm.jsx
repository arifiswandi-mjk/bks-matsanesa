import { useState } from 'react';

const API = import.meta.env.VITE_API_URL;

function JenisForm({ jenisList, refresh }) {
  const [jenisBaru, setJenisBaru] = useState('');
  const [skorBaru, setSkorBaru] = useState('');
  const [loading, setLoading] = useState(false);

  const tambahJenis = async () => {
    if (!jenisBaru.trim() || !skorBaru.trim()) {
      alert('Harap isi Jenis dan Skor');
      return;
    }

    setLoading(true);
    await fetch(API, {
      method: 'POST',
      body: JSON.stringify({
        action: 'createJenis',
        data: { nama: jenisBaru.trim(), skor: parseInt(skorBaru) },
      }),
    });

    setJenisBaru('');
    setSkorBaru('');
    await refresh(); 
    setLoading(false);
  };

  const hapusJenis = async id => {
    const konfirmasi = window.confirm('Yakin ingin menghapus jenis ini?');
    if (!konfirmasi) return;

    setLoading(true);
    await fetch(API, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteJenis', data: { id } }),
    });
    await refresh();
    setLoading(false);
  };

  return (
    <div>
      <div style={styles.formGroup}>
        <input
          type="text"
          placeholder="Jenis Pelanggaran Baru"
          value={jenisBaru}
          onChange={e => setJenisBaru(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <input
          type="number"
          placeholder="Skor"
          value={skorBaru}
          onChange={e => setSkorBaru(e.target.value)}
          style={styles.input}
          disabled={loading}
        />
        <button onClick={tambahJenis} style={styles.addButton} disabled={loading}>
          {loading ? 'Memproses...' : '➕ Tambah'}
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Jenis Pelanggaran</th>
            <th style={styles.th}>Skor</th>
            <th style={styles.th}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {jenisList.length === 0 ? (
            <tr>
              <td colSpan="3" style={styles.empty}>
                Belum ada data
              </td>
            </tr>
          ) : (
            jenisList.map((j, index) => (
              <tr key={j.ID} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>{j.Nama}</td>
                <td style={styles.td}>{j.Skor}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => hapusJenis(j.ID)}
                    style={styles.deleteButton}
                    disabled={loading}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  formGroup: {
    marginBottom: '1.5rem',
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    minWidth: '150px',
  },
  addButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    fontFamily: 'Arial, sans-serif',
  },
  th: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '10px',
    textAlign: 'left',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #eee',
  },
  rowEven: {
    backgroundColor: '#f9f9f9',
  },
  rowOdd: {
    backgroundColor: '#fff',
  },
  deleteButton: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#dc3545',
    color: '#fff',
    cursor: 'pointer',
  },
  empty: {
    textAlign: 'center',
    padding: '15px',
    fontStyle: 'italic',
    color: '#777',
  },
};

export default JenisForm;
