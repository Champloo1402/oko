import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { OkoLogo, OkoSpinner } from '../Logo';
import { useAuth } from '../../context/AuthContext';
import { authLogin, authRegister } from '../../api';

export default function Navbar() {
  const { user, logout, login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query,      setQuery]      = useState('');
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [showAuth,   setShowAuth]   = useState(false);
  const [authTab,    setAuthTab]    = useState('login');
  const [authForm,   setAuthForm]   = useState({ usernameOrEmail: '', password: '', username: '', email: '', displayName: '' });
  const [authError,  setAuthError]  = useState('');
  const [authLoading,setAuthLoading]= useState(false);

  const openAuth = (tab = 'login') => {
    setAuthTab(tab);
    setAuthError('');
    setAuthForm({ usernameOrEmail: '', password: '', username: '', email: '', displayName: '' });
    setShowAuth(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/search?q=${encodeURIComponent(query.trim())}`); setQuery(''); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError('');
    try {
      const { data } = await authLogin({ usernameOrEmail: authForm.usernameOrEmail, password: authForm.password });
      login(data); setShowAuth(false); navigate('/home');
    } catch (err) { setAuthError(err.response?.data?.message ?? 'Invalid credentials'); }
    finally { setAuthLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError('');
    try {
      const { data } = await authRegister({ username: authForm.username, email: authForm.email, password: authForm.password, displayName: authForm.displayName });
      login(data); setShowAuth(false); navigate('/home');
    } catch (err) { setAuthError(err.response?.data?.message ?? 'Registration failed'); }
    finally { setAuthLoading(false); }
  };

  const setField = (k) => (e) => setAuthForm((f) => ({ ...f, [k]: e.target.value }));
  const isActive = (path) => location.pathname === path;

  const inputCls = "w-full bg-oko-bg border border-oko-border rounded-md px-3 py-2 text-sm text-oko-text placeholder-oko-faint focus:outline-none focus:border-oko-red";

  return (
      <>
        <nav className="sticky top-0 z-50 bg-[#0d1117] border-b border-oko-border">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
            <Link to={user ? '/home' : '/'} className="flex-shrink-0">
              <OkoLogo size="md" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/search"  active={isActive('/search')}>Films</NavLink>
              <NavLink to="/members" active={isActive('/members')}>Members</NavLink>
              {user && <NavLink to={`/users/${user.username}`} active={location.pathname.startsWith('/users')}>Profile</NavLink>}
              {isAdmin && <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>}
            </div>
            <form onSubmit={handleSearch} className="flex-1 max-w-xs ml-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-oko-subtle pointer-events-none" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search films..."
                       className="w-full bg-oko-surface border border-oko-border rounded-md pl-9 pr-3 py-1.5 text-sm text-oko-text placeholder-oko-subtle focus:outline-none focus:border-oko-red transition-colors" />
              </div>
            </form>
            {user ? (
                <div className="relative">
                  <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 text-sm text-oko-muted hover:text-oko-text transition-colors">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username}
                             className="w-7 h-7 rounded-full object-cover border border-oko-border"
                             style={{ width: '1.75rem', height: '1.75rem' }} />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-oko-red-dark flex items-center justify-center text-white text-xs font-semibold uppercase">{user.username[0]}</div>
                    )}
                    <span className="hidden sm:inline">{user.username}</span>
                  </button>
                  {menuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-44 bg-oko-surface border border-oko-border rounded-lg shadow-lg py-1 z-50">
                        <Link to={`/users/${user.username}`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-oko-muted hover:text-oko-text hover:bg-white/5 transition-colors">Profile</Link>
                        <Link to={`/users/${user.username}/diary`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-oko-muted hover:text-oko-text hover:bg-white/5 transition-colors">Diary</Link>
                        <Link to={`/users/${user.username}/watchlist`} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-oko-muted hover:text-oko-text hover:bg-white/5 transition-colors">Watchlist</Link>
                        <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-oko-muted hover:text-oko-text hover:bg-white/5 transition-colors">Settings</Link>
                        <div className="border-t border-oko-border my-1" />
                        <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="w-full text-left px-4 py-2 text-sm text-oko-muted hover:text-oko-red hover:bg-white/5 transition-colors">Sign out</button>
                      </div>
                  )}
                </div>
            ) : (
                <button onClick={() => openAuth('login')} className="text-sm font-semibold bg-oko-red hover:bg-oko-red-dark text-white px-4 py-1.5 rounded-md transition-colors flex-shrink-0">
                  Log in
                </button>
            )}
          </div>
        </nav>

        {showAuth && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowAuth(false)}>
              <div className="w-full max-w-sm bg-oko-surface border border-oko-border rounded-xl shadow-2xl animate-slide-up">
                <div className="flex border-b border-oko-border">
                  {['login','register'].map((t) => (
                      <button key={t} onClick={() => { setAuthTab(t); setAuthError(''); }}
                              className={`flex-1 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${authTab === t ? 'border-oko-red text-oko-text' : 'border-transparent text-oko-subtle hover:text-oko-muted'}`}>
                        {t === 'login' ? 'Log in' : 'Create account'}
                      </button>
                  ))}
                  <button onClick={() => setShowAuth(false)} className="px-4 text-oko-subtle hover:text-oko-text text-xl leading-none">×</button>
                </div>
                <div className="px-6 py-5">
                  <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/oauth2/authorization/google`}
                     className="flex items-center justify-center gap-2.5 w-full bg-oko-bg hover:bg-white/5 text-oko-text border border-oko-border hover:border-oko-muted px-5 py-2.5 rounded-md text-sm font-medium transition-colors mb-4">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                    </svg>
                    Continue with Google
                  </a>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-oko-border" />
                    <span className="text-oko-faint text-xs">or</span>
                    <div className="flex-1 h-px bg-oko-border" />
                  </div>
                  {authTab === 'login' && (
                      <form onSubmit={handleLogin} className="space-y-3">
                        <input autoFocus type="text" placeholder="Username or email" value={authForm.usernameOrEmail} onChange={setField('usernameOrEmail')} required className={inputCls} />
                        <input type="password" placeholder="Password" value={authForm.password} onChange={setField('password')} required className={inputCls} />
                        {authError && <p className="text-oko-red text-xs">{authError}</p>}
                        <button type="submit" disabled={authLoading} className="w-full bg-oko-red hover:bg-oko-red-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                          {authLoading ? <><OkoSpinner size={16} /> Logging in…</> : 'Log in'}
                        </button>
                      </form>
                  )}
                  {authTab === 'register' && (
                      <form onSubmit={handleRegister} className="space-y-3">
                        <input autoFocus type="text" placeholder="Display name" value={authForm.displayName} onChange={setField('displayName')} required className={inputCls} />
                        <input type="text" placeholder="Username" value={authForm.username} onChange={setField('username')} required className={inputCls} />
                        <input type="email" placeholder="Email" value={authForm.email} onChange={setField('email')} required className={inputCls} />
                        <input type="password" placeholder="Password" value={authForm.password} onChange={setField('password')} required className={inputCls} />
                        {authError && <p className="text-oko-red text-xs">{authError}</p>}
                        <button type="submit" disabled={authLoading} className="w-full bg-oko-red hover:bg-oko-red-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                          {authLoading ? <><OkoSpinner size={16} /> Creating account…</> : 'Create account'}
                        </button>
                      </form>
                  )}
                </div>
              </div>
            </div>
        )}
      </>
  );
}

function NavLink({ to, active, children }) {
  return (
      <Link to={to} className={`text-sm transition-colors ${active ? 'text-oko-text font-medium' : 'text-oko-muted hover:text-oko-text'}`}>
        {children}
      </Link>
  );
}