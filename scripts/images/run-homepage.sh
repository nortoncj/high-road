#!/usr/bin/env bash
# Batch the 10 homepage shots through fal via the generate-media skill.
# Shows the cost estimate first and only spends after you type y.
set -euo pipefail
cd "$(dirname "$0")"
FAL="$HOME/.claude/skills/generate-media/scripts/fal_media.py"
[ -f "$FAL" ] || { echo "generate-media skill not found at $FAL. Install it first."; exit 1; }

python3 "$FAL" estimate --plan plan.json || { echo "Over budget, nothing sent."; exit 2; }

read -r -p "Spend it? [y/N] " ok
[[ "$ok" =~ ^[Yy]$ ]] || { echo "Cancelled. Nothing charged."; exit 0; }

python3 "$FAL" generate --plan plan.json --yes
echo "Done. Images are in generated-media/homepage (manifest.json has prompts + request IDs)."
