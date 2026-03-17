import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Landing     from './pages/Landing';
import Register    from './pages/Register';
import Home        from './pages/Home';
import Search      from './pages/Search';
import MovieDetail from './pages/MovieDetail';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import Admin       from './pages/Admin';
import Members     from './pages/Members';
import PersonDetail from './pages/PersonDetail';
import { DiaryPage, WatchlistPage, ListDetail } from './pages/Lists';

// ─── Route guards ────────────────────────────────────────────────────────────

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/" replace />;
}

function PublicOnly({ children }) {
  const { token } = useAuth();
  return !token ? children : <Navigate to="/home" replace />;
}

// ─── Layout wrapper — Navbar + content ───────────────────────────────────────

function Layout({ children, showNav = true }) {
  return (
      <div className="min-h-screen bg-oko-bg">
        {showNav && <Navbar />}
        <main>{children}</main>
      </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <Routes>

            {/* Public — landing / auth */}
            <Route path="/" element={
              <PublicOnly>
                <Layout showNav={false}><Landing /></Layout>
              </PublicOnly>
            } />
            <Route path="/register" element={
              <PublicOnly>
                <Layout showNav={false}><Register /></Layout>
              </PublicOnly>
            } />

            {/* Search is public (browse without logging in) */}
            <Route path="/search" element={
              <Layout><Search /></Layout>
            } />

            {/* Movie detail — public */}
            <Route path="/movies/:id" element={
              <Layout><MovieDetail /></Layout>
            } />

            {/* User profiles — public */}
            <Route path="/users/:username" element={
              <Layout><UserProfile /></Layout>
            } />
            <Route path="/users/:username/diary" element={
              <Layout><DiaryPage /></Layout>
            } />
            <Route path="/users/:username/watchlist" element={
              <Layout><WatchlistPage /></Layout>
            } />

            {/* Lists — public */}
            <Route path="/lists/:listId" element={
              <Layout><ListDetail /></Layout>
            } />

            {/* People — public */}
            <Route path="/people/:id" element={
              <Layout><PersonDetail /></Layout>
            } />

            {/* Members — requires auth */}
            <Route path="/members" element={
              <PrivateRoute>
                <Layout><Members /></Layout>
              </PrivateRoute>
            } />

            {/* Private routes */}
            <Route path="/home" element={
              <PrivateRoute>
                <Layout><Home /></Layout>
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Layout><EditProfile /></Layout>
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute>
                <Layout><Admin /></Layout>
              </PrivateRoute>
            } />

            {/* 404 fallback */}
            <Route path="*" element={
              <Layout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <p className="text-6xl font-bold text-oko-border mb-4">404</p>
                  <p className="text-oko-muted text-sm">Page not found</p>
                </div>
              </Layout>
            } />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
  );
}