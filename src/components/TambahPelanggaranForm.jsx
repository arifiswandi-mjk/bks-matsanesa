import React from 'react';
import { convertToISODateTime, getLocalDateTimeNow } from '../utils/dateHelpers';
import '../styles/TambahPelanggaranForm.css';

function TambahPelanggaranForm({
  daftarKelas = [],
  daftarNama = [],
  jenisList = [],
  kelasDipilih = '',
  namaDipilih = '',
  jenisDipilih = '',
  tanggalDipilih = '',
  modeTanggal = 'otomatis',
  loadingTambah = false,
  setKelasDipilih,
  setNamaDipilih,
  setJenisDipilih,
  setTanggalDipilih,
  setModeTanggal,
  onTambah,
  modeEdit = false,
  dataEdit = null,
  onUpdate,
  onCancelEdit,
}) {
  const today = getLocalDateTimeNow();

  React.useEffect(() => {
    if (modeEdit && dataEdit) {
      setKelasDipilih(dataEdit.Kelas || '');
      setNamaDipilih(dataEdit['Nama Siswa'] || '');
      setJenisDipilih(dataEdit.Pelanggaran || '');

      const formatted = convertToISODateTime(dataEdit.Timestamp);
      setTanggalDipilih(formatted);
      setModeTanggal('manual');
    }
  }, [modeEdit, dataEdit]);

  return (
    <form className="tambah-pelanggaran-form">
      <div className="tanggal-group">
        <span className="label">Tanggal:</span>
        <label className="radio-label">
          <input
            type="radio"
            name="modeTanggal"
            value="otomatis"
            checked={modeTanggal === 'otomatis'}
            onChange={() => {
              setModeTanggal('otomatis');
              setTanggalDipilih(today);
            }}
            disabled={loadingTambah}
          />{' '}
          Otomatis (hari ini)
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="modeTanggal"
            value="manual"
            checked={modeTanggal === 'manual'}
            onChange={() => setModeTanggal('manual')}
            disabled={loadingTambah}
          />{' '}
          Manual
        </label>
      </div>
      <input
        type="datetime-local"
        value={modeTanggal === 'otomatis' ? today : tanggalDipilih}
        onChange={e => setTanggalDipilih(e.target.value)}
        className=""
        disabled={loadingTambah || modeTanggal === 'otomatis'}
        placeholder="Tanggal"
      />
      <div className="row-group">
        <div className="input-col">
          <span className="label">Kelas</span>
          <select
            value={kelasDipilih}
            onChange={e => setKelasDipilih(e.target.value)}
            className=""
            disabled={loadingTambah}
          >
            <option value="">-- Pilih Kelas --</option>
            {daftarKelas.map(k => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div className="input-col">
          <span className="label">Nama</span>
          <select
            value={namaDipilih}
            onChange={e => setNamaDipilih(e.target.value)}
            className=""
            disabled={loadingTambah}
          >
            <option value="">-- Pilih Nama --</option>
            {daftarNama.map((s, index) => (
              <option key={s.Nama} value={s.Nama}>
                {index + 1}. {s.Nama}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="input-col">
        <span className="label">Jenis Pelanggaran</span>
        <select
          value={jenisDipilih}
          onChange={e => setJenisDipilih(e.target.value)}
          className=""
          disabled={loadingTambah}
        >
          <option value="">-- Pilih Jenis --</option>
          {jenisList.map(j => (
            <option key={j.ID} value={j.Nama}>
              {j.ID}. {j.Nama}
            </option>
          ))}
        </select>
      </div>
      {modeEdit ? (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="button" onClick={onUpdate} disabled={loadingTambah} style={{ flex: 1 }}>
            {loadingTambah ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={loadingTambah}
            style={{ flex: 1, background: '#eee', color: '#333' }}
          >
            Batal
          </button>
        </div>
      ) : (
        <button type="button" onClick={onTambah} disabled={loadingTambah}>
          {loadingTambah ? 'Menyimpan...' : 'Tambah Pelanggaran'}
        </button>
      )}
    </form>
  );
}

export default TambahPelanggaranForm;
