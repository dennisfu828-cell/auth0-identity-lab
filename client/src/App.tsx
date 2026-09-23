import { Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ApiPage from './pages/ApiPage';
import TokensPage from './pages/TokensPage';

export default function App() {
  const { isLoading, error } = useAuth0();

  // While the SDK processes ?code=... or checks for an existing session,
  // isAuthenticated is not yet reliable. Render nothing auth-dependent.
  if (isLoading) return <p className="loading">Checking session…</p>;

  return (
    <Layout>
      {error && <p className="alert">Auth error: {error.message}</p>}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/api" element={<ApiPage />} />
        <Route path="/tokens" element={<TokensPage />} />
      </Routes>
    </Layout>
  );
}
