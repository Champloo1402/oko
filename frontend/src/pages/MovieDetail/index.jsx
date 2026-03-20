import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  getMovie, getMovieCast, getMovieReviews,
  likeMovie, unlikeMovie,
  markWatched, unmarkWatched, getWatchedStatus,
  addToWatchlist, removeFromWatchlist, getMyWatchlist,
  createDiaryEntry, createReview, deleteReview,
  getUserLists, addMovieToList, syncMovie,
} from '../../api';
import { StarDisplay, StarInput } from '../../components/StarRating';
import ReviewCard from '../../components/ReviewCard';
import { OkoSpinner } from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import {
  HeartIcon, EyeIcon, BookmarkIcon, PencilSquareIcon, CheckIcon, QueueListIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolid, EyeIcon as EyeSolid, BookmarkIcon as BookmarkSolid,
} from '@heroicons/react/24/solid';

export default function MovieDetail() {
  const { id }       = useParams();
  const location     = useLocation();
  const { user }     = useAuth();
  // tmdbId passed via navigation state so we can sync on 404
  const tmdbIdFromState = location.state?.tmdbId;

  const [movie,    setMovie]    = useState(null);
  const [cast,     setCast]     = useState([]);
  const [reviews,  setReviews]  = useState([]);
  const [revPage,  setRevPage]  = useState(0);
  const [revLast,  setRevLast]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  // User states
  const [liked,            setLiked]            = useState(false);
  const [watched,          setWatched]          = useState(false);
  const [likeCount,        setLikeCount]        = useState(0);
  const [inWatchlist,      setInWatchlist]      = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Add to list dropdown
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [userLists,        setUserLists]        = useState([]);
  const [listsLoading,     setListsLoading]     = useState(false);
  const [addingToList,     setAddingToList]     = useState(null); // listId currently being added
  const listDropdownRef = useRef(null);

  // Toast notification
  const [toast,     setToast]     = useState('');
  const [toastType, setToastType] = useState('ok');

  // Review modal
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating,   setReviewRating]   = useState(0);
  const [reviewContent,  setReviewContent]  = useState('');
  const [reviewSpoiler,  setReviewSpoiler]  = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Diary modal
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [diaryDate,     setDiaryDate]     = useState(new Date().toISOString().slice(0, 10));
  const [diaryRating,   setDiaryRating]   = useState(0);
  const [diaryNote,     setDiaryNote]     = useState('');
  const [diaryRewatch,  setDiaryRewatch]  = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      let localId = id;

      const tryLoad = async (lid) => {
        const [mRes, cRes] = await Promise.all([getMovie(lid), getMovieCast(lid)]);
        setMovie({ ...mRes.data, localId: lid });
        setLiked(mRes.data.likedByCurrentUser ?? mRes.data.followedByCurrentUser ?? false);
        setLikeCount(mRes.data.likeCount ?? 0);
        setCast(cRes.data ?? []);
        loadReviews(lid, 0);
        if (user) {
          const [wRes, wlRes] = await Promise.all([
            getWatchedStatus(lid),
            getMyWatchlist(0, 100),
          ]);
          setWatched(wRes.data);
          const wlItems = wlRes.data?.content ?? wlRes.data ?? [];
          setInWatchlist(wlItems.some((w) => (w.movie?.id ?? w.movieId) === Number(lid)));
        }
      };

      try {
        await tryLoad(localId);
      } catch (err) {
        console.error('MovieDetail first load failed:', err?.response?.status, err?.message, 'tmdbIdFromState:', tmdbIdFromState);
        // On 404, try syncing via tmdbId then retry
        if (err?.response?.status === 404 && tmdbIdFromState) {
          try {
            const { data: synced } = await syncMovie(tmdbIdFromState);
            localId = synced.id;
            await tryLoad(localId);
          } catch (err2) {
            console.error('MovieDetail retry after sync failed:', err2?.response?.status, err2?.message);
            setError('Could not load this film. Please try again.');
          }
        } else {
          setError('Could not load film. Make sure the backend is running.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]); // eslint-disable-line

  const loadReviews = async (movieId, page) => {
    try {
      const { data } = await getMovieReviews(movieId ?? id, page);
      const items = data.content ?? data;
      setReviews((prev) => page === 0 ? items : [...prev, ...items]);
      setRevLast(data.last ?? items.length < 20);
      setRevPage(page);
    } catch {}
  };

  // Toast helper — auto-dismisses after 2.5s
  const showToast = useCallback((msg, type = 'ok') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 2500);
  }, []);

  // Toggles — always use localId (the DB primary key, not tmdbId)
  const localId = movie?.localId ?? movie?.id;

  const toggleLike = async () => {
    try {
      if (liked) { await unlikeMovie(localId); setLikeCount((c) => c - 1); }
      else       { await likeMovie(localId);   setLikeCount((c) => c + 1); }
      setLiked((v) => !v);
    } catch {}
  };

  const toggleWatched = async () => {
    try {
      if (watched) await unmarkWatched(localId);
      else         await markWatched(localId);
      setWatched((v) => !v);
    } catch {}
  };

  // Watchlist toggle with loading state + toast
  const toggleWatchlist = async () => {
    if (watchlistLoading) return;
    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await removeFromWatchlist(localId);
        setInWatchlist(false);
        showToast('Removed from watchlist');
      } else {
        await addToWatchlist(localId);
        setInWatchlist(true);
        showToast('Added to watchlist');
      }
    } catch {
      showToast('Something went wrong', 'err');
    } finally {
      setWatchlistLoading(false);
    }
  };

  // Add to list — open dropdown and load user's lists on first open
  const openListDropdown = async () => {
    setShowListDropdown((v) => !v);
    if (userLists.length > 0) return; // already loaded
    setListsLoading(true);
    try {
      const { data } = await getUserLists(user.username);
      setUserLists(Array.isArray(data) ? data : []);
    } catch {}
    finally { setListsLoading(false); }
  };

  const handleAddToList = async (listId, listName) => {
    if (addingToList) return;
    setAddingToList(listId);
    try {
      await addMovieToList(listId, localId);
      showToast(`Added to "${listName}"`);
      setShowListDropdown(false);
    } catch {
      showToast('Could not add to list', 'err');
    } finally {
      setAddingToList(null);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!showListDropdown) return;
    const handler = (e) => {
      if (listDropdownRef.current && !listDropdownRef.current.contains(e.target)) {
        setShowListDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showListDropdown]);

  // Submit review
  const submitReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    try {
      const { data } = await createReview({
        movieId: localId,
        rating: reviewRating || null,
        content: reviewContent,
        isSpoiler: reviewSpoiler,
      });
      setReviews((prev) => [data, ...prev]);
      setShowReviewForm(false);
      setReviewContent('');
      setReviewRating(0);
    } catch {}
    finally { setReviewSubmitting(false); }
  };

  // Submit diary
  const submitDiary = async (e) => {
    e.preventDefault();
    try {
      await createDiaryEntry({
        movieId: localId,
        watchedOn: diaryDate,
        rating: diaryRating || null,
        rewatch: diaryRewatch,
        note: diaryNote,
      });
      setShowDiaryForm(false);
    } catch {}
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {}
  };

  if (loading) return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <OkoSpinner size={64} />
      </div>
  );

  if (error) return (
      <div className="text-center py-24 text-oko-red text-sm">{error}</div>
  );

  if (!movie) return null;

  const {
    title, releaseYear, runtimeMinutes, language, genres,
    overview, posterUrl, averageRating,
  } = movie;

  const backdropUrl = movie.backdropUrl?.replace('/w500/', '/w1280/');

  const runtime = runtimeMinutes
      ? `${Math.floor(runtimeMinutes / 60)}h ${runtimeMinutes % 60}m`
      : null;

  return (
      <div className="animate-fade-in relative">

        {/* ── Toast notification ──────────────────────────────────────────── */}
        {toast && (
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg text-sm font-medium shadow-xl transition-all animate-slide-up
          ${toastType === 'err'
                ? 'bg-red-900/90 border border-red-700 text-red-200'
                : 'bg-oko-surface border border-oko-border text-oko-text'}`}>
              {toastType === 'ok' && <CheckIcon className="w-4 h-4 inline mr-2 text-green-400" />}
              {toast}
            </div>
        )}

        {/* ── Backdrop ───────────────────────────────────────────────────── */}
        <div className="relative h-72 md:h-96 overflow-hidden">
          {backdropUrl ? (
              <>
                <img src={backdropUrl} alt={title} className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-oko-bg via-oko-bg/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-oko-bg/80 via-transparent to-oko-bg/50" />
              </>
          ) : (
              <div className="w-full h-full bg-oko-surface" />
          )}
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-6 -mt-28 relative z-10">

            {/* Poster */}
            <div className="flex-shrink-0 w-36 md:w-44">
              <div className="aspect-[2/3] rounded-lg overflow-hidden border-2 border-oko-border shadow-2xl">
                {posterUrl ? (
                    <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-oko-surface flex items-center justify-center text-oko-faint text-xs text-center p-2">
                      {title}
                    </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pt-28 md:pt-32">
              <h1 className="text-2xl md:text-3xl font-bold text-oko-text leading-tight">{title}</h1>

              {/* Directors — filtered from cast where roleType === 'DIRECTOR' */}
              {cast.filter((c) => c.roleType === 'DIRECTOR').length > 0 && (
                  <p className="text-sm text-oko-muted mt-1">
                    Directed by{' '}
                    {cast
                        .filter((c) => c.roleType === 'DIRECTOR')
                        .map((c, i, arr) => (
                            <span key={c.id}>
                      <Link
                          to={`/people/${c.person.id}`}
                          className="hover:text-oko-red transition-colors"
                      >
                        {c.person.name}
                      </Link>
                              {i < arr.length - 1 ? ', ' : ''}
                    </span>
                        ))}
                  </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-oko-muted">
                {releaseYear && <span>{releaseYear}</span>}
                {runtime      && <><span className="text-oko-faint">·</span><span>{runtime}</span></>}
                {language     && <><span className="text-oko-faint">·</span><span className="uppercase">{language}</span></>}
              </div>

              {genres?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {genres.map((g) => (
                        <span key={g.id ?? g.name} className="text-xs text-oko-muted border border-oko-border rounded-full px-2.5 py-0.5">
                    {g.name}
                  </span>
                    ))}
                  </div>
              )}

              {averageRating > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <StarDisplay rating={averageRating} size="sm" />
                    <span className="text-xs text-oko-subtle">{averageRating.toFixed(1)} avg</span>
                  </div>
              )}
            </div>
          </div>

          {/* ── Action bar ──────────────────────────────────────────────── */}
          {user && (
              <div className="flex flex-wrap gap-2 mt-6">
                <ActionBtn active={watched} onClick={toggleWatched}
                           icon={watched ? <EyeSolid className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                           label={watched ? 'Watched' : 'Mark watched'}
                           activeClass="bg-green-900/30 border-green-600 text-green-400"
                />
                <ActionBtn
                    onClick={toggleWatchlist}
                    disabled={watchlistLoading}
                    active={inWatchlist}
                    icon={watchlistLoading
                        ? <OkoSpinner size={16} />
                        : inWatchlist
                            ? <BookmarkSolid className="w-4 h-4" />
                            : <BookmarkIcon className="w-4 h-4" />}
                    label={watchlistLoading ? '…' : inWatchlist ? 'In watchlist' : 'Watchlist'}
                    activeClass="bg-teal-900/30 border-teal-600 text-teal-400"
                />
                <ActionBtn onClick={() => setShowDiaryForm(true)}
                           icon={<PencilSquareIcon className="w-4 h-4" />}
                           label="Add to diary"
                />
                <ActionBtn
                    onClick={() => setShowReviewForm(true)}
                    label="Write review"
                    primary
                />
                {/* Add to list — dropdown */}
                <div className="relative" ref={listDropdownRef}>
                  <ActionBtn
                      onClick={openListDropdown}
                      icon={<QueueListIcon className="w-4 h-4" />}
                      label="Add to list"
                      active={showListDropdown}
                      activeClass="bg-white/5 border-oko-muted text-oko-text"
                  />
                  {showListDropdown && (
                      <div className="absolute left-0 top-full mt-1 w-56 bg-oko-surface border border-oko-border rounded-lg shadow-xl z-30 py-1 animate-fade-in">
                        {listsLoading ? (
                            <div className="flex justify-center py-4"><OkoSpinner size={24} /></div>
                        ) : userLists.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-oko-subtle">
                              No lists yet.{' '}
                              <Link to={`/users/${user.username}`} className="text-oko-red hover:underline" onClick={() => setShowListDropdown(false)}>
                                Create one →
                              </Link>
                            </div>
                        ) : (
                            userLists.map((list) => (
                                <button
                                    key={list.id}
                                    onClick={() => handleAddToList(list.id, list.name)}
                                    disabled={addingToList === list.id}
                                    className="w-full text-left px-4 py-2.5 text-sm text-oko-muted hover:text-oko-text hover:bg-white/5 transition-colors flex items-center justify-between gap-2 disabled:opacity-50"
                                >
                                  <span className="truncate">{list.name}</span>
                                  {addingToList === list.id
                                      ? <OkoSpinner size={14} />
                                      : <span className="text-[10px] text-oko-faint flex-shrink-0">{list.movies?.length ?? list.movieCount ?? 0} films</span>
                                  }
                                </button>
                            ))
                        )}
                      </div>
                  )}
                </div>
                <ActionBtn active={liked} onClick={toggleLike}
                           icon={liked ? <HeartSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                           label={`${likeCount}`}
                           activeClass="bg-oko-red/10 border-oko-red text-oko-red"
                />
              </div>
          )}

          {/* ── Overview ────────────────────────────────────────────────── */}
          {overview && (
              <p className="mt-6 text-sm text-oko-muted leading-relaxed max-w-2xl">{overview}</p>
          )}

          {/* ── Cast ────────────────────────────────────────────────────── */}
          {cast.length > 0 && (
              <section className="mt-10">
                <SectionTitle>Cast &amp; Crew</SectionTitle>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {cast.slice(0, 12).map((c) => (
                      <Link
                          key={c.id}
                          to={`/people/${c.person.id}`}
                          className="flex-shrink-0 w-20 group"
                      >
                        <div className="aspect-[2/3] rounded-md bg-oko-surface border border-oko-border group-hover:border-oko-red overflow-hidden mb-1.5 transition-colors">
                          {c.person.photoUrl ? (
                              <img
                                  src={c.person.photoUrl}
                                  alt={c.person.name}
                                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                              />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-oko-faint text-lg">◉</div>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-oko-text group-hover:text-oko-red leading-tight truncate transition-colors">{c.person.name}</p>
                        <p className="text-[10px] text-oko-subtle truncate">{c.characterName ?? c.roleType}</p>
                      </Link>
                  ))}
                </div>
              </section>
          )}

          {/* ── Reviews ─────────────────────────────────────────────────── */}
          <section className="mt-10 mb-16">
            <SectionTitle>Reviews</SectionTitle>

            {reviews.length === 0 && (
                <p className="text-sm text-oko-subtle">No reviews yet. Be the first!</p>
            )}

            <div className="space-y-3">
              {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} onDelete={handleDeleteReview} />
              ))}
            </div>

            {!revLast && reviews.length > 0 && (
                <button
                    onClick={() => loadReviews(movie.id, revPage + 1)}
                    className="mt-4 text-xs text-oko-muted hover:text-oko-text border border-oko-border rounded-md px-4 py-2 transition-colors"
                >
                  Load more reviews
                </button>
            )}
          </section>
        </div>

        {/* ── Review modal ────────────────────────────────────────────────── */}
        {showReviewForm && (
            <Modal onClose={() => setShowReviewForm(false)} title={`Review — ${title}`}>
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-xs text-oko-muted mb-2">Rating</label>
                  <StarInput value={reviewRating} onChange={setReviewRating} size="md" />
                </div>
                <div>
                  <label className="block text-xs text-oko-muted mb-1.5">Review</label>
                  <textarea
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      rows={5}
                      required
                      placeholder="Write your review…"
                      className="w-full bg-oko-bg border border-oko-border rounded-md p-3 text-sm text-oko-text placeholder-oko-faint focus:outline-none focus:border-oko-red resize-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={reviewSpoiler} onChange={(e) => setReviewSpoiler(e.target.checked)}
                         className="accent-oko-red" />
                  <span className="text-xs text-oko-muted">Contains spoilers</span>
                </label>
                <button type="submit" disabled={reviewSubmitting}
                        className="w-full bg-oko-red hover:bg-oko-red-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors disabled:opacity-50">
                  {reviewSubmitting ? 'Submitting…' : 'Submit review'}
                </button>
              </form>
            </Modal>
        )}

        {/* ── Diary modal ─────────────────────────────────────────────────── */}
        {showDiaryForm && (
            <Modal onClose={() => setShowDiaryForm(false)} title={`Log to diary — ${title}`}>
              <form onSubmit={submitDiary} className="space-y-4">
                <div>
                  <label className="block text-xs text-oko-muted mb-1.5">Date watched</label>
                  <input type="date" value={diaryDate} onChange={(e) => setDiaryDate(e.target.value)}
                         className="w-full bg-oko-bg border border-oko-border rounded-md px-3 py-2 text-sm text-oko-text focus:outline-none focus:border-oko-red" />
                </div>
                <div>
                  <label className="block text-xs text-oko-muted mb-2">Rating (optional)</label>
                  <StarInput value={diaryRating} onChange={setDiaryRating} />
                </div>
                <div>
                  <label className="block text-xs text-oko-muted mb-1.5">Note (optional)</label>
                  <textarea value={diaryNote} onChange={(e) => setDiaryNote(e.target.value)}
                            rows={3} placeholder="Quick note about this viewing…"
                            className="w-full bg-oko-bg border border-oko-border rounded-md p-3 text-sm text-oko-text placeholder-oko-faint focus:outline-none focus:border-oko-red resize-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={diaryRewatch} onChange={(e) => setDiaryRewatch(e.target.checked)}
                         className="accent-oko-red" />
                  <span className="text-xs text-oko-muted">Rewatch</span>
                </label>
                <button type="submit"
                        className="w-full bg-oko-red hover:bg-oko-red-dark text-white font-semibold py-2.5 rounded-md text-sm transition-colors">
                  Add to diary
                </button>
              </form>
            </Modal>
        )}
      </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ActionBtn({ onClick, label, icon, active, activeClass, primary, disabled }) {
  const base = 'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
  const style = primary
      ? `${base} bg-oko-red border-oko-red text-white hover:bg-oko-red-dark font-semibold`
      : active
          ? `${base} ${activeClass ?? 'bg-white/5 border-oko-muted text-oko-text'}`
          : `${base} bg-transparent border-oko-border text-oko-muted hover:border-oko-muted hover:text-oko-text`;

  return (
      <button onClick={onClick} disabled={disabled} className={style}>
        {icon}
        <span>{label}</span>
      </button>
  );
}

function SectionTitle({ children }) {
  return (
      <h2 className="text-xs font-semibold text-oko-muted tracking-widest uppercase mb-4">{children}</h2>
  );
}

function Modal({ onClose, title, children }) {
  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-md bg-oko-surface border border-oko-border rounded-xl shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between px-5 py-4 border-b border-oko-border">
            <h3 className="font-semibold text-sm text-oko-text">{title}</h3>
            <button onClick={onClose} className="text-oko-subtle hover:text-oko-text text-xl leading-none">×</button>
          </div>
          <div className="px-5 py-5">{children}</div>
        </div>
      </div>
  );
}