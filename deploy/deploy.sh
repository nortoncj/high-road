#!/bin/bash
# Runs on the Lightsail server. The Deploy workflow builds the site on GitHub (the server doesn't
# have the memory), uploads it to ~/releases/<sha>, copies this file to ~/deploy.sh and runs it.
#
#   ~/deploy.sh ~/releases/<sha>     switch the site to that release
#   ls -t ~/releases                 newest first; pass an older one to roll back by hand
#
# Secrets stay on the server in ~/app/.env.production. Each release gets a copy at activation.
set -euo pipefail

RELEASE="$(cd "${1:?usage: deploy.sh ~/releases/<sha>}" && pwd)"
ENV_FILE="$HOME/app/.env.production"
PORT="${PORT:-3000}"
KEEP=3

export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

[ -f "$RELEASE/server.js" ] || { echo "No server.js in $RELEASE"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE"; exit 1; }

PREVIOUS="$(readlink -f "$HOME/current" 2>/dev/null || true)"

start() {
  cp "$ENV_FILE" "$1/.env.production"
  ln -sfn "$1" "$HOME/current"
  pm2 delete app >/dev/null 2>&1 || true
  # HOSTNAME is set explicitly: server.js listens on $HOSTNAME, which can be the machine's name.
  PORT="$PORT" HOSTNAME=0.0.0.0 pm2 start "$1/server.js" --name app --cwd "$1" >/dev/null
}

healthy() {
  for _ in $(seq 1 30); do
    curl -fs -o /dev/null "http://127.0.0.1:$PORT/" && return 0
    sleep 1
  done
  return 1
}

echo "Starting $(basename "$RELEASE")"
start "$RELEASE"

if ! healthy; then
  echo "New release didn't answer on port $PORT. Last logs:"
  pm2 logs app --lines 40 --nostream || true
  if [ -n "$PREVIOUS" ] && [ "$PREVIOUS" != "$RELEASE" ] && [ -f "$PREVIOUS/server.js" ]; then
    echo "Rolling back to $(basename "$PREVIOUS")"
    start "$PREVIOUS"
    pm2 save >/dev/null
  fi
  exit 1
fi

pm2 save >/dev/null
echo "Live: $(basename "$RELEASE")"

# Keep the newest few releases (always including the live one) so rollbacks stay possible.
ls -1dt "$HOME"/releases/*/ | tail -n +$((KEEP + 1)) | while read -r old; do
  [ "$(readlink -f "$old")" = "$RELEASE" ] || rm -rf "$old"
done
