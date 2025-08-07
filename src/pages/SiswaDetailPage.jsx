import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Tambahkan useNavigate
import '../styles/SiswaDetailPage.css';
// Import library untuk Excel export
import * as XLSX from 'xlsx';
// Import library untuk Document export
import { Document, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle, Packer } from 'docx';
import { saveAs } from 'file-saver';

const API = import.meta.env.VITE_API_URL;

function SiswaDetailPage({ nisn: propNisn }) {
  // Gunakan useParams untuk mengakses NISN dari URL
  const { id } = useParams();
  // Gunakan useNavigate untuk tombol kembali
  const navigate = useNavigate();

  const [dataPelanggaran, setDataPelanggaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siswa, setSiswa] = useState({ Nama: '', Nisn: '', Kelas: '' });

  // Gunakan parameter URL atau prop
  const nisn = id || propNisn;

  useEffect(() => {
    if (!nisn) {
      console.error('NISN tidak ditemukan');
      setLoading(false);
      setDataPelanggaran([]);
      setSiswa({ Nama: '', Nisn: '', Kelas: '' });
      return;
    }
    async function fetchPelanggaran() {
      try {
        const res = await fetch(API, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            action: 'readPelanggaranByNisn',
            data: { nisn },
          }),
        });

        const json = await res.json();

        // Respons API adalah array, ambil data siswa dari item pertama
        if (Array.isArray(json) && json.length > 0) {
          const firstItem = json[0];
          setSiswa({
            Nama: firstItem['Nama Siswa'] || firstItem.nama || firstItem.Nama || '', // Tambahkan 'Nama Siswa' dengan format bracket
            Nisn: firstItem.Nisn || firstItem.nisn || nisn,
            Kelas: firstItem.Kelas || firstItem.kelas || '',
          });
          setDataPelanggaran(json);
        } else if (json.siswa) {
          // Format alternatif jika API berubah kembali ke format objek
          setSiswa({
            Nama: json.siswa.Nama || '',
            Nisn: json.siswa.Nisn || nisn,
            Kelas: json.siswa.Kelas || '',
          });
          setDataPelanggaran(Array.isArray(json.data) ? json.data : []);
        } else {
          console.warn('Data siswa tidak ditemukan dalam respons API');
          setSiswa({ Nama: '', Nisn: nisn, Kelas: '' });
          setDataPelanggaran(Array.isArray(json) ? json : []);
        }
      } catch (err) {
        console.error('Error detail:', err.message);
        console.error('Gagal mengambil data pelanggaran:', err);
        setDataPelanggaran([]);
        setSiswa({ Nama: '', Nisn: nisn, Kelas: '' });
      } finally {
        setLoading(false);
      }
    }

    fetchPelanggaran();
  }, [nisn]);

  // Fungsi untuk mencetak halaman
  const handlePrint = () => {
    window.print();
  };

  // Fungsi untuk mengekspor data ke Excel
  const handleExportExcel = () => {
    const fileExtension = '.xlsx';
    
    // Membuat data untuk ekspor sesuai contoh gambar
    const wsData = [
      ['RIWAYAT PELANGGARAN'], // Judul sebagai header pertama
      ['Nama', siswa.Nama],
      ['NISN', siswa.Nisn],
      ['Kelas', siswa.Kelas],
      [''], // Baris kosong
      ['Tanggal', 'Pelanggaran', 'Skor'] // Header tabel
    ];
    
    // Menambahkan data pelanggaran
    dataPelanggaran.forEach(item => {
      wsData.push([item.Timestamp, item.Pelanggaran, item.Skor]);
    });
    
    // Menambahkan total skor
    const totalSkor = dataPelanggaran.reduce((sum, item) => sum + (parseInt(item.Skor) || 0), 0);
    wsData.push(['', 'Total Skor', totalSkor]);
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Menentukan rentang tabel (mulai dari baris 5 - header tabel)
    const tabelStartRow = 5; // Header tabel (Tanggal, Pelanggaran, Skor)
    const tabelEndRow = tabelStartRow + dataPelanggaran.length + 1; // +1 untuk baris total
    
    // Definisi border
    const borderStyle = {
      style: "thin",
      color: { auto: 1 }
    };
    
    // Inisialisasi borders
    ws['!borders'] = {};
    
    // Tambahkan border untuk setiap sel dalam tabel
    for (let row = tabelStartRow; row <= tabelEndRow; row++) {
      for (let col = 0; col < 3; col++) {
        // Konversi kolom dan baris menjadi alamat sel (A6, B6, C6, dst)
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        
        ws['!borders'][cellRef] = {
          top: borderStyle,
          left: borderStyle,
          bottom: borderStyle,
          right: borderStyle
        };
      }
    }
    
    // Mengatur lebar kolom
    const colWidths = [{ wch: 20 }, { wch: 50 }, { wch: 10 }];
    ws['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Pelanggaran');
    
    // Generate dan download file Excel
    XLSX.writeFile(wb, `Pelanggaran_${siswa.Nama || siswa.Nisn}_${fileExtension}`);
  };
  
  // Fungsi untuk ekspor ke dokumen Word
  const handleExportDoc = () => {
    // Membuat judul dokumen
    const title = new Paragraph({
      text: "RIWAYAT PELANGGARAN",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    });
    
    // Membuat info siswa
    const namaSiswa = new Paragraph({
      children: [
        new TextRun({ text: "Nama: ", bold: true }),
        new TextRun(siswa.Nama)
      ]
    });
    
    const nisnSiswa = new Paragraph({
      children: [
        new TextRun({ text: "NISN: ", bold: true }),
        new TextRun(siswa.Nisn)
      ]
    });
    
    const kelasSiswa = new Paragraph({
      children: [
        new TextRun({ text: "Kelas: ", bold: true }),
        new TextRun(siswa.Kelas)
      ]
    });
    
    // Membuat spasi kosong
    const emptySpace = new Paragraph("");
    
    // Membuat tabel pelanggaran
    const rows = [
      // Header tabel
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: "Tanggal", bold: true })],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: "Pelanggaran", bold: true })],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ text: "Skor", bold: true, alignment: AlignmentType.CENTER })],
          }),
        ],
      }),
    ];
    
    // Menambahkan data pelanggaran ke tabel
    dataPelanggaran.forEach((item) => {
      rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph(item.Timestamp)],
            }),
            new TableCell({
              children: [new Paragraph(item.Pelanggaran)],
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: item.Skor.toString(),
                alignment: AlignmentType.CENTER
              })],
            }),
          ],
        })
      );
    });
    
    // Menambahkan total skor
    const totalSkor = dataPelanggaran.reduce(
      (sum, item) => sum + (parseInt(item.Skor) || 0),
      0
    );
    
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("")],
          }),
          new TableCell({
            children: [new Paragraph({ text: "Total Skor", bold: true, alignment: AlignmentType.RIGHT })],
          }),
          new TableCell({
            children: [new Paragraph({ 
              text: totalSkor.toString(), 
              bold: true, 
              alignment: AlignmentType.CENTER 
            })],
          }),
        ],
      })
    );
    
    const table = new Table({
      rows,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    });
    
    // Membuat dokumen
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            title,
            emptySpace,
            namaSiswa,
            nisnSiswa,
            kelasSiswa,
            emptySpace,
            table,
          ],
        },
      ],
    });
    
    // Simpan dokumen
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `Pelanggaran_${siswa.Nama || siswa.Nisn}.docx`);
    });
  };
  
  // Tombol kembali
  const handleBack = () => {
    navigate(-1); // Kembali ke halaman sebelumnya
  };
  
  return (
    <div className="siswa-detail-container">
      <button onClick={handleBack} className="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Kembali
      </button>

      <h2 className="page-title">Riwayat Pelanggaran Siswa</h2>

      <div className="siswa-info-card">
        <div className="siswa-info-item">
          <span className="siswa-info-label">Nama:</span>
          <span className="siswa-info-value">{siswa.Nama}</span>
        </div>
        <div className="siswa-info-item">
          <span className="siswa-info-label">NISN:</span>
          <span className="siswa-info-value">{siswa.Nisn}</span>
        </div>
        <div className="siswa-info-item">
          <span className="siswa-info-label">Kelas:</span>
          <span className="siswa-info-value">{siswa.Kelas}</span>
        </div>
      </div>

      {/* Tambahkan tombol aksi */}
      <div className="action-buttons">
        <button onClick={handlePrint} className="print-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Cetak
        </button>
        <button onClick={handleExportExcel} className="excel-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          Ekspor Excel
        </button>
        <button onClick={handleExportDoc} className="doc-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          Ekspor Word
        </button>
      </div>

      {loading ? (
        <p className="loading-message">Memuat data...</p>
      ) : dataPelanggaran.length === 0 ? (
        <p className="empty-message">Tidak ada data pelanggaran.</p>
      ) : (
        <div className="pelanggaran-table-container">
          <table className="pelanggaran-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pelanggaran</th>
                <th>Skor</th>
              </tr>
            </thead>
            <tbody>
              {dataPelanggaran.map(item => (
                <tr key={item.ID}>
                  <td>{item.Timestamp}</td>
                  <td>{item.Pelanggaran}</td>
                  <td className="skor-cell">{item.Skor}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2" className="total-label">Total Skor</td>
                <td className="total-score">
                  {dataPelanggaran.reduce((sum, item) => sum + (parseInt(item.Skor) || 0), 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

export default SiswaDetailPage;
