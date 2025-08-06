import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import '../styles/RekapTable.css'; // Atau "../styles/RekapTable.css" jika Anda pisahkan

function RekapTable({ data, onSelectSiswa }) {
  const [selectedKelas, setSelectedKelas] = useState('');
  const [searchNama, setSearchNama] = useState('');

  const daftarKelas = useMemo(() => {
    const semua = data.map(d => d.Kelas).filter(Boolean);
    return [...new Set(semua)].sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data
      .filter(
        d =>
          (!selectedKelas || d.Kelas === selectedKelas) &&
          d.Nama.toLowerCase().includes(searchNama.toLowerCase())
      )
      .sort((a, b) => a.Nama.localeCompare(b.Nama));
  }, [data, selectedKelas, searchNama]);

  const handleExportExcel = () => {
    const exportData = filteredData.map((item, index) => ({
      No: index + 1,
      NISN: item.Nisn,
      Nama: item.Nama,
      Kelas: item.Kelas,
      Total_Skor: item.Total,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap');
    XLSX.writeFile(wb, 'rekap_pelanggaran.xlsx');
  };

  return (
    <div className="rekap-container">
      <div className="rekap-filters">
        <label>
          Filter Kelas:
          <select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)}>
            <option value="">Semua</option>
            {daftarKelas.map(kelas => (
              <option key={kelas} value={kelas}>
                {kelas}
              </option>
            ))}
          </select>
        </label>

        <label>
          Cari Nama:
          <input
            type="text"
            value={searchNama}
            onChange={e => setSearchNama(e.target.value)}
            placeholder="Ketik nama siswa..."
          />
        </label>

        <button onClick={handleExportExcel} className="export-button">
          ⬇️ Export Excel
        </button>
      </div>

      <div className="rekap-table-container">
        <table className="rekap-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>NISN</th>
              <th>Kelas</th>
              <th className="skor-column">Total Skor</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6">Tidak ada data ditemukan.</td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.Nisn ?? `row-${index}`}>
                  <td>{index + 1}</td>
                  <td>{item.Nama}</td>
                  <td>{item.Nisn}</td>
                  <td>{item.Kelas}</td>
                  <td className="skor-column">{item.Total}</td>
                  <td>
                    <button
                      onClick={() => onSelectSiswa(item.Nisn)}
                      className="detail-button"
                    >
                      Detail
                    </button>
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

export default RekapTable;
