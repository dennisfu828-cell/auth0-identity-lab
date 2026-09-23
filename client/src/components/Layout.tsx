import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthButton } from './AuthButton';

export function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth0();

  return (
    <div className="shell">
      <header className="topbar">
        <span className="brand">Auth0 Identity Lab</span>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/api">API calls</NavLink>
          <NavLink to="/tokens">Tokens</NavLink>
        </nav>
        <div className="session">
          {isAuthenticated && <span className="who">{user?.email}</span>}
          <AuthButton />
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
