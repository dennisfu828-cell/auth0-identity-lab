import { useAuth0 } from '@auth0/auth0-react';

export function AuthButton() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  if (isLoading) return null;

  if (!isAuthenticated) {
    // Generates code_verifier + code_challenge (PKCE) and state, then
    // sends the browser to https://<domain>/authorize.
    return (
      <button className="btn btn-primary" onClick={() => loginWithRedirect()}>
        Log in
      </button>
    );
  }

  // Clears the SDK's in-memory tokens AND ends the Auth0 session
  // (otherwise the next "Log in" would sign you straight back in).
  return (
    <button
      className="btn"
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
    >
      Log out
    </button>
  );
}
