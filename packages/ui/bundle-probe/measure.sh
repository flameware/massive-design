#!/bin/sh
# Reproduce:  bun install --frozen-lockfile && sh packages/ui/bundle-probe/measure.sh
# bun 1.3.8. react / react-dom are external (the consumer already has them).
set -e
cd "$(dirname "$0")/.."   # -> packages/ui
OUT=bundle-probe/out
rm -rf "$OUT"; mkdir -p "$OUT"
for f in baseline \
         radix-one radix-used radix-all \
         embla recharts-used recharts-all inputotp rrp recharts-story \
         ui-cn ui-button ui-chart ui-carousel ui-resizable ui-inputotp ui-all; do
  bun build "bundle-probe/$f.tsx" \
    --minify --target=browser --format=esm \
    --tsconfig-override tsconfig.json \
    --external react --external react-dom --external react/jsx-runtime \
    --outfile "$OUT/$f.js" 2>/dev/null >/dev/null
  raw=$(wc -c < "$OUT/$f.js" | tr -d ' ')
  gz=$(gzip -9 -c "$OUT/$f.js" | wc -c | tr -d ' ')
  printf '%-16s raw=%8s B  gzip=%8s B\n' "$f" "$raw" "$gz"
done
