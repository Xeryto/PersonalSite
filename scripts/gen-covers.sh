#!/bin/bash
# Generates project tile covers via Higgsfield GPT Image 2 into public/covers/.
set -u
cd "$(dirname "$0")/.."

SUFFIX="Minimal editorial 3D render, single bold %HUE% subject on a near-black matte studio ground, soft cinematic key light, generous negative space, subtle film grain, photographic depth, no text, no letters, no logos, no people."

rows=(
  "quillin|electric violet|a fountain pen nib mid-stroke, ink ribbon curling into glowing mathematical curves"
  "pricelessedu|warm amber|a rising staircase of translucent glass slabs, the top slab glowing"
  "polkamono|coral red|three sculptural garments floating on a chrome rail, fabric frozen mid-sway"
  "subitup-extension|vivid cyan|interlocking calendar cubes flowing into a smooth synchronized wave"
  "mailchimp-ci-triage|signal green|a glass pipeline of luminous segments with one faulty segment lifted out and re-lit"
  "anomalies-detector|hot magenta|a smooth ribbon of data with one glowing outlier sphere rising above it"
  "node-rest-api|deep teal|branching glass conduits converging into one luminous core node"
  "smart-sprinkler|acid lime|an arc of suspended water droplets caught by a thin targeting reticle of light"
  "ibiblee-telebot|sky blue|a constellation of glossy chat bubbles linked by dotted light paths"
  "dunno|rich gold|a loose stack of paper cards dissolving into orderly floating database rows"
  "meeting-rooms-service|fresh mint|an isometric grid of empty glass rooms with one softly lit occupied cell"
  "coding-challenge|burnt vermilion|a countdown ring of light encircling a compact monolith of glowing code blocks"
  "lifegame|phosphor green|a dark grid board with a glider of lit cells crossing it, long exposure trail"
  "letovo-forest|deep emerald|miniature pine trees growing out of a smartphone-shaped slab of glass"
  "atlas|warm sand|thin meridian rings of a desert-toned globe unfolding into floating page frames"
  "ocfp|dusty rose|a single wireframe garment of light on a sculptural hanger"
  "geometry-topics|ice blue|compass-drawn circles and a glowing triangle construction hovering over dark paper"
  "juva|molten copper|a bicycle assembling itself from scattered metallic strokes, parts suspended mid-air"
)

for row in "${rows[@]}"; do
  slug="${row%%|*}"
  rest="${row#*|}"
  hue="${rest%%|*}"
  motif="${rest#*|}"
  out="public/covers/${slug}.jpg"
  [ -s "$out" ] && { echo "skip $slug"; continue; }

  prompt="Cover art for a software project: ${motif}. ${SUFFIX//%HUE%/$hue}"
  echo "=== $slug"
  url=$(higgsfield generate create gpt_image_2 \
    --prompt "$prompt" \
    --aspect_ratio 3:2 --resolution 1k --quality high \
    --wait --wait-timeout 8m --json 2>/dev/null \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["result_url"])')
  if [ -n "$url" ]; then
    tmp="public/covers/${slug}.dl"
    curl -s -o "$tmp" "$url" \
      && sips -s format jpeg -s formatOptions 82 "$tmp" --out "$out" >/dev/null \
      && rm -f "$tmp" && echo "saved $out"
  else
    echo "FAILED $slug"
  fi
done

echo "DONE"
