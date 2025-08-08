// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
const Dashboard = lazy(() => import('./pages/Dashboard'));
// import Dashboard from "./pages/dashboard";
const Login = lazy(() => import('./pages/Login'));
const RekapPage = lazy(() => import('./pages/RekapPage'));
const JenisPage = lazy(() => import('./pages/JenisPage'));
const GrafikPage = lazy(() => import('./pages/GrafikPage'));
import SiswaDetailPage from './pages/SiswaDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import LoginSiswaPage from './pages/LoginSiswaPage';
import SiswaPage from './pages/SiswaPage';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div className="loading-screen">⏳ Memuat...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/login-siswa" element={<LoginSiswaPage />} />
          
          {/* Admin routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/rekap" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RekapPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/jenis" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <JenisPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/grafik" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <GrafikPage />
              </ProtectedRoute>
            } 
          /> <Route 
            path="/siswa/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SiswaDetailPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Student routes */}
          <Route 
            path="/siswa" 
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <SiswaPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/login-siswa" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
