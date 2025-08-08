import React, { useState, useEffect } from 'react';
import '../styles/CustomDatePicker.css';

function CustomDatePicker({ value, onChange, disabled, className }) {
  const [displayValue, setDisplayValue] = useState('');
  
  // Format ISO ke format DD/MM/YYYY HH:MM saat value berubah
  useEffect(() => {
    if (!value) return setDisplayValue('');
    
    try {
      // Format ISO: YYYY-MM-DDThh:mm
      const [datePart, timePart] = value.split('T');
      if (!datePart) return setDisplayValue(value);
      
      const [year, month, day] = datePart.split('-');
      const timeDisplay = timePart ? timePart.substring(0, 5) : '00:00';
      
      setDisplayValue(`${day}/${month}/${year} ${timeDisplay}`);
    } catch (e) {
      console.error('Format error:', e);
      setDisplayValue(value);
    }
  }, [value]);
  
  // Handler untuk input manual
  const handleInputChange = (e) => {
    const input = e.target.value;
    setDisplayValue(input);
  };
  
  // Konversi input manual ke format ISO saat selesai mengetik
  const handleInputBlur = () => {
    try {
      // Pola regex untuk DD/MM/YYYY HH:MM atau DD/MM/YYYY
      const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?$/;
      const match = displayValue.match(regex);
      
      if (match) {
        const [, day, month, year, hours = '00', minutes = '00'] = match;
        
        // Validasi nilai tanggal
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        
        if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
          console.error('Invalid date values');
          resetToOriginalValue();
          return;
        }
        
        // Format dengan leading zeros
        const paddedDay = day.padStart(2, '0');
        const paddedMonth = month.padStart(2, '0');
        const paddedHours = hours.padStart(2, '0');
        const paddedMinutes = minutes.padStart(2, '0');
        
        // Buat string ISO
        const isoValue = `${year}-${paddedMonth}-${paddedDay}T${paddedHours}:${paddedMinutes}`;
        
        // Validasi tanggal yang valid
        const date = new Date(isoValue);
        if (isNaN(date.getTime())) {
          resetToOriginalValue();
          return;
        }
        
        // Kirim nilai ISO ke parent
        onChange({ target: { value: isoValue } });
      } else {
        resetToOriginalValue();
      }
    } catch (e) {
      console.error('Parse error:', e);
      resetToOriginalValue();
    }
  };
  
  // Kembalikan ke nilai asli jika format tidak valid
  const resetToOriginalValue = () => {
    if (!value) {
      setDisplayValue('');
      return;
    }
    
    try {
      const [datePart, timePart] = value.split('T');
      const [year, month, day] = datePart.split('-');
      const timeDisplay = timePart ? timePart.substring(0, 5) : '00:00';
      
      setDisplayValue(`${day}/${month}/${year} ${timeDisplay}`);
    } catch {
      setDisplayValue('');
    }
  };
  
  // Tampilkan kalender saat ikon diklik
  const showDatePicker = () => {
    if (!disabled) {
      const nativeInput = document.getElementById('hidden-date-picker');
      if (nativeInput) nativeInput.showPicker();
    }
  };

  return (
    <div className="custom-date-picker">
      {/* Input yang terlihat untuk format DD/MM/YYYY */}
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className={`date-display ${className || ''}`}
        disabled={disabled}
        placeholder="DD/MM/YYYY HH:MM"
      />
      
      {/* Ikon kalender yang dapat diklik */}
      {!disabled && (
        <button 
          type="button"
          className="calendar-button"
          onClick={showDatePicker}
          tabIndex="-1"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 0v1H0v14h16V1h-4V0h-2v1H6V0H4zm0 3h2v1h4V3h2v1h2v2H2V4h2V3zm-2 5h12v5H2V8z"/>
          </svg>
        </button>
      )}
      
      {/* Input datetime-local tersembunyi untuk kalender native */}
      <input
        id="hidden-date-picker"
        type="datetime-local"
        value={value}
        onChange={onChange}
        className="hidden-date-input"
        disabled={disabled}
      />
    </div>
  );
}

export default CustomDatePicker;