import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { searchUsers } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { OkoSpinner } from '../../components/Logo';

export default function Members() {
    const { user } = useAuth();

    const [query,         setQuery]         = useState('');
    const [results,       setResults]       = useState([]);
    const [page,          setPage]          = useState(0);
    const [hasMore,       setHasMore]       = useState(false);
    const [total,         setTotal]         = useState(0);
    const [loading,       setLoading]       = useState(false);
    const [loadingMore,   setLoadingMore]   = useState(false);
    const [error,         setError]         = useState('');

    const debounceRef = useRef(null);

    const doSearch = useCallback(async (q, pageNum, append = false) => {
        if (!q.trim()) {
            setResults([]);
            setHasMore(false);
            setTotal(0);
            return;
        }
        append ? setLoadingMore(true) : setLoading(true);
        setError('');
        try {
            const { data } = await searchUsers(q, pageNum, 20);
            const items = data.content ?? [];
            setResults((prev) => append ? [...prev, ...items] : items);
            setHasMore(!data.last);
            setTotal(data.totalElements ?? items.length);
            setPage(pageNum);
        } catch {
            setError('Search failed. Please try again.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            doSearch(query, 0, false);
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [query, doSearch]);

    const loadMore = () => doSearch(query, page + 1, true);

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-xl font-bold text-oko-text mb-1">Members</h1>
                <p className="text-sm text-oko-subtle">Find people who love film</p>
            </div>

            <div className="relative mb-8">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-oko-subtle pointer-events-none" />
                <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by username or display name…"
                    className="w-full bg-oko-surface border border-oko-border rounded-xl pl-12 pr-4 py-3 text-sm text-oko-text placeholder-oko-subtle focus:outline-none focus:border-oko-red transition-colors"
                />
                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <OkoSpinner size={20} />
                    </div>
                )}
            </div>

            {error && <p className="text-oko-red text-sm mb-6">{error}</p>}

            {!loading && query.trim() === '' && (
                <div className="text-center py-16">
                    <UserIcon className="w-10 h-10 text-oko-border mx-auto mb-3" />
                    <p className="text-oko-muted text-sm">Start typing to find members</p>
                </div>
            )}

            {!loading && query.trim() !== '' && results.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-oko-muted text-sm">
                        No members found for "<span className="text-oko-text">{query}</span>"
                    </p>
                </div>
            )}

            {results.length > 0 && (
                <>
                    <p className="text-xs text-oko-subtle mb-4">
                        {total} member{total !== 1 ? 's' : ''} found
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {results.map((member) => (
                            <UserCard
                                key={member.id ?? member.username}
                                member={member}
                                isSelf={user?.username === member.username}
                            />
                        ))}
                    </div>
                    {hasMore && (
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="mt-6 w-full py-2.5 border border-oko-border rounded-md text-sm text-oko-muted hover:text-oko-text hover:border-oko-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loadingMore ? <><OkoSpinner size={16} /> Loading…</> : 'Load more'}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

function UserCard({ member, isSelf }) {
    const { username, displayName, avatarUrl, role } = member;
    return (
        <div className="flex items-center gap-4 bg-oko-surface border border-oko-border rounded-lg px-4 py-3 hover:border-oko-muted transition-colors">
            <Link to={`/users/${username}`} className="flex-shrink-0">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName || username}
                         className="w-11 h-11 rounded-full object-cover border border-oko-border hover:border-oko-red transition-colors"
                         style={{ width: '2.75rem', height: '2.75rem' }} />
                ) : (
                    <div className="w-11 h-11 rounded-full bg-oko-red-dark flex items-center justify-center text-white text-sm font-bold uppercase">
                        {(displayName || username)[0]}
                    </div>
                )}
            </Link>
            <Link to={`/users/${username}`} className="flex-1 min-w-0 group">
                <p className="text-sm font-medium text-oko-text group-hover:text-oko-red transition-colors truncate">
                    {displayName || username}
                </p>
                <p className="text-xs text-oko-subtle truncate">
                    @{username}
                    {role === 'ADMIN' && (
                        <span className="ml-2 text-[10px] bg-oko-red/10 text-oko-red border border-oko-red/20 rounded px-1.5 py-0.5">admin</span>
                    )}
                </p>
            </Link>
        </div>
    );
}