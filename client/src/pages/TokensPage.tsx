import { useEffect, useState } from 'react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import { decodeJwt, type DecodedJwt } from '../jwt';

// Claims worth pointing at in an interview.
const KEY_CLAIMS = ['iss', 'aud', 'sub', 'exp', 'iat', 'scope', 'permissions', 'email', 'nonce'];

function formatValue(key: string, value: unknown): string {
  if ((key === 'exp' || key === 'iat') && typeof value === 'number') {
    return `${value}  (${new Date(value * 1000).toLocaleString()})`;
  }
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function TokenCard({ title, purpose, raw }: { title: string; purpose: string; raw: string }) {
  let decoded: DecodedJwt | null = null;
  try {
    decoded = decodeJwt(raw);
  } catch {
    /* shown below */
  }
  if (!decoded) return <p className="alert">{title}: could not decode.</p>;

  const { header, payload } = decoded;
  const present = KEY_CLAIMS.filter((k) => k in payload);

  return (
    <article className="token">
      <h2>{title}</h2>
      <p className="hint">{purpose}</p>
      <table className="claims">
        <tbody>
          <tr>
            <th>alg / kid</th>
            <td className="mono">
              {String(header.alg)} / {String(header.kid)}
            </td>
          </tr>
          {KEY_CLAIMS.map((k) => (
            <tr key={k} className={present.includes(k) ? '' : 'absent'}>
              <th>{k}</th>
              <td className="mono">{k in payload ? formatValue(k, payload[k]) : 'not present'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <details>
        <summary>Full payload</summary>
        <pre>{JSON.stringify(payload, null, 2)}</pre>
      </details>
      <button className="btn" onClick={() => navigator.clipboard.writeText(raw)}>
        Copy raw token (for jwt.io, test tenant only)
      </button>
    </article>
  );
}

function TokensPage() {
  const { getAccessTokenSilently, getIdTokenClaims } = useAuth0();
  const [idToken, setIdToken] = useState<string>();
  const [accessToken, setAccessToken] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        const claims = await getIdTokenClaims();
        setIdToken(claims?.__raw);
        setAccessToken(await getAccessTokenSilently());
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, [getAccessTokenSilently, getIdTokenClaims]);

  return (
    <section className="page">
      <h1>ID token vs access token</h1>
      <p className="lede">
        Same login, two tokens, two audiences. Compare <code>aud</code> first.
      </p>
      {error && <p className="alert">{error}</p>}
      <div className="tokens">
        {idToken && (
          <TokenCard
            title="ID token"
            purpose="For this front end. Proves who logged in. aud = the SPA's client ID."
            raw={idToken}
          />
        )}
        {accessToken && (
          <TokenCard
            title="Access token"
            purpose="For the API. Proves what the bearer may call. aud = the API identifier."
            raw={accessToken}
          />
        )}
      </div>
    </section>
  );
}

export default withAuthenticationRequired(TokensPage, {
  onRedirecting: () => <p className="loading">Redirecting to login…</p>,
});
