#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
SERVICE_NAME="nowy-ecommerce.service"

action="${1:-help}"

if [[ "${EUID}" -ne 0 ]]; then
  if ! command -v sudo >/dev/null 2>&1; then
    echo "Ten skrypt wymaga roota albo dostepnego polecenia sudo." >&2
    exit 1
  fi

  sudo_cmd=(sudo)
else
  sudo_cmd=()
fi

cd "$APP_DIR"

run_systemctl() {
  "${sudo_cmd[@]}" systemctl "$@"
}

run_journalctl() {
  "${sudo_cmd[@]}" journalctl "$@"
}

run_nginx() {
  "${sudo_cmd[@]}" nginx "$@"
}

status() {
  run_systemctl status "$SERVICE_NAME" --no-pager --lines=12
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
    run_systemctl restart "$SERVICE_NAME"
    echo
    echo "Waiting for application to become ready"
    wait_for_app
    echo
    status
    echo
    health
    ;;
  restart)
    run_systemctl restart "$SERVICE_NAME"
    status
    ;;
  status)
    status
    ;;
  logs)
    run_journalctl -u "$SERVICE_NAME" -n 100 -f
    ;;
  reload-nginx)
    run_nginx -t
    run_systemctl reload nginx
    run_systemctl status nginx --no-pager --lines=8
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
