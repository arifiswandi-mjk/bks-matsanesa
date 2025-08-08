import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Login.css';
import logoSvg from '../assets/logo.svg';

const API = import.meta.env.VITE_API_URL;

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Reset error when inputs change
  useEffect(() => {
    setFormError('');
  }, [username, password]);

  // Check if user is already logged in
  useEffect(() => {
    const role = sessionStorage.getItem('role');
    const username = sessionStorage.getItem('username');
    
    if (role === 'admin' && username) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setFormError('Harap isi Username dan Password');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          data: { username: username.trim(), password: password.trim() },
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Simpan data login
        sessionStorage.setItem('username', result.username || username);
        sessionStorage.setItem('userID', result.userID || '0');
        sessionStorage.setItem('name', result.name || 'Admin');
        sessionStorage.setItem('role', 'admin');
        
        // Set success state untuk animasi
        setLoginSuccess(true);
        setLoading(false);
        
        // Redirect setelah animasi
        setTimeout(() => navigate('/'), 800);
      } else {
        setFormError(result.message || 'Username atau Password salah!');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="brand-section">
          <div className="logo">
            <img src={logoSvg} alt="Logo Sekolah" />
          </div>
          <h1>BKS Digital</h1>
          <h2>MTsN 1 Mojokerto</h2>
        </div>
        
        <div className="form-section">
          <form onSubmit={handleLogin} className={`login-card ${loginSuccess ? 'success' : ''}`}>
            <h2 className="login-heading">Login Admin</h2>
            
            {formError && (
              <div className="error-message">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"/>
                </svg>
                <span>{formError}</span>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="username">Username</label>
              <div className="input-with-icon">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z"/>
                </svg>
                <input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="login-input"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="login-input"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={toggleShowPassword}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm0 8a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-15C7 2 2.73 5.11 1 9.5 2.73 13.89 7 17 12 17s9.27-3.11 11-7.5C21.27 5.11 17 2 12 2z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                      <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? (
                <span className="loader-container">
                  <span className="loader"></span>
                  <span>Memproses...</span>
                </span>
              ) : 'Masuk'}
            </button>
            
            <div className="login-footer">
              <Link to="/login-siswa" className="student-link">Login sebagai Siswa</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
