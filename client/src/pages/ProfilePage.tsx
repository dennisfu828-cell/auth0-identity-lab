import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';

function ProfilePage() {
  // `user` comes from the ID token: it describes WHO logged in.
  // It is for the front end's own use and is never sent to our API.
  const { user } = useAuth0();

  return (
    <section className="page">
      <h1>Profile</h1>
      <dl className="facts">
        <dt>email</dt>
        <dd>{user?.email ?? '—'}</dd>
        <dt>sub</dt>
        <dd className="mono">{user?.sub ?? '—'}</dd>
      </dl>
      <p className="hint">
        <code>sub</code> (subject) is the stable user ID. The prefix before <code>|</code> names
        the connection, e.g. <code>auth0|</code> for the username/password database.
        Key your own data on <code>sub</code>, not on email, because emails can change.
      </p>
    </section>
  );
}

// Not signed in? Store the current path, redirect to Auth0 login, and come
// back here afterwards. This is a UX guard only: real protection is the
// API refusing requests without a valid token.
export default withAuthenticationRequired(ProfilePage, {
  onRedirecting: () => <p className="loading">Redirecting to login…</p>,
});
