import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import '../styles/GrafikPage.css';

const API = import.meta.env.VITE_API_URL;

function GrafikPage() {
  const navigate = useNavigate();
  const [rekapData, setRekapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartClassRef = useRef(null);
  const chartViolatorsRef = useRef(null); // Ref baru untuk grafik jumlah pelanggar
  
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
      
      // Normalisasi data - gunakan field Total, bukan TotalSkor
      const normalizedData = data.map(item => ({
        ...item,
        TotalSkor: parseInt(item.Total || item.total || 0, 10)
      }));
      
      console.log('Data setelah normalisasi:', normalizedData);
      setRekapData(normalizedData);
    } catch (error) {
      console.error('Gagal memuat data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Ekstrak kelas unik
  const uniqueClasses = useMemo(() => {
    if (!rekapData.length) return [];
    return [...new Set(rekapData.map(item => item.Kelas))].sort();
  }, [rekapData]);

  // Kelompokkan data berdasarkan kelas
  const dataByClass = useMemo(() => {
    const result = {};
    uniqueClasses.forEach(kelas => {
      const classData = rekapData.filter(item => item.Kelas === kelas);
      const totalSkor = classData.reduce((sum, item) => sum + (item.TotalSkor || 0), 0);
      const siswaCount = classData.length;
      
      // Hitung jumlah pelanggar (siswa dengan skor > 0)
      const violatorCount = classData.filter(item => (item.TotalSkor || 0) > 0).length;
      
      result[kelas] = {
        kelas,
        totalSkor,
        siswaCount,
        violatorCount, // Tambahkan jumlah pelanggar
        avgSkor: siswaCount ? (totalSkor / siswaCount).toFixed(1) : 0,
        data: classData
      };
    });
    return result;
  }, [rekapData, uniqueClasses]);

  // D3 chart untuk siswa (chart yang sudah ada)
  useEffect(() => {
    if (loading || !rekapData.length || !chartRef.current) return;

    // Clear any existing chart
    d3.select(chartRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 30, right: 30, bottom: 90, left: 60 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(rekapData.map(d => d.Nama))
      .padding(0.2);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    // Y axis
    const maxValue = d3.max(rekapData, d => d.TotalSkor || d.Total || 0);
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding at the top
      .range([height, 0]);

    svg.append('g').call(d3.axisLeft(y));

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Grafik Total Skor Pelanggaran');

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '3px');

    // Add bars
    svg
      .selectAll('bars')
      .data(rekapData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.Nama))
      .attr('width', x.bandwidth())
      .attr('fill', '#4285F4')
      .attr('y', () => y(0))
      .attr('height', 0)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#3367d6');
        // Gunakan Total jika TotalSkor tidak ada
        const skorValue = d.TotalSkor || d.Total || 0;
        tooltip
          .style('opacity', 1)
          .html(`<strong>${d.Nama}</strong><br/>Kelas: ${d.Kelas}<br/>Total Skor: <b>${skorValue}</b>`);
        
        // Debug: log nilai untuk item yang dihover
        console.log('Item yang dihover:', d);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 30}px`);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('fill', '#4285F4');
        tooltip.style('opacity', 0);
      })
      .on('click', function(event, d) {
        navigate(`/siswa/${d.Nisn}`);
      })
      .transition()
      .duration(800)
      .attr('y', d => y(d.TotalSkor || 0))
      .attr('height', d => height - y(d.TotalSkor || 0));

    // Add Y axis label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Total Skor');

    // Add X axis label
    svg
      .append('text')
      .attr('y', height + margin.bottom - 10)
      .attr('x', width / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Nama Siswa');

    // Clean up on unmount
    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [rekapData, loading, navigate]);
  
  // D3 chart untuk kelas (grafik baru)
  useEffect(() => {
    if (loading || !rekapData.length || !chartClassRef.current || !uniqueClasses.length) return;

    // Clear any existing chart
    d3.select(chartClassRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = chartClassRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(chartClassRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Data preparation
    const chartData = uniqueClasses.map(kelas => ({
      kelas,
      totalSkor: dataByClass[kelas].totalSkor,
      siswaCount: dataByClass[kelas].siswaCount,
      avgSkor: dataByClass[kelas].avgSkor
    }));

    // X axis
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(chartData.map(d => d.kelas))
      .padding(0.2);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Y axis
    const maxValue = d3.max(chartData, d => d.totalSkor) || 0;
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([height, 0]);

    svg.append('g').call(d3.axisLeft(y));

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Total Skor Pelanggaran Per Kelas');

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip-class')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '3px');

    // Color scale untuk kelas
    const colorScale = d3.scaleOrdinal()
      .domain(uniqueClasses)
      .range(d3.schemeCategory10);

    // Bars
    svg
      .selectAll('class-bars')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.kelas))
      .attr('width', x.bandwidth())
      .attr('fill', d => colorScale(d.kelas))
      .attr('y', y(0))
      .attr('height', 0)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        tooltip
          .style('opacity', 1)
          .html(`<strong>Kelas: ${d.kelas}</strong><br/>Total Skor: <b>${d.totalSkor}</b><br/>Jumlah Siswa: ${d.siswaCount}<br/>Rata-rata: ${d.avgSkor}`);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 30}px`);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 1);
        tooltip.style('opacity', 0);
      })
      .transition()
      .duration(800)
      .attr('y', d => y(d.totalSkor))
      .attr('height', d => height - y(d.totalSkor));

    // Add Y axis label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Total Skor');

    // Add X axis label
    svg
      .append('text')
      .attr('y', height + 30)
      .attr('x', width / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Kelas');

    // Clean up
    return () => {
      d3.selectAll('.tooltip-class').remove();
    };
  }, [rekapData, loading, uniqueClasses, dataByClass]);

  // D3 chart untuk jumlah pelanggar per kelas (grafik baru)
  useEffect(() => {
    if (loading || !rekapData.length || !chartViolatorsRef.current || !uniqueClasses.length) return;

    // Clear any existing chart
    d3.select(chartViolatorsRef.current).selectAll('*').remove();

    // Set up dimensions
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = chartViolatorsRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(chartViolatorsRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Data preparation
    const chartData = uniqueClasses.map(kelas => ({
      kelas,
      pelanggarCount: dataByClass[kelas].siswaCount || 0
    }));

    // X axis
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(chartData.map(d => d.kelas))
      .padding(0.2);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Y axis
    const maxValue = d3.max(chartData, d => d.pelanggarCount) || 0;
    const y = d3
      .scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([height, 0]);

    svg.append('g').call(d3.axisLeft(y));

    // Title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Jumlah Pelanggar Per Kelas');

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip-violators')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '3px');

    // Color scale berbeda untuk membedakan dengan grafik sebelumnya
    const colorScale = d3.scaleOrdinal()
      .domain(uniqueClasses)
      .range(d3.schemeSet2); // Gunakan skema warna berbeda

    // Bars
    svg
      .selectAll('violator-bars')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.kelas))
      .attr('width', x.bandwidth())
      .attr('fill', d => colorScale(d.kelas))
      .attr('y', y(0))
      .attr('height', 0)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.8);
        tooltip
          .style('opacity', 1)
          .html(`<strong>Kelas: ${d.kelas}</strong><br/>Jumlah Pelanggar: <b>${d.pelanggarCount}</b>`);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 30}px`);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('opacity', 1);
        tooltip.style('opacity', 0);
      })
      .transition()
      .duration(800)
      .attr('y', d => y(d.pelanggarCount))
      .attr('height', d => height - y(d.pelanggarCount));

    // Add Y axis label
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Jumlah Siswa');

    // Add X axis label
    svg
      .append('text')
      .attr('y', height + 30)
      .attr('x', width / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Kelas');

    // Clean up
    return () => {
      d3.selectAll('.tooltip-violators').remove();
    };
  }, [rekapData, loading, uniqueClasses, dataByClass]);

  const handleBack = () => {
    console.log('Back button clicked'); // Tambahkan log untuk debugging
    
    // Gunakan approach alternatif untuk kembali
    try {
      navigate(-1);
    } catch (error) {
      console.error('Navigate error:', error);
      // Fallback ke rute dashboard jika navigate(-1) gagal
      navigate('/');
    }
  };

  return (
    <div className="grafik-container">
      <button onClick={handleBack} className="back-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Kembali
      </button>

      <h2 className="page-title">Grafik Pelanggaran Siswa</h2>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Memuat data...</p>
        </div>
      ) : rekapData.length === 0 ? (
        <div className="empty-data">Tidak ada data pelanggaran.</div>
      ) : (
        <>
          <h3 className="section-title">Jumlah Pelanggar Per Kelas</h3>
          <div className="chart-container" ref={chartViolatorsRef}></div>
          
          <h3 className="section-title">Total Skor Pelanggaran Per Kelas</h3>
          <div className="chart-container" ref={chartClassRef}></div>
          
          <h3 className="section-title">Skor Pelanggaran Per Siswa</h3>
          <div className="chart-container" ref={chartRef}></div>
        </>
      )}
    </div>
  );
}

export default GrafikPage;
