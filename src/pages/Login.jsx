import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const API = import.meta.env.VITE_API_URL;

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert('❗ Harap isi Username dan Password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API, {
        method: 'POST',
        body: JSON.stringify({
          action: 'login',
          data: { username: username.trim(), password: password.trim() },
        }),
      });

      const result = await response.json();
      if (result.success) {
        sessionStorage.setItem('username', result.username);
        sessionStorage.setItem('userID', result.userID);
        sessionStorage.setItem('name', result.name);
        navigate('/');
      } else {
        alert('❌ Username atau Password salah!');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-heading">Login Aplikasi</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="login-input"
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="login-input"
          disabled={loading}
        />

        <button onClick={handleLogin} className="login-button" disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </div>
    </div>
  );
}

// Semua style kini menggunakan CSS eksternal

export default Login;
