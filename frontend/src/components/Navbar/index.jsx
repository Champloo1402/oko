import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { OkoLogo, OkoIcon } from '../Logo';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
      <nav className="sticky top-0 z-50 bg-[#0d1117] border-b border-oko-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">

          {/* Logo */}
          <Link to={user ? '/home' : '/'} className="flex-shrink-0">
            <OkoLogo size="md" />
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/search"  active={isActive('/search')}>Films</NavLink>
            <NavLink to="/members" active={isActive('/members')}>Members</NavLink>
            {user && <NavLink to={`/users/${user.username}`} active={location.pathname.startsWith('/users')}>Profile</NavLink>}
            {isAdmin && <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs ml-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-oko-subtle pointer-events-none" />
              <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search films..."
                  className="w-full bg-oko-surface border border-oko-border rounded-md pl-9 pr-3 py-1.5 text-sm text-oko-text placeholder-oko-subtle focus:outline-none focus:border-oko-red transition-colors"
              />
            </div>
          </form>

          {/* Auth area */}
          {user ? (
              <div className="relative">
                <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 text-sm text-oko-muted hover:text-oko-text transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-oko-red-dark flex items-center justify-center text-white text-xs font-semibold uppercase">
                    {user.username[0]}
                  </div>
                  <span className="hidden sm:inline">{user.username}</span>
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-44 bg-oko-surface border border-oko-border rounded-lg shadow-lg py-1 z-50">
                      <Link to={`/users/${user.username}`} onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-oko-muted hover:text-oko-text hover:bg-white/5 transition-colors">
                        Profile
                      </Link>
                      <Link to={`/users/${user.username}/diary`} onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-oko-muted hover:text-oko-text hover:bg-white/5 transition-colors">
                        Diary
                      </Link>
                      <Link to={`/users/${user.username}/watchlist`} onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-oko-muted hover:text-oko-text hover:bg-white/5 transition-colors">
                        Watchlist
                      </Link>
                      <Link to="/settings" onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-oko-muted hover:text-oko-text hover:bg-white/5 transition-colors">
                        Settings
                      </Link>
                      <div className="border-t border-oko-border my-1" />
                      <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }}
                              className="w-full text-left px-4 py-2 text-sm text-oko-muted hover:text-oko-red hover:bg-white/5 transition-colors">
                        Sign out
                      </button>
                    </div>
                )}
              </div>
          ) : (
              <div className="flex items-center gap-2">
                <Link to="/" className="text-sm text-oko-muted hover:text-oko-text transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-oko-red hover:bg-oko-red-dark text-white px-3 py-1.5 rounded-md transition-colors">
                  Create account
                </Link>
              </div>
          )}
        </div>
      </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
      <Link
          to={to}
          className={`text-sm transition-colors ${active ? 'text-oko-text font-medium' : 'text-oko-muted hover:text-oko-text'}`}
      >
        {children}
      </Link>
  );
}