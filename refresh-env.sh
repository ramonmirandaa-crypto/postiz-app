#!/usr/bin/env bash
set -euo pipefail

# Pull secrets from Infisical and write /root/postiz/.env
# Usage: ./refresh-env.sh [--restart]

source /root/.infisical-auth

INFISICAL_TOKEN=$(infisical login \
  --method=universal-auth \
  --client-id="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" \
  --client-secret="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" \
  --domain="$INFISICAL_API_URL" \
  --plain --silent)

infisical export \
  --projectId=d18f35c5-dc63-4cc1-9aea-5320bd6eee58 \
  --env=prod \
  --format=dotenv \
  --domain="$INFISICAL_API_URL" \
  --token="$INFISICAL_TOKEN" \
  --silent > /root/postiz/.env.new

mv /root/postiz/.env.new /root/postiz/.env
chmod 600 /root/postiz/.env

echo "[refresh-env] $(wc -l < /root/postiz/.env) vars written to /root/postiz/.env"

if [[ "${1:-}" == "--restart" ]]; then
  cd /root/postiz
  docker compose up -d
  echo "[refresh-env] compose up -d done"
fi
