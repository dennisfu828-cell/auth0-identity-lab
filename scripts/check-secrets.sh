#!/usr/bin/env bash
# Run from the repo root before pushing: ./scripts/check-secrets.sh
# Scans files git would publish (tracked + staged + untracked-not-ignored).
set -u
fail=0
files=$(git ls-files --cached --others --exclude-standard)

check() {
  local label="$1" pattern="$2"
  local hits
  hits=$(echo "$files" | xargs grep -nIE "$pattern" -- 2>/dev/null \
    | grep -v '^scripts/check-secrets.sh' | grep -v 'your-tenant')
  if [ -n "$hits" ]; then
    echo "!! $label"; echo "$hits"; echo; fail=1
  fi
}

# 1. .env files must be ignored
for f in client/.env.local client/.env server/.env; do
  if [ -f "$f" ] && ! git check-ignore -q "$f"; then
    echo "!! $f exists and is NOT ignored"; fail=1
  fi
done
echo "$files" | grep -E '(^|/)\.env($|\.)' | grep -v '\.env\.example$' \
  && { echo "!! a .env file is tracked"; fail=1; }

# 2. Content checks
check "Looks like a JWT (real token pasted somewhere?)" 'eyJ[A-Za-z0-9_-]{10,}\.'
check "Client secret mentioned"                        '(client_secret|CLIENT_SECRET)\s*[:=]'
check "Real Auth0 tenant domain (should be a placeholder)" '[a-z0-9-]+\.((eu|us|au|jp|uk|ca)\.)?auth0\.com'
check "Unfinished TODO in docs"                         'TODO\(Dennis\)'

if [ $fail -eq 0 ]; then echo "OK: nothing sensitive found."; else echo "Fix the items above before pushing."; exit 1; fi
