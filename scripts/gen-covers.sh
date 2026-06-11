#!/bin/bash
# Generates project tile covers via Higgsfield GPT Image 2 into public/covers/.
set -u
cd "$(dirname "$0")/.."

SUFFIX="Deep dark navy background, single luminous geometric composition, thin white and pale-blue line work with one muted %HUE% glow, subtle film grain, generous negative space, flat 2D vector style, no text, no letters, no logos, no UI screenshots."

rows=(
  "pricelessedu|sapphire blue|stacked translucent rectangular planes forming an ascending lattice of light"
  "polkamono|ice cyan|three rounded rectangles like garments on a rail, orbiting a shared seam of light"
  "subitup-extension|steel blue|interlocking calendar grid squares flowing into a smooth synchronized wave"
  "mailchimp-ci-triage|steel blue|a pipeline of luminous segments with one faulty segment isolated and re-lit"
  "anomalies-detector|violet|a smooth signal line with one glowing outlier point above scattered faint data dots"
  "node-rest-api|teal|branching thin glowing conduits converging into a single luminous node"
  "smart-sprinkler|violet|concentric arcs of fine water-drop particles intersected by a detection reticle"
  "ibiblee-telebot|steel blue|a constellation of chat bubbles connected by dotted message paths"
  "dunno|teal|a loose stack of note cards dissolving into structured database rows"
  "meeting-rooms-service|teal|an isometric grid of empty room cells with one softly lit reserved cell"
  "coding-challenge|teal|a countdown ring encircling a compact block of glowing code-like lines"
  "lifegame|soft gray|a cellular automata grid mid-evolution with a glider of lit cells crossing it"
  "letovo-forest|ice cyan|minimal pine tree silhouettes inside a rounded phone outline"
  "atlas|soft gray|thin meridian lines of an abstract globe folding into webpage frames"
  "ocfp|soft gray|a wireframe garment on a hanger drawn in one continuous thin line"
  "geometry-topics|soft gray|compass-drawn circles and triangle constructions overlapping faintly"
  "juva|soft gray|a simple line-drawn bicycle assembling itself from scattered strokes"
)

for row in "${rows[@]}"; do
  slug="${row%%|*}"
  rest="${row#*|}"
  hue="${rest%%|*}"
  motif="${rest#*|}"
  out="public/covers/${slug}.jpg"
  [ -s "$out" ] && { echo "skip $slug"; continue; }

  prompt="Minimal abstract editorial cover art for a software project: ${motif}. ${SUFFIX//%HUE%/$hue}"
  echo "=== $slug"
  url=$(higgsfield generate create gpt_image_2 \
    --prompt "$prompt" \
    --aspect_ratio 3:2 --resolution 1k --quality high \
    --wait --wait-timeout 8m --json 2>/dev/null \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["result_url"])')
  if [ -n "$url" ]; then
    curl -s -o "$out" "$url" && echo "saved $out"
  else
    echo "FAILED $slug"
  fi
done

echo "DONE"
