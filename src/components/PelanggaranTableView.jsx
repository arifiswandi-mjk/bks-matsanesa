import React from 'react';
import '../styles/PelanggaranTable.css';

// Komponen UI murni - hanya menerima props dan menampilkan UI
function PelanggaranTableView({
  // Data
  sortedData,
  kelasList,
  // State UI
  filterKelas,
  searchNama,
  sortDirection,
  // Event handlers
  onFilterChange,
  onSearchChange,
  onSortToggle,
  onSelectSiswa,
  onEdit
}) {
  return (
    <div>
      <div className="filter-bar">
        <select
          value={filterKelas}
          onChange={e => onFilterChange(e.target.value)}
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
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Cari nama siswa..."
          className="filter-input"
        />
      </div>
      <div className="pelanggaran-table-container">
        <table className="pelanggaran-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: '48px' }}>No</th>
              <th onClick={onSortToggle} style={{ cursor: 'pointer' }}>
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
                  <td>{item.formattedDate || item.Timestamp}</td>
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

export default PelanggaranTableView;