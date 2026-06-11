#!/bin/bash
# Generates ambient motion loops for flagship project tiles via Seedance 2.0,
# image-to-video from the generated covers in public/covers/.
set -u
cd "$(dirname "$0")/.."

slugs=(quillin pricelessedu polkamono subitup-extension mailchimp-ci-triage anomalies-detector)

for slug in "${slugs[@]}"; do
  src="public/covers/${slug}.jpg"
  out="public/covers/${slug}.mp4"
  [ -s "$out" ] && { echo "skip $slug"; continue; }
  [ -s "$src" ] || { echo "no cover yet: $slug"; continue; }

  echo "=== $slug"
  url=$(higgsfield generate create seedance1_5 \
    --prompt "Subtle ambient motion of this exact scene: gentle drift of light and particles, elements sway or shimmer slowly in place, camera locked, composition unchanged, seamless slow loop, no new objects, no text" \
    --start-image "$src" \
    --duration 4 --resolution 720p \
    --wait --wait-timeout 15m --json 2>/dev/null \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["result_url"])')
  if [ -n "$url" ]; then
    curl -s -o "$out" "$url" && echo "saved $out"
  else
    echo "FAILED $slug"
  fi
done

echo "DONE"
