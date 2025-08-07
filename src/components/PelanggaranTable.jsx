import React from 'react';
import '../styles/PelanggaranTable.css';

function PelanggaranTabel({ data, onSelectSiswa, onEdit }) {
  const [filterKelas, setFilterKelas] = React.useState('');
  const [searchNama, setSearchNama] = React.useState('');
  const [sortDirection, setSortDirection] = React.useState('desc'); // 'desc' untuk terbaru dulu

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

  // Fungsi untuk mengubah arah pengurutan
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Fungsi helper untuk parsing tanggal DD-MM-YYYY HH:MM:SS
  function parseDate(dateString) {
    if (!dateString) return new Date(0);
    
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('-');
    
    // Format menjadi YYYY-MM-DDThh:mm:ss yang dipahami JavaScript
    return new Date(`${year}-${month}-${day}T${timePart || '00:00:00'}`);
  }

  // Pengurutan data dengan parsing tanggal yang tepat
  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = parseDate(a.Timestamp);
    const dateB = parseDate(b.Timestamp);
    
    return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
  });

  // Fungsi helper
  function formatDate(dateString) {
    try {
      // Jika dateString kosong
      if (!dateString) return '';
      
      // Untuk tanggal yang sudah dalam format JavaScript Date object
      let date;
      
      // Jika format yang masuk adalah DD-MM-YYYY HH:MM:SS
      if (dateString.includes('-')) {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('-');
        date = new Date(`${year}-${month}-${day}T${timePart || '00:00:00'}`);
      } 
      // Format lainnya, coba parsing biasa
      else {
        date = new Date(dateString);
      }
      
      // Jika parsing sukses, format secara manual ke DD/MM/YYYY
      if (!isNaN(date)) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year}, ${hours}:${minutes}`;
      }
      
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  }

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
              <th onClick={toggleSortDirection} style={{ cursor: 'pointer' }}>
                Tanggal
                <span className="sort-indicator">{sortDirection === 'desc' ? '↓' : '↑'}</span>
              </th>
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
                  <td>{formatDate(item.Timestamp)}</td>
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
