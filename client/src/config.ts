// Read once at startup and fail loudly if something is missing.
// A blank domain or client ID otherwise produces a vague Auth0 error page.
function required(name: string): string {
  const value = import.meta.env[name] as string | undefined;
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env.local.`);
  return value;
}

export const config = {
  domain: required('VITE_AUTH0_DOMAIN'),
  clientId: required('VITE_AUTH0_CLIENT_ID'),
  audience: required('VITE_AUTH0_AUDIENCE'),
  apiUrl: required('VITE_API_URL'),
};
