import React from 'react';
import { Navigate } from 'react-router-dom';

// Route yang dilindungi berdasarkan role
function ProtectedRoute({ children, allowedRoles }) {
  const role = sessionStorage.getItem('role');
  const username = sessionStorage.getItem('username');
  const siswaNisn = sessionStorage.getItem('siswa_nisn');
  
  // Jika user belum login sama sekali
  if (!role && !username && !siswaNisn) {
    // Redirect ke halaman login yang sesuai
    if (allowedRoles.includes('siswa')) {
      return <Navigate to="/login-siswa" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  // Jika user login tapi tidak memiliki role yang diizinkan
  if (!allowedRoles.includes(role)) {
    // Siswa mencoba akses halaman admin
    if (role === 'siswa') {
      return <Navigate to="/siswa" replace />;
    }
    
    // Admin mencoba akses halaman siswa
    if (role === 'admin') {
      return <Navigate to="/" replace />;
    }
    
    // Fallback ke halaman login
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;