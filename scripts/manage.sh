#!/usr/bin/env bash

set -euo pipefail

APP_DIR="/var/www/browin"
SERVICE_NAME="nowy-ecommerce.service"

action="${1:-help}"

cd "$APP_DIR"

status() {
  systemctl status "$SERVICE_NAME" --no-pager --lines=12
}

health() {
  echo "Checking Next.js directly on :3000"
  curl -I http://127.0.0.1:3000
  echo
  echo "Checking public entry through nginx on :80"
  curl -I http://127.0.0.1
}

wait_for_app() {
  local attempts=15
  local delay_seconds=1

  for _ in $(seq 1 "$attempts"); do
    if curl -fsS -o /dev/null http://127.0.0.1:3000; then
      return 0
    fi
    sleep "$delay_seconds"
  done

  echo "Aplikacja nie odpowiedziała na porcie 3000 w oczekiwanym czasie." >&2
  return 1
}

case "$action" in
  deploy)
    echo "Linting application"
    npm run lint
    echo
    echo "Building production bundle"
    npm run build
    echo
    echo "Restarting $SERVICE_NAME"
    systemctl restart "$SERVICE_NAME"
    echo
    echo "Waiting for application to become ready"
    wait_for_app
    echo
    status
    echo
    health
    ;;
  restart)
    systemctl restart "$SERVICE_NAME"
    status
    ;;
  status)
    status
    ;;
  logs)
    journalctl -u "$SERVICE_NAME" -n 100 -f
    ;;
  reload-nginx)
    nginx -t
    systemctl reload nginx
    systemctl status nginx --no-pager --lines=8
    ;;
  health)
    health
    ;;
  help|*)
    cat <<'EOF'
Usage:
  ./scripts/manage.sh deploy
  ./scripts/manage.sh restart
  ./scripts/manage.sh status
  ./scripts/manage.sh logs
  ./scripts/manage.sh reload-nginx
  ./scripts/manage.sh health

Recommended:
  - After app/code/style/content changes: deploy
  - After only service restart is needed: restart
  - After nginx config changes: reload-nginx
  - Do not reboot the whole server for normal site changes
EOF
    ;;
esac
