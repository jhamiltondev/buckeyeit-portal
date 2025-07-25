import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = ({ title = "Buckeye IT Client Portal" }) => {
  const { login, isAuthenticated } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Login page path:', location.pathname);
    if (isAuthenticated) {
      if (location.pathname.includes('adminpanel/login')) {
        navigate('/adminpanel', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    console.log('Login result:', result);
    console.log('Login page path (handleSubmit):', location.pathname);
    if (result.success) {
      document.getElementById('login-root').classList.add('fade-out');
      setTimeout(() => {
        let navTarget = '/dashboard';
        if (location.pathname.includes('adminpanel/login')) {
          navTarget = '/adminpanel';
        }
        console.log('Navigating to:', navTarget);
        navigate(navTarget, { replace: true });
      }, 300);
    } else {
      setError(result.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div id="login-root" className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-red-300 transition-opacity duration-500 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      <div className="bg-white rounded-2xl shadow-2xl flex w-full max-w-4xl overflow-hidden">
        {/* Left: Branding */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-red-600 to-red-400 text-white p-10 w-1/2">
          <img src="/static/portal/react/buckeyeit-logo-white.png" alt="Buckeye IT Logo" className="w-24 h-24 mb-6 drop-shadow-lg" />
          <h1 className="text-3xl font-bold mb-2 text-center">{title}</h1>
          <p className="text-center text-lg opacity-90">Welcome! Please sign in to access your client dashboard.</p>
        </div>
        {/* Right: Login Form */}
        <div className="flex flex-col justify-center p-8 md:p-12 w-full md:w-1/2">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Sign in</h2>
          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          {loading && <div className="mb-4 text-blue-500 text-center animate-pulse">Signing in…</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z" /></svg>
              </span>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="User Name" className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-400" required />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 8a7 7 0 1114 0H3z" /></svg>
              </span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-400" required />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <button type="button" className="text-red-500 hover:underline">Forgot Password?</button>
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition">Sign in</button>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-2 text-gray-400">or</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
          <button className="w-full flex items-center justify-center border border-gray-300 py-2 rounded font-semibold hover:bg-gray-50 transition">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="w-5 h-5 mr-2" />
            Sign in with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 