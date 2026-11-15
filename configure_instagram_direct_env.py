from pathlib import Path
import sys

if len(sys.argv) != 3:
    raise SystemExit('Usage: python3 configure_instagram_direct_env.py <instagram_app_id> <instagram_app_secret>')
app_id, app_secret = sys.argv[1].strip(), sys.argv[2].strip()
if not app_id or not app_secret:
    raise SystemExit('Instagram App ID and Secret are required')

env = Path('/root/postiz/.env')
backup = Path('/root/postiz/.env.backup-before-instagram-direct')
if not backup.exists():
    backup.write_text(env.read_text())
lines = env.read_text().splitlines()
out=[]
seen_id=seen_secret=False
for line in lines:
    if line.startswith('INSTAGRAM_APP_ID='):
        out.append(f"INSTAGRAM_APP_ID='{app_id}'")
        seen_id=True
    elif line.startswith('INSTAGRAM_APP_SECRET='):
        out.append(f"INSTAGRAM_APP_SECRET='{app_secret}'")
        seen_secret=True
    else:
        out.append(line)
if not seen_id:
    out.append(f"INSTAGRAM_APP_ID='{app_id}'")
if not seen_secret:
    out.append(f"INSTAGRAM_APP_SECRET='{app_secret}'")
env.write_text('\n'.join(out)+'\n')
print('Updated /root/postiz/.env. Restart with: cd /root/postiz && docker compose restart postiz')
