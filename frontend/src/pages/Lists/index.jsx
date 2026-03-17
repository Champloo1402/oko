import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getDiary, deleteDiaryEntry, getUserWatchlist, getList, deleteList } from '../../api';
import { StarDisplay } from '../../components/StarRating';
import { OkoSpinner } from '../../components/Logo';

// ─── Diary Page ───────────────────────────────────────────────────────────────
export function DiaryPage() {
  const { username } = useParams();
  const [entries, setEntries] = useState([]);
  const [page,    setPage]    = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = async (p = 0) => {
    setLoading(true);
    try {
      const { data } = await getDiary(username, p);
      const items = data.content ?? data;
      setEntries((prev) => p === 0 ? items : [...prev, ...items]);
      setHasMore(!(data.last ?? items.length < 20));
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(0); }, [username]); // eslint-disable-line

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this diary entry?')) return;
    try { await deleteDiaryEntry(id); setEntries((prev) => prev.filter((e) => e.id !== id)); }
    catch {}
  };

  const grouped = entries.reduce((acc, entry) => {
    const key = entry.watchedOn?.slice(0, 7) ?? 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-lg font-bold text-oko-text mb-8">
          <Link to={`/users/${username}`} className="text-oko-muted hover:text-oko-text transition-colors">{username}</Link>
          <span className="text-oko-faint mx-2">/</span>Diary
        </h1>

        {loading && <div className="flex justify-center py-16"><OkoSpinner size={48} /></div>}
        {!loading && entries.length === 0 && <p className="text-oko-subtle text-sm">No diary entries yet.</p>}

        {Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).map(([month, items]) => (
            <div key={month} className="mb-8">
              <h2 className="text-xs font-semibold text-oko-subtle tracking-widest uppercase mb-4">
                {new Date(month + '-01').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="space-y-2">
                {items.map((entry) => (
                    <div key={entry.id} className="flex gap-4 items-start py-3 border-b border-oko-surface group">
                      {entry.movie?.posterUrl && (
                          <Link to={`/movies/${entry.movie.id}`} className="flex-shrink-0">
                            <img src={entry.movie.posterUrl} alt={entry.movie.title}
                                 className="w-10 h-[60px] object-cover rounded border border-oko-border hover:border-oko-red transition-colors" />
                          </Link>
                      )}
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <Link to={`/movies/${entry.movie?.id}`}
                                  className="text-sm font-medium text-oko-text hover:text-oko-red transition-colors">
                              {entry.movie?.title}
                            </Link>
                            {entry.rewatch && (
                                <span className="text-[10px] text-oko-red border border-oko-red/30 rounded px-1.5 py-0.5">rewatch</span>
                            )}
                          </div>
                          <button onClick={() => handleDelete(entry.id)}
                                  className="text-[11px] text-oko-faint hover:text-oko-red opacity-0 group-hover:opacity-100 transition-all ml-4 flex-shrink-0">
                            Remove
                          </button>
                        </div>
                        {entry.rating && <StarDisplay rating={entry.rating} size="xs" />}
                        {entry.note && <p className="text-xs text-oko-muted mt-1 leading-relaxed">{entry.note}</p>}
                        <p className="text-[11px] text-oko-faint mt-1">{entry.watchedOn}</p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
        ))}

        {!loading && hasMore && (
            <button onClick={() => { const next = page + 1; setPage(next); load(next); }}
                    className="mt-4 w-full py-2.5 border border-oko-border rounded-md text-sm text-oko-muted hover:text-oko-text transition-colors">
              Load more
            </button>
        )}
      </div>
  );
}

// ─── Watchlist Page ───────────────────────────────────────────────────────────
export function WatchlistPage() {
  const { username } = useParams();
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserWatchlist(username)
        .then(({ data }) => setMovies((data.content ?? data).map((w) => w.movie).filter(Boolean)))
        .catch(() => {})
        .finally(() => setLoading(false));
  }, [username]);

  return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-lg font-bold text-oko-text mb-8">
          <Link to={`/users/${username}`} className="text-oko-muted hover:text-oko-text transition-colors">{username}</Link>
          <span className="text-oko-faint mx-2">/</span>Watchlist
        </h1>
        {loading ? (
            <div className="flex justify-center py-16"><OkoSpinner size={48} /></div>
        ) : movies.length === 0 ? (
            <p className="text-oko-subtle text-sm">Nothing on the watchlist yet.</p>
        ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {movies.map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>
        )}
      </div>
  );
}

// ─── List Detail Page ─────────────────────────────────────────────────────────
export function ListDetail() {
  const { listId }  = useParams();
  const navigate    = useNavigate();
  const [list,     setList]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(false);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  useEffect(() => {
    getList(listId)
        .then(({ data }) => setList(data))
        .catch(() => {})
        .finally(() => setLoading(false));
  }, [listId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this list permanently?')) return;
    setDeleting(true);
    try {
      await deleteList(listId);
      navigate(`/users/${list.username}`);
    } catch {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><OkoSpinner size={56} /></div>;
  if (!list)   return <div className="text-center py-24 text-oko-muted text-sm">List not found</div>;

  const isOwner = currentUser?.username === list.username;

  return (
      <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-oko-text">{list.name}</h1>
            {list.description && <p className="text-sm text-oko-muted mt-2 max-w-xl">{list.description}</p>}
            <p className="text-xs text-oko-subtle mt-2">
              by{' '}
              <Link to={`/users/${list.username}`} className="text-oko-muted hover:text-oko-red transition-colors">
                {list.username}
              </Link>
              {' · '}{list.movies?.length ?? 0} film{(list.movies?.length ?? 0) !== 1 ? 's' : ''}
              {!list.publicList && <span className="ml-2">· private</span>}
            </p>
          </div>
          {isOwner && (
              <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-shrink-0 text-xs text-oko-subtle hover:text-oko-red border border-oko-border hover:border-oko-red rounded-md px-3 py-1.5 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete list'}
              </button>
          )}
        </div>

        {list.movies?.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {list.movies.map((m) => (
                  <Link
                      key={m.id}
                      to={`/movies/${m.id}`}
                      className="group block rounded-md overflow-hidden border border-oko-border hover:border-oko-red transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="aspect-[2/3] bg-oko-surface overflow-hidden">
                      {m.posterUrl
                          ? <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          : <div className="w-full h-full flex items-center justify-center text-oko-faint text-xs text-center p-2">{m.title}</div>
                      }
                    </div>
                    <div className="bg-oko-surface px-2 py-1.5">
                      <p className="text-xs font-medium text-oko-text truncate">{m.title}</p>
                      <p className="text-[10px] text-oko-subtle">{m.releaseYear}</p>
                    </div>
                  </Link>
              ))}
            </div>
        ) : (
            <p className="text-sm text-oko-subtle">This list is empty.</p>
        )}
      </div>
  );
}