# Monitoring and CI

## What is configured

1. `CI Static Checks` workflow:
   - File: `.github/workflows/ci-static.yml`
   - Runs on push/PR for HTML and scripts
   - Uses `scripts/validate_static.sh`
   - Verifies:
     - Required files exist
     - No merge conflict markers in `*.html`
     - Critical sections/tokens exist in `index.html`

2. `Uptime Monitor` workflow:
   - File: `.github/workflows/uptime-monitor.yml`
   - Runs every 15 minutes + manual run
   - Uses `scripts/check_site.sh`
   - Checks:
     - HTTP 200
     - Minimum response size
     - Critical content tokens on homepage
   - Sends Telegram alert on failure (if secrets are configured)

3. `Lighthouse Audit` workflow:
   - File: `.github/workflows/lighthouse-audit.yml`
   - Runs every 6 hours + manual run + on `main` and PR changes to key pages
   - Uses `.lighthouserc.json`
   - Audits:
     - `https://npln.tech/`
     - `https://npln.tech/learning-hub.html`
   - Tracks category scores and key metrics (`FCP`, `LCP`, `CLS`)
   - Publishes report links to GitHub Actions Step Summary
   - Creates/updates a PR comment with report links on every audit run in pull requests
   - Sends Telegram alert on failure (if secrets are configured)

## Required GitHub Secrets

For Telegram alerts:

1. `TELEGRAM_BOT_TOKEN` - bot token from BotFather
2. `TELEGRAM_CHAT_ID` - target channel/chat id

Optional:

3. `MONITOR_URL` - custom URL to monitor (default: `https://npln.tech/`)

## Local script usage

```bash
chmod +x scripts/validate_static.sh scripts/check_site.sh
scripts/validate_static.sh
scripts/check_site.sh https://npln.tech/
```

## GitHub workflows (manual trigger)

```bash
chmod +x scripts/github_ops_check.sh scripts/github_run_workflows.sh
./scripts/github_ops_check.sh s200586-art/NPLNTech
./scripts/github_run_workflows.sh s200586-art/NPLNTech
```

## Safe server pull (manual)

When server has local changes and a normal `git pull` fails:

```bash
cd /var/www/nplntech
chmod +x scripts/safe_git_pull.sh
./scripts/safe_git_pull.sh origin main
```

What it does:

1. Fetches `origin/main` and checks incoming files
2. Stashes tracked local edits only for conflicting files
3. Moves untracked conflicting files into `.pull-backups/<timestamp>/`
4. Runs `git pull origin main`
