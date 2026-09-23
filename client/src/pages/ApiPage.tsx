import { useState } from 'react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import { callApi, type ApiResult } from '../api';

type Endpoint = { path: string; label: string; needsToken: boolean; expect: string };

const ENDPOINTS: Endpoint[] = [
  { path: '/api/public', label: 'Public', needsToken: false, expect: '200 for everyone' },
  { path: '/api/private', label: 'Private', needsToken: true, expect: '200 with any valid token' },
  {
    path: '/api/reports',
    label: 'Reports',
    needsToken: true,
    expect: '200 with read:reports, otherwise 403',
  },
];

function ApiPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [results, setResults] = useState<Record<string, ApiResult | string>>({});

  async function run(ep: Endpoint, withToken: boolean) {
    const key = `${ep.path}:${withToken}`;
    try {
      // Returns a cached token if still valid; otherwise uses the refresh
      // token to get a new one. Concurrent callers share one refresh.
      const token = withToken ? await getAccessTokenSilently() : undefined;
      const result = await callApi(ep.path, token);
      setResults((r) => ({ ...r, [key]: result }));
    } catch (e) {
      setResults((r) => ({ ...r, [key]: (e as Error).message }));
    }
  }

  return (
    <section className="page">
      <h1>API calls</h1>
      <p className="lede">
        Try each endpoint with and without a token. Log in as each test user to compare the
        Reports result.
      </p>
      <div className="endpoints">
        {ENDPOINTS.map((ep) => (
          <div key={ep.path} className="endpoint">
            <div className="endpoint-head">
              <h2>{ep.label}</h2>
              <code>GET {ep.path}</code>
            </div>
            <p className="hint">Expected: {ep.expect}</p>
            <div className="row">
              <button className="btn" onClick={() => run(ep, false)}>Call without token</button>
              <button className="btn btn-primary" onClick={() => run(ep, true)}>
                Call with token
              </button>
            </div>
            {[false, true].map((withToken) => {
              const r = results[`${ep.path}:${withToken}`];
              if (!r) return null;
              return (
                <div key={String(withToken)} className="result">
                  <span className="result-label">{withToken ? 'with token' : 'no token'}</span>
                  {typeof r === 'string' ? (
                    <span className="status status-bad">error</span>
                  ) : (
                    <span className={`status ${r.status < 300 ? 'status-ok' : 'status-bad'}`}>
                      {r.status}
                    </span>
                  )}
                  <pre>{typeof r === 'string' ? r : JSON.stringify(r.body, null, 2)}</pre>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

export default withAuthenticationRequired(ApiPage, {
  onRedirecting: () => <p className="loading">Redirecting to login…</p>,
});
