# GitHub Actions VPS Deploy

This repo now includes:

- `.github/workflows/ci.yml`: install, typecheck, and build
- `.github/workflows/deploy.yml`: deploy to the VPS on push to `main` or manual trigger

## Required GitHub Secrets

Add these in GitHub: `Settings -> Secrets and variables -> Actions`.

- `VPS_HOST`: VPS public IP or hostname
- `VPS_USER`: SSH user on the VPS
- `VPS_SSH_KEY`: private SSH key used by GitHub Actions to connect to the VPS
- `VPS_APP_DIR`: app directory on the VPS, for example `/srv/mykite`
- `VPS_PORT`: optional, defaults to `22`

## VPS Requirements

The deploy workflow assumes:

- the repo already exists on the VPS in `VPS_APP_DIR`
- `.env` already exists on the VPS in the repo root
- `bun`, `git`, and `systemd` are available on the VPS
- the API service is named `mykite-api`
- the VPS can run `git pull --ff-only` for this repo without interactive prompts

For a private GitHub repo, make sure the VPS has non-interactive Git access configured before using the workflow. A deploy key or a GitHub token-backed HTTPS remote are both fine.

## Deploy Steps Performed On The VPS

The workflow runs this sequence remotely:

```bash
cd /srv/mykite
git pull --ff-only
bun install --frozen-lockfile
export DATABASE_URL="$(grep '^DATABASE_URL=' .env | cut -d= -f2-)"
bun run db:migrate
bun run build
sudo systemctl restart mykite-api
sudo systemctl status mykite-api --no-pager
```

## Notes

- frontend deployment is file-based: Caddy serves the updated `apps/web/dist`
- API deployment has brief downtime during `systemctl restart mykite-api`
- database migrations run on every deploy, so keep migrations backward-compatible when possible
