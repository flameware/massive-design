#!/bin/sh
# Which third-party libraries survive into each probe bundle? (marker-string count, 0 = shaken out)
# Reproduce: sh packages/ui/bundle-probe/measure.sh && sh packages/ui/bundle-probe/scan.sh
cd "$(dirname "$0")/.."
OUT=bundle-probe/out
printf '%-14s %7s %7s %8s %8s %7s\n' bundle radix embla recharts input-otp rrp
for f in ui-cn ui-button ui-chart ui-carousel ui-resizable ui-inputotp ui-all; do
  printf '%-14s %7s %7s %8s %8s %7s\n' "$f" \
    "$(grep -c 'data-radix' $OUT/$f.js)" \
    "$(grep -c 'keepSnaps' $OUT/$f.js)" \
    "$(grep -c 'recharts-responsive-container' $OUT/$f.js)" \
    "$(grep -c 'data-input-otp-container' $OUT/$f.js)" \
    "$(grep -c 'preserve-relative-size' $OUT/$f.js)"
done
