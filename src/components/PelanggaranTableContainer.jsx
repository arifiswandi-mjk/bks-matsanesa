import React, { useState, useMemo } from 'react';
import PelanggaranTableView from './PelanggaranTableView';

// Komponen container - mengelola state dan logika
function PelanggaranTableContainer({ data, onSelectSiswa, onEdit }) {
  // State management
  const [filterKelas, setFilterKelas] = useState('');
  const [searchNama, setSearchNama] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');

  // Ambil daftar kelas unik
  const kelasList = useMemo(() => {
    const setKelas = new Set(data.map(d => d.Kelas).filter(Boolean));
    return Array.from(setKelas).sort();
  }, [data]);

  // Filter data berdasarkan kelas dan nama
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchKelas = filterKelas ? item.Kelas === filterKelas : true;
      const matchNama = searchNama
        ? (item['Nama Siswa'] || '').toLowerCase().includes(searchNama.toLowerCase())
        : true;
      return matchKelas && matchNama;
    });
  }, [data, filterKelas, searchNama]);

  // Fungsi untuk mengubah arah pengurutan
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  // Fungsi helper untuk parsing tanggal DD-MM-YYYY HH:MM:SS
  function parseDate(dateString) {
    if (!dateString) return new Date(0);
    
    const [datePart, timePart] = dateString.split(' ');
    if (!datePart) return new Date(0);
    
    const [day, month, year] = datePart.split('-');
    
    // Format menjadi YYYY-MM-DDThh:mm:ss yang dipahami JavaScript
    return new Date(`${year}-${month}-${day}T${timePart || '00:00:00'}`);
  }

  // Format tanggal untuk tampilan
  function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const [datePart, timePart] = dateString.split(' ');
      if (!datePart) return dateString;
      
      const [day, month, year] = datePart.split('-');
      const date = new Date(`${year}-${month}-${day}T${timePart || '00:00:00'}`);
      
      if (isNaN(date)) return dateString;
      
      return date.toLocaleDateString('id-ID', { 
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  // Pengurutan data dengan parsing tanggal yang tepat
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const dateA = parseDate(a.Timestamp);
      const dateB = parseDate(b.Timestamp);
      
      return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
    }).map(item => ({
      ...item,
      formattedDate: formatDate(item.Timestamp)
    }));
  }, [filteredData, sortDirection]);

  // Meneruskan semua data dan handler ke komponen view
  return (
    <PelanggaranTableView
      sortedData={sortedData}
      kelasList={kelasList}
      filterKelas={filterKelas}
      searchNama={searchNama}
      sortDirection={sortDirection}
      onFilterChange={setFilterKelas}
      onSearchChange={setSearchNama}
      onSortToggle={toggleSortDirection}
      onSelectSiswa={onSelectSiswa}
      onEdit={onEdit}
    />
  );
}

export default PelanggaranTableContainer;