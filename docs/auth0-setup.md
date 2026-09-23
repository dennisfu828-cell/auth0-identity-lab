# Auth0 dashboard setup

Everything here is done in the Auth0 dashboard. Menu names shift between dashboard
versions; the structure does not.

## 1. Tenant

| Field | Value |
|---|---|
| Tenant domain | any name, e.g. `yourname-identity-lab` |
| Region | EU |
| Environment | Development |

## 2. Single Page Application

**Applications → Applications → Create Application**, type **Single Page Web Applications**,
name `Auth0 Identity Lab SPA`.

Settings → Application URIs (all four set to `http://localhost:5173`):

- Allowed Callback URLs
- Allowed Logout URLs
- Allowed Web Origins
- Allowed Origins (CORS)

Settings → Refresh Token Rotation: turn **Rotation** on. Save.

Check:
- Credentials tab → Authentication Method is **None** (public client, no secret).
- Connections tab → `Username-Password-Authentication` is enabled.

Copy **Domain** and **Client ID** into `client/.env.local`.

## 3. API

**Applications → APIs → Create API**

| Field | Value |
|---|---|
| Name | `Identity Lab API` |
| Identifier | `https://api.identity-lab.dev` (this is the audience; cannot be changed later) |
| Signing algorithm | RS256 |

API Settings → **Allow Offline Access**: on (needed for refresh tokens). Save.

If login fails with an "not authorized to access resource" style error, open the API's
application access settings and allow the SPA to request tokens for it on behalf of users.

## 4. Test users

**User Management → Users → Create User**, connection `Username-Password-Authentication`:

- `analyst@identity-lab.test`
- `viewer@identity-lab.test`

## 5. RBAC (do this after confirming `/api/reports` returns 403 for everyone)

1. **APIs → Identity Lab API → Permissions**: add `read:reports`, description
   `Read analytics reports`.
2. **APIs → Identity Lab API → Settings → RBAC Settings**: turn on **Enable RBAC** and
   **Add Permissions in the Access Token**. Save.
3. **User Management → Roles → Create Role**: name `analyst`. In the role's
   **Permissions** tab, add `read:reports` from `Identity Lab API`.
4. **User Management → Users → analyst@identity-lab.test → Roles → Assign Roles**: `analyst`.
5. Log out of the app and log back in. Permissions are written into the token when it is
   issued, so a token obtained before the role change will not have them.
