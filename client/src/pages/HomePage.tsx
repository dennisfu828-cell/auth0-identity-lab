import { useAuth0 } from '@auth0/auth0-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth0();

  return (
    <section className="page">
      <h1>Hosted identity, taken apart</h1>
      <p className="lede">
        A React SPA signs in with Auth0 using the Authorization Code flow with PKCE, then calls
        an Express API that verifies the access token&apos;s signature, issuer, audience and
        expiry, and checks a role-based permission.
      </p>
      <ul className="plain">
        <li><strong>Profile</strong> is protected: signed-out visitors are sent to log in.</li>
        <li><strong>API calls</strong> hits a public, a private and a permission-gated endpoint.</li>
        <li><strong>Tokens</strong> shows the ID token and access token side by side.</li>
      </ul>
      {!isAuthenticated && <p className="hint">Log in with the button at the top right.</p>}
    </section>
  );
}
