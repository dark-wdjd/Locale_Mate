#!/usr/bin/env bash
# Applies pending drizzle migrations (drizzle/*.sql) to the PRODUCTION database
# configured in .env.production. Run it yourself: bash scripts/migrate-production.sh
set -euo pipefail
cd "$(dirname "$0")/.."

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm use 20 >/dev/null

set -a
# shellcheck disable=SC1091
. ./.env.production
set +a

echo "Applying pending migrations to the production database..."
pnpm exec drizzle-kit migrate
echo "Done."
