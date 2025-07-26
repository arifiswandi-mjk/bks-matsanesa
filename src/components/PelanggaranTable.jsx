import React from 'react';
import '../styles/PelanggaranTable.css';

function PelanggaranTabel({ data, onSelectSiswa, onEdit, onDelete }) {
  const [filterKelas, setFilterKelas] = React.useState('');
  const [searchNama, setSearchNama] = React.useState('');

  // Ambil daftar kelas unik
  const kelasList = React.useMemo(() => {
    const setKelas = new Set(data.map(d => d.Kelas).filter(Boolean));
    return Array.from(setKelas).sort();
  }, [data]);

  // Filter data berdasarkan kelas dan nama
  const filteredData = data.filter(item => {
    const matchKelas = filterKelas ? item.Kelas === filterKelas : true;
    const matchNama = searchNama
      ? (item['Nama Siswa'] || '').toLowerCase().includes(searchNama.toLowerCase())
      : true;
    return matchKelas && matchNama;
  });

  // Sort data by Timestamp descending (newest first)
  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(a.Timestamp);
    const dateB = new Date(b.Timestamp);
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return dateB - dateA;
    }
    return String(b.Timestamp).localeCompare(String(a.Timestamp));
  });

  return (
    <div>
      <div className="filter-bar">
        <select
          value={filterKelas}
          onChange={e => setFilterKelas(e.target.value)}
          className="filter-select"
        >
          <option value="">Semua Kelas</option>
          {kelasList.map(kls => (
            <option key={kls} value={kls}>
              {kls}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={searchNama}
          onChange={e => setSearchNama(e.target.value)}
          placeholder="Cari nama siswa..."
          className="filter-input"
        />
      </div>
      <div className="pelanggaran-table-container">
        <table className="pelanggaran-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: '48px' }}>No</th>
              <th>Tanggal</th>
              <th>NISN</th>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th>Pelanggaran</th>
              <th>Skor</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="8">Tidak ada data pelanggaran.</td>
              </tr>
            ) : (
              sortedData.map((item, idx) => (
                <tr key={item.ID}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td>{item.Timestamp}</td>
                  <td>{item.Nisn}</td>
                  <td>{item['Nama Siswa']}</td>
                  <td>{item.Kelas}</td>
                  <td>{item.Pelanggaran}</td>
                  <td style={{ textAlign: 'center' }}>{item.Skor}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="aksi-btn-group">
                      <button onClick={() => onSelectSiswa(item.Nisn)} className="aksi-btn detail">
                        Detail
                      </button>
                      <button onClick={() => onEdit(item)} className="aksi-btn edit">
                        Edit
                      </button>
                      {/* <button
                        onClick={() => onDelete(item.ID)}
                        className="aksi-btn delete"
                      >
                        Hapus
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PelanggaranTabel;
