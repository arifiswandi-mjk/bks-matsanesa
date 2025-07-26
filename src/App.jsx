// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
const Dashboard = lazy(() => import('./pages/Dashboard'));
// import Dashboard from "./pages/dashboard";
const Login = lazy(() => import('./pages/Login'));
const RekapPage = lazy(() => import('./pages/RekapPage'));
const JenisPage = lazy(() => import('./pages/JenisPage'));
const GrafikPage = lazy(() => import('./pages/GrafikPage'));
import SiswaDetailPage from './pages/SiswaDetailPage';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/rekap" element={<RekapPage />} />
        <Route path="/jenis" element={<JenisPage />} />
        <Route path="/grafik" element={<GrafikPage />} />
        <Route path="/siswa/:id" element={<SiswaDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
