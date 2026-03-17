import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFeed } from '../../api';
import FeedItem from '../../components/FeedItem';
import { OkoSpinner } from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [items,   setItems]   = useState([]);
  const [page,    setPage]    = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const loadFeed = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getFeed(pageNum, 20);
      const newItems = Array.isArray(data) ? data : data.content ?? [];
      setItems((prev) => pageNum === 0 ? newItems : [...prev, ...newItems]);
      setHasMore(Array.isArray(data) ? newItems.length === 20 : !data.last);
    } catch {
      setError('Could not load feed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFeed(0); }, [loadFeed]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadFeed(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

        {/* ── Feed ────────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xs font-semibold text-oko-muted tracking-widest uppercase mb-6">
            Friend activity
          </h2>

          {error && <p className="text-oko-red text-sm mb-4">{error}</p>}

          {!loading && items.length === 0 && (
            <EmptyFeed username={user?.username} />
          )}

          <div>
            {items.map((item, i) => (
              <FeedItem key={`${item.type}-${i}`} item={item} />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-10">
              <OkoSpinner size={48} />
            </div>
          )}

          {!loading && hasMore && items.length > 0 && (
            <button
              onClick={loadMore}
              className="mt-6 w-full py-2.5 border border-oko-border rounded-md text-sm text-oko-muted hover:text-oko-text hover:border-oko-muted transition-colors"
            >
              Load more
            </button>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="hidden lg:block space-y-8">
          <SidebarSection title="Your stats">
            <div className="grid grid-cols-2 gap-2">
              <StatTile label="Films watched" value="—" />
              <StatTile label="Reviews"       value="—" />
            </div>
            <Link
              to={`/users/${user?.username}`}
              className="mt-3 block text-xs text-center text-oko-muted hover:text-oko-red transition-colors"
            >
              View full profile →
            </Link>
          </SidebarSection>

          <SidebarSection title="Recent films">
            <p className="text-xs text-oko-subtle">
              Films your friends are watching will appear here.
            </p>
          </SidebarSection>

          <SidebarSection title="Browse genres">
            <div className="flex flex-wrap gap-2">
              {['Horror', 'Sci-Fi', 'Drama', 'Thriller', 'Comedy', 'Animation', 'Documentary', 'Romance'].map((g) => (
                <Link
                  key={g}
                  to={`/search?genre=${g}`}
                  className="text-xs text-oko-muted border border-oko-border rounded-full px-3 py-1 hover:border-oko-red hover:text-oko-red transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}

function EmptyFeed({ username }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4 opacity-20">◎</div>
      <p className="text-oko-muted text-sm mb-2">Your feed is empty</p>
      <p className="text-oko-subtle text-xs mb-6 max-w-xs">
        Follow other members to see their reviews, diary entries, and films they've watched.
      </p>
      <Link
        to="/search"
        className="text-sm bg-oko-red hover:bg-oko-red-dark text-white px-4 py-2 rounded-md transition-colors"
      >
        Discover films
      </Link>
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-oko-subtle tracking-widest uppercase mb-3">{title}</h3>
      {children}
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="bg-oko-surface border border-oko-border rounded-lg px-3 py-2.5">
      <p className="text-lg font-bold text-oko-text">{value}</p>
      <p className="text-[11px] text-oko-subtle mt-0.5">{label}</p>
    </div>
  );
}
