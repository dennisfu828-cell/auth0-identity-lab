import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { auth, UnauthorizedError } from 'express-oauth2-jwt-bearer';

// ---- Config -------------------------------------------------------------
// Fail fast: a missing value would otherwise show up as a confusing
// 401 on every request.
const {
  AUTH0_DOMAIN,
  AUTH0_AUDIENCE,
  CLIENT_ORIGIN = 'http://localhost:5173',
  PORT = '3001',
} = process.env;

if (!AUTH0_DOMAIN || !AUTH0_AUDIENCE) {
  throw new Error('Missing AUTH0_DOMAIN or AUTH0_AUDIENCE. Copy .env.example to .env.');
}

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));

// ---- Token validation (authentication of the request) --------------------
// This one call replaces what you would otherwise hand-write:
//  1. Read "Authorization: Bearer <token>"              -> else 401
//  2. Fetch Auth0's public keys from
//     https://<domain>/.well-known/jwks.json (cached), pick the key whose
//     "kid" matches the token header, verify the RS256 signature
//  3. Check iss === https://<domain>/   (issued by OUR tenant)
//  4. Check aud includes AUTH0_AUDIENCE  (issued FOR this API)
//  5. Check exp / nbf                    (not expired, not used too early)
// On success the decoded payload is available at req.auth.payload.
const checkJwt = auth({
  issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
  audience: AUTH0_AUDIENCE,
  tokenSigningAlg: 'RS256',
});

// ---- Authorization (RBAC) -----------------------------------------------
// With "Enable RBAC" + "Add Permissions in the Access Token" switched on,
// Auth0 adds a "permissions" array claim to the access token.
//
// Why a hand-written check instead of the library helpers?
//  - requiredScopes() reads the "scope" claim: what the APP asked for,
//    not what the USER is allowed to do.
//  - claimIncludes() throws InvalidTokenError, which becomes a 401.
//    A valid token that lacks a permission is a 403, not a 401.
// This must run AFTER checkJwt, so req.auth is already verified.
const requirePermission =
  (permission: string) => (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.auth?.payload.permissions;
    if (Array.isArray(permissions) && permissions.includes(permission)) {
      next();
      return;
    }
    res.status(403).json({ error: 'forbidden', message: `Missing permission: ${permission}` });
  };

// ---- Routes -------------------------------------------------------------
app.get('/api/public', (_req, res) => {
  res.json({ message: 'Public endpoint. No token needed.' });
});

app.get('/api/private', checkJwt, (req, res) => {
  res.json({
    message: 'Private endpoint. Your access token is valid.',
    sub: req.auth?.payload.sub,
  });
});

app.get('/api/reports', checkJwt, requirePermission('read:reports'), (req, res) => {
  res.json({
    message: 'Reports endpoint. Your token carries read:reports.',
    sub: req.auth?.payload.sub,
    reports: [
      { id: 1, name: 'Sign-ins this week', value: 1284 },
      { id: 2, name: 'Failed logins (7 days)', value: 37 },
    ],
  });
});

// ---- Error handling -----------------------------------------------------
// 401 = "I don't know who you are"   (missing / invalid / expired token)
// 403 = "I know who you are, but no" (valid token, missing permission)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof UnauthorizedError) {
    res.status(err.status).json({ error: 'unauthorized', message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'server_error' });
});

app.listen(Number(PORT), () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
