#!/bin/bash
# Double-clickable launcher for the local Keystatic CMS.
# Starts the admin dev server (if not already running) and opens the editor in your browser.

set -e

cd "$(dirname "$0")"

URL="http://127.0.0.1:3000/keystatic"

# --- Pre-flight git checks -------------------------------------------------
# Make sure CMS edits start from a clean, up-to-date working tree so that
# Claude Code sessions and CMS edits don't clobber each other.

if command -v git >/dev/null 2>&1 && [ -d .git ]; then
  echo "Checking git state…"

  # Warn about uncommitted changes in tracked content/code.
  DIRTY="$(git status --porcelain)"
  if [ -n "$DIRTY" ]; then
    echo ""
    echo "⚠️  You have uncommitted changes:"
    echo "$DIRTY" | sed 's/^/    /'
    echo ""
    read -p "Continue anyway? [y/N] " -n 1 -r CONFIRM
    echo ""
    if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
      echo "Aborted. Commit or stash your changes, then re-open the CMS."
      exit 1
    fi
  fi

  # Check whether main is behind origin/main; offer to pull.
  if git fetch --quiet origin main 2>/dev/null; then
    BEHIND="$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)"
    if [ "$BEHIND" -gt 0 ]; then
      echo ""
      echo "⚠️  Local main is $BEHIND commit(s) behind origin/main."
      read -p "Pull now? [Y/n] " -n 1 -r CONFIRM
      echo ""
      if [[ ! "$CONFIRM" =~ ^[Nn]$ ]]; then
        git pull --ff-only origin main
        echo "Pulled."
      else
        echo "Skipped pull. Your CMS edits may conflict with remote changes."
      fi
    else
      echo "Up to date with origin/main."
    fi
  else
    echo "(Could not reach origin — skipping freshness check.)"
  fi
  echo ""
fi
# ---------------------------------------------------------------------------

if lsof -iTCP:3000 -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  echo "Dev server already running on port 3000."
  open "$URL"
  echo "Opened $URL"
  echo "Press any key to close this window."
  read -n 1 -s
  exit 0
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies…"
  npm install
fi

echo "Starting Keystatic admin at $URL"
echo "Press Ctrl+C to stop the server."
echo ""

# Open the browser shortly after the server boots.
( sleep 4 && open "$URL" ) &

NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND=local npm run admin:dev
