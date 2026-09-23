// Decode (NOT verify) a JWT, for display only.
// A JWT is header.payload.signature, each part base64url-encoded JSON
// (except the signature). Anyone can decode it; only the holder of the
// public key can check the signature. Never make security decisions on
// the client from decoded claims.
export type DecodedJwt = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
};

function base64UrlToJson(part: string): Record<string, unknown> {
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function decodeJwt(token: string): DecodedJwt {
  const [header, payload] = token.split('.');
  if (!header || !payload) throw new Error('Not a JWT');
  return { header: base64UrlToJson(header), payload: base64UrlToJson(payload) };
}
