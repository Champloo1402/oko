import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminGetUsers, adminDeleteUser, adminPromoteUser,
  adminGetMovies, adminDeleteMovie,
} from '../../api';
import { useAuth } from '../../context/AuthContext';
import { OkoSpinner } from '../../components/Logo';

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate    = useNavigate();
  const [tab,     setTab]    = useState('users');
  const [users,   setUsers]  = useState([]);
  const [movies,  setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/home'); return; }
    loadData();
  }, []); // eslint-disable-line

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, mRes] = await Promise.all([adminGetUsers(), adminGetMovies()]);
      setUsers(uRes.data ?? []);
      setMovies(mRes.data ?? []);
    } catch {}
    finally { setLoading(false); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await adminDeleteUser(id); setUsers((u) => u.filter((x) => x.id !== id)); } catch {}
  };

  const promoteUser = async (id) => {
    try {
      await adminPromoteUser(id);
      setUsers((u) => u.map((x) => x.id === id ? { ...x, role: 'ADMIN' } : x));
    } catch {}
  };

  const deleteMovie = async (id) => {
    if (!window.confirm('Delete this movie?')) return;
    try { await adminDeleteMovie(id); setMovies((m) => m.filter((x) => x.id !== id)); } catch {}
  };

  if (loading) return <div className="flex justify-center py-24"><OkoSpinner size={56} /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-xs font-semibold bg-oko-red text-white px-2 py-0.5 rounded uppercase tracking-wide">Admin</span>
        <h1 className="text-xl font-bold text-oko-text">Control panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-oko-border mb-6">
        {['users', 'movies'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t ? 'border-oko-red text-oko-text' : 'border-transparent text-oko-subtle hover:text-oko-muted'
            }`}>
            {t} <span className="text-oko-faint text-xs ml-1">({t === 'users' ? users.length : movies.length})</span>
          </button>
        ))}
      </div>

      {/* Users table */}
      {tab === 'users' && (
        <div className="rounded-lg border border-oko-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-oko-surface text-oko-subtle text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-oko-surface">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-oko-surface/50 transition-colors">
                  <td className="px-4 py-3 text-oko-faint text-xs">{u.id}</td>
                  <td className="px-4 py-3 text-oko-text font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-oko-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      u.role === 'ADMIN' ? 'bg-oko-red/10 text-oko-red' : 'bg-oko-surface text-oko-subtle'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {u.role !== 'ADMIN' && (
                        <button onClick={() => promoteUser(u.id)}
                          className="text-xs text-oko-muted hover:text-oko-text transition-colors">
                          Promote
                        </button>
                      )}
                      <button onClick={() => deleteUser(u.id)}
                        className="text-xs text-oko-muted hover:text-oko-red transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Movies table */}
      {tab === 'movies' && (
        <div className="rounded-lg border border-oko-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-oko-surface text-oko-subtle text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Poster</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-oko-surface">
              {movies.map((m) => (
                <tr key={m.id} className="hover:bg-oko-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    {m.posterUrl
                      ? <img src={m.posterUrl} alt={m.title} className="w-8 h-12 object-cover rounded border border-oko-border" />
                      : <div className="w-8 h-12 bg-oko-surface rounded border border-oko-border" />
                    }
                  </td>
                  <td className="px-4 py-3 text-oko-text font-medium">{m.title}</td>
                  <td className="px-4 py-3 text-oko-muted">{m.releaseYear}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteMovie(m.id)}
                      className="text-xs text-oko-muted hover:text-oko-red transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
