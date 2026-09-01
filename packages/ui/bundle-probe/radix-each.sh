#!/bin/sh
# Per-namespace bundle cost of the 25 radix-ui namespaces @massive/ui imports.
# Reproduce: sh packages/ui/bundle-probe/radix-each.sh
cd "$(dirname "$0")/.."
OUT=bundle-probe/out/each
rm -rf "$OUT"; mkdir -p "$OUT"
for ns in Accordion AlertDialog Avatar Checkbox Collapsible ContextMenu Dialog \
          DropdownMenu Label Menubar NavigationMenu Popover Progress RadioGroup \
          ScrollArea Select Separator Slider Slot Switch Tabs Toast Toggle \
          ToggleGroup Tooltip; do
  printf 'import { %s } from "radix-ui"\nexport const x = %s\n' "$ns" "$ns" > "$OUT/$ns.tsx"
  bun build "$OUT/$ns.tsx" --minify --target=browser --format=esm \
    --external react --external react-dom --external react/jsx-runtime \
    --outfile "$OUT/$ns.js" >/dev/null 2>&1
  raw=$(wc -c < "$OUT/$ns.js" | tr -d ' ')
  gz=$(gzip -9 -c "$OUT/$ns.js" | wc -c | tr -d ' ')
  printf '%-16s raw=%7s B  gzip=%6s B\n' "$ns" "$raw" "$gz"
done
