import { config } from './config';

export type ApiResult = { status: number; body: unknown };

// Thin fetch wrapper. Note what it does NOT do: no expiry check,
// no refresh, no retry. getAccessTokenSilently() handles all of that
// before we ever get here.
export async function callApi(path: string, accessToken?: string): Promise<ApiResult> {
  const res = await fetch(`${config.apiUrl}${path}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}
