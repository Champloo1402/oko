import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getUserProfile, getUserStats, getUserReviews,
  getDiary, getUserWatchlist, getUserLists,
  followUser, unfollowUser, getFollowers, getFollowing,
  searchMovies, syncMovie, updateMyProfile,
} from '../../api';
import { useAuth } from '../../context/AuthContext';
import { StarDisplay } from '../../components/StarRating';
import MovieCard from '../../components/MovieCard';
import ReviewCard from '../../components/ReviewCard';
import { OkoSpinner } from '../../components/Logo';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TABS = ['Reviews', 'Diary', 'Watchlist', 'Lists'];

export default function UserProfile() {
  const { username } = useParams();
  const { user: me } = useAuth();

  const [profile,   setProfile]   = useState(null);
  const [stats,     setStats]     = useState(null);
  const [tab,       setTab]       = useState('Reviews');
  const [tabData,   setTabData]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const isSelf = me?.username === username;

  // Fav film picker (owner only)
  const [favFilms,      setFavFilms]      = useState([null, null, null, null, null]);
  const [pickerIdx,     setPickerIdx]     = useState(null);
  const [filmQuery,     setFilmQuery]     = useState('');
  const [filmResults,   setFilmResults]   = useState([]);
  const [filmSearching, setFilmSearching] = useState(false);
  const [filmSyncing,   setFilmSyncing]   = useState(false);

  // Followers / following modal
  const [socialModal,     setSocialModal]     = useState(null); // 'followers' | 'following' | null
  const [socialUsers,     setSocialUsers]     = useState({ followers: null, following: null });
  const [socialLoading,   setSocialLoading]   = useState(false);
  const [socialFollowing, setSocialFollowing] = useState({}); // { [username]: bool }
  const [socialPending,   setSocialPending]   = useState({}); // { [username]: bool }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, sRes] = await Promise.all([getUserProfile(username), getUserStats(username)]);
        setProfile(pRes.data);
        setStats(sRes.data);
        setFollowing(pRes.data.isFollowedByCurrentUser);
        // Populate fav films — always 5 slots, null for missing
        const fav = pRes.data.favFilms ?? [];
        setFavFilms([
          fav[0] ?? null, fav[1] ?? null, fav[2] ?? null,
          fav[3] ?? null, fav[4] ?? null,
        ]);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      setTabLoading(true);
      try {
        let data = [];
        if (tab === 'Reviews')   { const r = await getUserReviews(username);   data = r.data.content ?? r.data; }
        if (tab === 'Diary')     { const r = await getDiary(username);         data = r.data.content ?? r.data; }
        if (tab === 'Watchlist') { const r = await getUserWatchlist(username); data = r.data.content ?? r.data; }
        if (tab === 'Lists')     { const r = await getUserLists(username);     data = r.data; }
        setTabData(data);
      } catch { setTabData([]); }
      finally { setTabLoading(false); }
    };
    load();
  }, [tab, username, profile]); // eslint-disable-line

  const toggleFollow = async () => {
    try {
      if (following) await unfollowUser(username);
      else           await followUser(username);
      setFollowing((v) => !v);
      setProfile((p) => ({
        ...p,
        followerCount: p.followerCount + (following ? -1 : 1),
      }));
    } catch {}
  };

  // Fav film picker handlers (owner only)
  const openPicker = (i) => {
    setPickerIdx(i);
    setFilmQuery('');
    setFilmResults([]);
  };

  const searchFilms = async () => {
    if (!filmQuery.trim()) return;
    setFilmSearching(true);
    try {
      const { data } = await searchMovies(filmQuery);
      setFilmResults(Array.isArray(data) ? data : data.content ?? []);
    } catch {}
    finally { setFilmSearching(false); }
  };

  const pickFilm = async (movie) => {
    const tmdbId = movie.id ?? movie.tmdbId;
    setFilmSyncing(true);
    try {
      const { data: synced } = await syncMovie(tmdbId);
      const poster = synced.posterUrl
          ?? (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null);

      const next = [...favFilms];
      next[pickerIdx] = { ...synced, posterUrl: poster };
      setFavFilms(next);

      // Persist to backend
      await updateMyProfile({
        favoriteFilm1Id: next[0]?.id ?? null,
        favoriteFilm2Id: next[1]?.id ?? null,
        favoriteFilm3Id: next[2]?.id ?? null,
        favoriteFilm4Id: next[3]?.id ?? null,
        favoriteFilm5Id: next[4]?.id ?? null,
      });

      setPickerIdx(null);
    } catch {}
    finally { setFilmSyncing(false); }
  };

  const removeFilm = async (i) => {
    const next = [...favFilms];
    next[i] = null;
    setFavFilms(next);
    setPickerIdx(null);
    try {
      await updateMyProfile({
        favoriteFilm1Id: next[0]?.id ?? null,
        favoriteFilm2Id: next[1]?.id ?? null,
        favoriteFilm3Id: next[2]?.id ?? null,
        favoriteFilm4Id: next[3]?.id ?? null,
        favoriteFilm5Id: next[4]?.id ?? null,
      });
    } catch {}
  };

  // Open social modal and lazy-load the list for that tab
  const openSocialModal = async (tab) => {
    setSocialModal(tab);
    if (socialUsers[tab] !== null) return; // already loaded
    setSocialLoading(true);
    try {
      const { data } = tab === 'followers'
          ? await getFollowers(username)
          : await getFollowing(username);
      const list = Array.isArray(data) ? data : [];
      setSocialUsers((prev) => ({ ...prev, [tab]: list }));
      // Seed follow state from the list (following list = all are followed by me)
      if (tab === 'following') {
        const seeds = {};
        list.forEach((u) => { seeds[u.username] = true; });
        setSocialFollowing((prev) => ({ ...prev, ...seeds }));
      }
    } catch {}
    finally { setSocialLoading(false); }
  };

  const switchSocialTab = async (tab) => {
    setSocialModal(tab);
    if (socialUsers[tab] !== null) return;
    setSocialLoading(true);
    try {
      const { data } = tab === 'followers'
          ? await getFollowers(username)
          : await getFollowing(username);
      const list = Array.isArray(data) ? data : [];
      setSocialUsers((prev) => ({ ...prev, [tab]: list }));
    } catch {}
    finally { setSocialLoading(false); }
  };

  const toggleSocialFollow = async (targetUsername) => {
    if (socialPending[targetUsername]) return;
    setSocialPending((p) => ({ ...p, [targetUsername]: true }));
    const isFollowing = socialFollowing[targetUsername];
    // Optimistic update
    setSocialFollowing((p) => ({ ...p, [targetUsername]: !isFollowing }));
    try {
      if (isFollowing) await unfollowUser(targetUsername);
      else             await followUser(targetUsername);
    } catch {
      // Revert on error
      setSocialFollowing((p) => ({ ...p, [targetUsername]: isFollowing }));
    } finally {
      setSocialPending((p) => ({ ...p, [targetUsername]: false }));
    }
  };

  if (loading) return <div className="flex justify-center py-24"><OkoSpinner size={56} /></div>;
  if (!profile) return <div className="text-center py-24 text-oko-muted text-sm">User not found</div>;

  // Destructure profile — don't shadow the favFilms state variable
  const { displayName, avatarUrl, bio, followerCount, followingCount } = profile;

  return (
      <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-6 mb-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-full object-cover border-2 border-oko-border" />
            ) : (
                <div className="w-20 h-20 rounded-full bg-oko-red-dark flex items-center justify-center text-white text-2xl font-bold uppercase border-2 border-oko-border">
                  {username[0]}
                </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-oko-text">{displayName || username}</h1>
                <p className="text-sm text-oko-subtle">@{username}</p>
              </div>
              {!isSelf && me && (
                  <button
                      onClick={toggleFollow}
                      className={`text-sm font-medium px-4 py-1.5 rounded-md border transition-colors ${
                          following
                              ? 'border-oko-border text-oko-muted hover:border-oko-red hover:text-oko-red'
                              : 'bg-oko-red border-oko-red text-white hover:bg-oko-red-dark'
                      }`}
                  >
                    {following ? 'Unfollow' : 'Follow'}
                  </button>
              )}
              {isSelf && (
                  <Link to="/settings" className="text-sm text-oko-muted border border-oko-border rounded-md px-4 py-1.5 hover:border-oko-muted hover:text-oko-text transition-colors">
                    Edit profile
                  </Link>
              )}
            </div>

            {bio && <p className="text-sm text-oko-muted mt-2 leading-relaxed">{bio}</p>}

            {/* Follower counts — clickable to open modal */}
            <div className="flex gap-4 mt-3 text-sm">
              <button
                  onClick={() => openSocialModal('followers')}
                  className="hover:text-oko-red transition-colors text-left"
              >
                <strong className="text-oko-text">{followerCount}</strong>{' '}
                <span className="text-oko-subtle">followers</span>
              </button>
              <button
                  onClick={() => openSocialModal('following')}
                  className="hover:text-oko-red transition-colors text-left"
              >
                <strong className="text-oko-text">{followingCount}</strong>{' '}
                <span className="text-oko-subtle">following</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <StatCard label="Films watched" value={stats.totalFilmsWatched} />
              <StatCard label="Hours watched" value={stats.totalHoursWatched} />
              <StatCard label="Reviews"       value={stats.totalReviews} />
              <StatCard label="Fave genre"    value={stats.mostWatchedGenre ?? '—'} small />
            </div>
        )}

        {/* ── Favourite films — always show 5 slots ───────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xs font-semibold text-oko-subtle tracking-widest uppercase">Favourite films</h2>
            {isSelf && <span className="text-[10px] text-oko-faint">Click any slot to change</span>}
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const f = favFilms[i];
              if (isSelf) {
                // Owner — all slots open the picker
                return (
                    <button
                        key={i}
                        type="button"
                        onClick={() => openPicker(i)}
                        className="group relative flex-1 aspect-[2/3] rounded-md overflow-hidden border border-oko-border hover:border-oko-red transition-colors bg-oko-surface"
                    >
                      {f?.posterUrl ? (
                          <img src={f.posterUrl} alt={f.title} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center text-oko-faint text-2xl">+</div>
                      )}
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        <span className="text-white text-xs font-medium">{f ? 'Change' : 'Add film'}</span>
                      </div>
                    </button>
                );
              }
              // Visitor — filled slots are MovieCards, empty are plain placeholders
              return f ? (
                  <div key={f.id ?? i} className="flex-1">
                    <MovieCard movie={f} />
                  </div>
              ) : (
                  <div key={`empty-${i}`} className="flex-1 aspect-[2/3] rounded-md border border-dashed border-oko-border bg-oko-surface/40" />
              );
            })}
          </div>
        </div>

        {/* ── Fav film picker modal (owner only) ──────────────────────────── */}
        {pickerIdx !== null && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-oko-surface border border-oko-border rounded-xl shadow-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-oko-border">
                  <h3 className="font-semibold text-sm text-oko-text">
                    {favFilms[pickerIdx] ? `Replace slot ${pickerIdx + 1}` : `Add favourite #${pickerIdx + 1}`}
                  </h3>
                  <button onClick={() => setPickerIdx(null)} className="text-oko-subtle hover:text-oko-text text-xl leading-none">×</button>
                </div>
                <div className="p-5">
                  {/* Search box */}
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-oko-subtle pointer-events-none" />
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
                    <button
                        onClick={searchFilms}
                        disabled={filmSearching}
                        className="bg-oko-red text-white px-4 rounded-md text-sm font-medium hover:bg-oko-red-dark transition-colors disabled:opacity-50"
                    >
                      Search
                    </button>
                  </div>

                  {/* Loading states */}
                  {filmSearching && <div className="flex justify-center py-6"><OkoSpinner size={32} /></div>}
                  {filmSyncing   && (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-oko-muted">
                        <OkoSpinner size={20} /> Adding film…
                      </div>
                  )}

                  {/* Results grid */}
                  {!filmSearching && !filmSyncing && filmResults.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                        {filmResults.map((m) => {
                          const poster = m.poster_path
                              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                              : null;
                          return (
                              <button
                                  key={m.id ?? m.tmdbId}
                                  onClick={() => pickFilm(m)}
                                  title={m.title}
                                  className="group rounded overflow-hidden border border-oko-border hover:border-oko-red transition-colors"
                              >
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
                  )}

                  {/* Remove option for filled slots */}
                  {favFilms[pickerIdx] && !filmSyncing && (
                      <button
                          onClick={() => removeFilm(pickerIdx)}
                          className="mt-4 w-full text-xs text-oko-subtle hover:text-oko-red border border-oko-border hover:border-oko-red rounded-md py-2 transition-colors"
                      >
                        Remove this film
                      </button>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="border-b border-oko-border mb-6">
          <div className="flex gap-0">
            {TABS.map((t) => (
                <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                        tab === t
                            ? 'border-oko-red text-oko-text'
                            : 'border-transparent text-oko-subtle hover:text-oko-muted'
                    }`}
                >
                  {t}
                </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ─────────────────────────────────────────────────── */}
        {tabLoading ? (
            <div className="flex justify-center py-12"><OkoSpinner size={40} /></div>
        ) : tabData.length === 0 ? (
            <p className="text-sm text-oko-subtle py-8">Nothing here yet.</p>
        ) : (
            <TabContent tab={tab} data={tabData} username={username} />
        )}

        {/* ── Followers / Following modal ──────────────────────────────────── */}
        {socialModal && (
            <div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={(e) => e.target === e.currentTarget && setSocialModal(null)}
            >
              <div className="w-full max-w-md bg-oko-surface border border-oko-border rounded-xl shadow-2xl flex flex-col max-h-[80vh]">

                {/* Header with tabs */}
                <div className="flex items-center justify-between px-5 pt-4 pb-0 flex-shrink-0">
                  <div className="flex gap-0 border-b border-oko-border w-full">
                    {['followers', 'following'].map((t) => (
                        <button
                            key={t}
                            onClick={() => switchSocialTab(t)}
                            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
                                socialModal === t
                                    ? 'border-oko-red text-oko-text'
                                    : 'border-transparent text-oko-subtle hover:text-oko-muted'
                            }`}
                        >
                          {t}
                        </button>
                    ))}
                    <button
                        onClick={() => setSocialModal(null)}
                        className="ml-auto pb-2.5 text-oko-subtle hover:text-oko-text text-xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* User list */}
                <div className="overflow-y-auto flex-1 px-4 py-3">
                  {socialLoading ? (
                      <div className="flex justify-center py-10"><OkoSpinner size={40} /></div>
                  ) : (socialUsers[socialModal] ?? []).length === 0 ? (
                      <p className="text-center text-sm text-oko-subtle py-10">
                        No {socialModal} yet.
                      </p>
                  ) : (
                      <div className="space-y-2">
                        {(socialUsers[socialModal] ?? []).map((u) => (
                            <SocialUserCard
                                key={u.id ?? u.username}
                                user={u}
                                isSelf={me?.username === u.username}
                                isLoggedIn={!!me}
                                isFollowing={socialFollowing[u.username] ?? false}
                                isPending={!!socialPending[u.username]}
                                onToggleFollow={() => toggleSocialFollow(u.username)}
                                onNavigate={() => setSocialModal(null)}
                            />
                        ))}
                      </div>
                  )}
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

function TabContent({ tab, data, username }) {
  if (tab === 'Reviews') return (
      <div className="space-y-3">
        {data.map((r) => <ReviewCard key={r.id} review={r} />)}
      </div>
  );

  if (tab === 'Diary') return (
      <div className="space-y-2">
        {data.map((entry) => (
            <div key={entry.id} className="flex gap-4 items-start py-3 border-b border-oko-surface">
              {entry.movie?.posterUrl && (
                  <Link to={`/movies/${entry.movie.id}`}>
                    <img src={entry.movie.posterUrl} alt={entry.movie.title}
                         className="w-10 h-[60px] object-cover rounded border border-oko-border" />
                  </Link>
              )}
              <div className="flex-1">
                <div className="flex items-baseline gap-3">
                  <Link to={`/movies/${entry.movie?.id}`} className="text-sm font-medium text-oko-text hover:text-oko-red transition-colors">
                    {entry.movie?.title}
                  </Link>
                  {entry.rewatch && (
                      <span className="text-[10px] text-oko-red border border-oko-red/30 rounded px-1.5 py-0.5">rewatch</span>
                  )}
                </div>
                {entry.rating && <StarDisplay rating={entry.rating} size="xs" />}
                {entry.note && <p className="text-xs text-oko-muted mt-1">{entry.note}</p>}
                <p className="text-[11px] text-oko-faint mt-1">{entry.watchedOn}</p>
              </div>
            </div>
        ))}
      </div>
  );

  if (tab === 'Watchlist') return (
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {data.map((w) => w.movie && <MovieCard key={w.movie.id} movie={w.movie} />)}
      </div>
  );

  if (tab === 'Lists') return (
      <div className="space-y-3">
        {data.map((list) => (
            <Link key={list.id} to={`/lists/${list.id}`}
                  className="block bg-oko-surface border border-oko-border rounded-lg px-4 py-3 hover:border-oko-red transition-colors">
              <p className="font-medium text-sm text-oko-text">{list.name}</p>
              <p className="text-xs text-oko-subtle mt-0.5">{list.description}</p>
              <p className="text-[11px] text-oko-faint mt-1">{list.movieCount ?? 0} films</p>
            </Link>
        ))}
      </div>
  );

  return null;
}

function StatCard({ label, value, small }) {
  return (
      <div className="bg-oko-surface border border-oko-border rounded-lg px-4 py-3">
        <p className={`font-bold text-oko-text ${small ? 'text-base' : 'text-xl'}`}>{value ?? '—'}</p>
        <p className="text-[11px] text-oko-subtle mt-0.5">{label}</p>
      </div>
  );
}

function SocialUserCard({ user, isSelf, isLoggedIn, isFollowing, isPending, onToggleFollow, onNavigate }) {
  const { username, displayName, avatarUrl } = user;
  return (
      <div className="flex items-center gap-3 py-2 px-1">
        {/* Avatar */}
        <Link to={`/users/${username}`} onClick={onNavigate} className="flex-shrink-0">
          {avatarUrl ? (
              <img
                  src={avatarUrl}
                  alt={displayName || username}
                  className="w-9 h-9 rounded-full object-cover border border-oko-border hover:border-oko-red transition-colors"
              />
          ) : (
              <div className="w-9 h-9 rounded-full bg-oko-red-dark flex items-center justify-center text-white text-sm font-bold uppercase">
                {(displayName || username)[0]}
              </div>
          )}
        </Link>

        {/* Name + username */}
        <Link
            to={`/users/${username}`}
            onClick={onNavigate}
            className="flex-1 min-w-0 group"
        >
          <p className="text-sm font-medium text-oko-text group-hover:text-oko-red transition-colors truncate">
            {displayName || username}
          </p>
          <p className="text-xs text-oko-subtle truncate">@{username}</p>
        </Link>

        {/* Follow / Unfollow — hidden for self */}
        {!isSelf && isLoggedIn && (
            <button
                onClick={onToggleFollow}
                disabled={isPending}
                className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors disabled:opacity-50 ${
                    isFollowing
                        ? 'border-oko-border text-oko-muted hover:border-oko-red hover:text-oko-red'
                        : 'bg-oko-red border-oko-red text-white hover:bg-oko-red-dark'
                }`}
            >
              {isPending ? '…' : isFollowing ? 'Unfollow' : 'Follow'}
            </button>
        )}
      </div>
  );
}