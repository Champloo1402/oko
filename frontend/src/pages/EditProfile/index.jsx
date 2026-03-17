import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateMyProfile, searchMovies, syncMovie } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { OkoSpinner } from '../../components/Logo';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '', displayName: '', bio: '', avatarUrl: '',
    favoriteFilm1Id: null, favoriteFilm2Id: null, favoriteFilm3Id: null,
    favoriteFilm4Id: null, favoriteFilm5Id: null,
  });
  const [favFilms,  setFavFilms]  = useState([null, null, null, null, null]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  // Film search picker state
  const [pickerIdx, setPickerIdx]     = useState(null);
  const [filmQuery, setFilmQuery]     = useState('');
  const [filmResults, setFilmResults] = useState([]);
  const [filmSearching, setFilmSearching] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.username).then(({ data }) => {
      setForm({
        username:    data.username,
        displayName: data.displayName ?? '',
        bio:         data.bio ?? '',
        avatarUrl:   data.avatarUrl ?? '',
        favoriteFilm1Id: data.favFilms?.[0]?.id ?? null,
        favoriteFilm2Id: data.favFilms?.[1]?.id ?? null,
        favoriteFilm3Id: data.favFilms?.[2]?.id ?? null,
        favoriteFilm4Id: data.favFilms?.[3]?.id ?? null,
        favoriteFilm5Id: data.favFilms?.[4]?.id ?? null,
      });
      setFavFilms([
        data.favFilms?.[0] ?? null,
        data.favFilms?.[1] ?? null,
        data.favFilms?.[2] ?? null,
        data.favFilms?.[3] ?? null,
        data.favFilms?.[4] ?? null,
      ]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateMyProfile(form);
      setSuccess('Profile updated!');
      setTimeout(() => navigate(`/users/${form.username}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Film search for fav picker
  const searchFilms = async () => {
    if (!filmQuery.trim()) return;
    setFilmSearching(true);
    try {
      const { data } = await searchMovies(filmQuery);
      const results = Array.isArray(data) ? data : data.content ?? [];
      console.log('SEARCH RESULT[0]:', JSON.stringify(results[0], null, 2));
      setFilmResults(results);
    } catch {}
    finally { setFilmSearching(false); }
  };

  const pickFilm = async (movie) => {
    // TMDB search returns `id` as the tmdb id — always sync to get local DB id
    const tmdbId = movie.id ?? movie.tmdbId;
    let posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null;
    let localId = null;

    try {
      const { data } = await syncMovie(tmdbId);
      localId   = data.id;
      posterUrl = data.posterUrl ?? posterUrl; // prefer synced full URL if available
    } catch {
      return; // don't pick if sync failed — we need a valid local id
    }

    const filmKey = `favoriteFilm${pickerIdx + 1}Id`;
    setForm((f) => ({ ...f, [filmKey]: localId }));
    setFavFilms((prev) => {
      const next = [...prev];
      next[pickerIdx] = { ...movie, id: localId, posterUrl };
      return next;
    });
    setPickerIdx(null);
    setFilmQuery('');
    setFilmResults([]);
  };

  if (loading) return <div className="flex justify-center py-24"><OkoSpinner size={48} /></div>;

  return (
      <div className="max-w-xl mx-auto px-6 py-10 animate-fade-in">
        <h1 className="text-xl font-bold text-oko-text mb-8">Edit profile</h1>

        <form onSubmit={handleSave} className="space-y-5">
          <Field label="Display name"  value={form.displayName} onChange={set('displayName')} />
          <Field label="Username"      value={form.username}    onChange={set('username')} />
          <Field label="Avatar URL"    value={form.avatarUrl}   onChange={set('avatarUrl')} placeholder="https://..." />
          <div>
            <label className="block text-xs text-oko-muted mb-1.5">Bio</label>
            <textarea
                value={form.bio}
                onChange={set('bio')}
                rows={3}
                placeholder="A few words about your taste…"
                className="w-full bg-oko-surface border border-oko-border rounded-md px-3 py-2 text-sm text-oko-text placeholder-oko-faint focus:outline-none focus:border-oko-red resize-none"
            />
          </div>

          {/* Favourite films */}
          <div>
            <label className="block text-xs text-oko-muted mb-3">Favourite films (up to 5)</label>
            <div className="flex gap-2">
              {favFilms.map((film, i) => (
                  <button
                      key={i}
                      type="button"
                      onClick={() => { setPickerIdx(i); setFilmResults([]); setFilmQuery(''); }}
                      className="flex-1 aspect-[2/3] rounded border border-oko-border hover:border-oko-red transition-colors overflow-hidden bg-oko-surface relative group"
                  >
                    {film?.posterUrl ? (
                        <img src={film.posterUrl} alt={film.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-oko-faint text-xl">+</div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Change</span>
                    </div>
                  </button>
              ))}
            </div>
          </div>

          {error   && <p className="text-oko-red text-xs">{error}</p>}
          {success && <p className="text-green-400 text-xs">{success}</p>}

          <button
              type="submit"
              disabled={saving}
              className="w-full bg-oko-red hover:bg-oko-red-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        {/* Film picker modal */}
        {pickerIdx !== null && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-oko-surface border border-oko-border rounded-xl shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-oko-border">
                  <h3 className="font-semibold text-sm text-oko-text">Pick favourite #{pickerIdx + 1}</h3>
                  <button onClick={() => setPickerIdx(null)} className="text-oko-subtle hover:text-oko-text text-xl">×</button>
                </div>
                <div className="p-5">
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-oko-subtle" />
                      <input
                          autoFocus
                          type="text"
                          value={filmQuery}
                          onChange={(e) => setFilmQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchFilms())}
                          placeholder="Search films…"
                          className="w-full bg-oko-bg border border-oko-border rounded-md pl-9 pr-3 py-2 text-sm text-oko-text placeholder-oko-faint focus:outline-none focus:border-oko-red"
                      />
                    </div>
                    <button onClick={searchFilms} disabled={filmSearching}
                            className="bg-oko-red text-white px-4 rounded-md text-sm font-medium hover:bg-oko-red-dark transition-colors">
                      Search
                    </button>
                  </div>
                  {filmSearching && <div className="flex justify-center py-6"><OkoSpinner size={36} /></div>}
                  <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {filmResults.map((m) => {
                      const poster = m.poster_path
                          ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                          : null;
                      return (
                          <button key={m.id} onClick={() => pickFilm(m)}
                                  title={m.title}
                                  className="group rounded overflow-hidden border border-oko-border hover:border-oko-red transition-colors">
                            <div className="aspect-[2/3] bg-oko-bg">
                              {poster
                                  ? <img src={poster} alt={m.title} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center text-oko-faint text-[9px] p-1 text-center">{m.title}</div>
                              }
                            </div>
                          </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
      <div>
        <label className="block text-xs text-oko-muted mb-1.5">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-oko-surface border border-oko-border rounded-md px-3 py-2 text-sm text-oko-text placeholder-oko-faint focus:outline-none focus:border-oko-red transition-colors"
        />
      </div>
  );
}