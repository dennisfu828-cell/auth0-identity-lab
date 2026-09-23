import type { ReactNode } from 'react';
import { Auth0Provider, type AppState } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

export function Auth0ProviderWithNavigate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  // After login, Auth0 redirects back to redirect_uri (the site root) with
  // ?code=...&state=... in the URL. The SDK exchanges the code for tokens,
  // then calls this with whatever appState we stored before leaving
  // (e.g. the protected page the user originally asked for).
  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo ?? window.location.pathname, { replace: true });
  };

  return (
    <Auth0Provider
      domain={config.domain}
      clientId={config.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        // Without audience, Auth0 issues an access token for its own
        // /userinfo endpoint only, which our API would reject (wrong aud).
        audience: config.audience,
        // openid profile email -> ID token contents
        // offline_access       -> ask for a refresh token
        scope: 'openid profile email offline_access',
      }}
      // Use refresh tokens (rotated by Auth0) for silent renewal instead of
      // a hidden iframe, which depends on third-party cookies.
      useRefreshTokens={true}
      // Default, stated explicitly: tokens live in JS memory only, not in
      // localStorage, so an XSS payload can't just read them from storage.
      // Trade-off: a full page reload loses them (see README).
      cacheLocation="memory"
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}
