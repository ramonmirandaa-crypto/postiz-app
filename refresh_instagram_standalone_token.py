#!/usr/bin/env python3
"""Refresh Postiz Instagram Standalone long-lived tokens without printing secrets."""
import argparse, json, subprocess, urllib.parse, urllib.request
from datetime import datetime, timezone

DB_CMD = ["docker", "compose", "exec", "-T", "postiz-postgres", "psql", "-U", "postiz-user", "-d", "postiz-db-local", "-At", "-F", "\t"]


def run_psql(sql: str) -> str:
    res = subprocess.run(DB_CMD + ["-c", sql], cwd="/root/postiz", text=True, capture_output=True, timeout=60)
    if res.returncode != 0:
        raise RuntimeError(res.stderr.strip())
    return res.stdout


def q(s: str) -> str:
    return "'" + str(s).replace("'", "''") + "'"


def refresh_token(token: str) -> dict:
    url = "https://graph.instagram.com/refresh_access_token?" + urllib.parse.urlencode({
        "grant_type": "ig_refresh_token",
        "access_token": token,
    })
    req = urllib.request.Request(url, headers={"User-Agent": "postiz-token-refresh/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="refresh even if token is not near expiry")
    ap.add_argument("--days", type=int, default=10, help="refresh tokens expiring within N days")
    args = ap.parse_args()

    where_expiry = "" if args.force else "and \"tokenExpiration\" <= now() + interval '%d days'" % int(args.days)
    sql = """
select id, "internalId", profile, token, "tokenExpiration" from "Integration"
where "providerIdentifier"='instagram-standalone'
  and "deletedAt" is null
  and disabled=false
  and "refreshNeeded"=false
  %s;
""" % where_expiry
    rows = [r for r in run_psql(sql).splitlines() if r.strip()]
    if not rows:
        print(f"{datetime.now(timezone.utc).isoformat()} no_tokens_need_refresh")
        return 0

    ok = 0
    failed = 0
    for row in rows:
        parts = row.split("\t")
        if len(parts) < 5:
            print("bad_row_skipped")
            failed += 1
            continue
        integ_id, internal_id, profile, token, old_exp = parts[:5]
        try:
            data = refresh_token(token)
            new_token = data.get("access_token")
            expires_in = int(data.get("expires_in") or 60*60*24*58)
            if not new_token:
                raise RuntimeError("Meta did not return access_token")
            update = """
update "Integration"
set token=%s, "refreshToken"=%s,
    "tokenExpiration"=now() + interval '%d seconds',
    "refreshNeeded"=false, "updatedAt"=now()
where id=%s;
""" % (q(new_token), q(new_token), expires_in, q(integ_id))
            run_psql(update)
            print(f"refreshed id={integ_id} profile={profile or internal_id} expires_in_days={expires_in/86400:.1f}")
            ok += 1
        except Exception as e:
            print(f"refresh_failed id={integ_id} profile={profile or internal_id} error={type(e).__name__}")
            failed += 1
    return 1 if failed and not ok else 0

if __name__ == "__main__":
    raise SystemExit(main())
