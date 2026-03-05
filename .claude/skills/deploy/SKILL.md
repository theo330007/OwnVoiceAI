---
name: deploy
description: Ship OwnVoiceAI — commit staged/unstaged changes to git, push to GitHub, then deploy to the Raspberry Pi via deploy.ps1
---

Ship the current state of OwnVoiceAI to both GitHub and the Raspberry Pi.

Follow these steps in order:

## Step 1 — Commit any pending changes

Run `git status` and `git diff --stat HEAD` to see what is uncommitted.

If there are **staged or unstaged modifications** (excluding `.claude/`, `.vscode/`, `*.bak`, and `nul`):
- Stage the relevant files with `git add <file>...` (never `git add -A`)
- Derive a concise commit message from the diffs
- Commit using a heredoc to pass the message, appending `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
- If the user supplied a message as `$ARGUMENTS`, use that instead

If there is **nothing to commit**, skip to Step 2.

## Step 2 — Push to GitHub

Run:
```
git push origin main
```

## Step 3 — Deploy to Raspberry Pi

Run:
```
python3 scripts/deploy.py
```

This SSHes into `tobidow@raspberryTLC` using credentials from `.env.deploy`, pulls the latest code, runs `npm install && npm run build`, and restarts the app with PM2 on port 3010.

## Step 4 — Report

Tell the user:
- The commit hash and message (if a commit was made)
- Whether the GitHub push succeeded
- Whether the Pi deploy succeeded
- The app URL: http://raspberryTLC:3010
