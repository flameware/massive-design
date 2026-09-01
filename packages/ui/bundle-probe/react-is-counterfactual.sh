#!/bin/sh
# Counterfactual: is recharts' declared `react-is` peer load-bearing for us?
# Temporarily hides the whole react-is store entry, rebuilds both recharts probes, restores it.
# Reproduce: sh packages/ui/bundle-probe/react-is-counterfactual.sh
cd "$(dirname "$0")/../../.."
S=$(echo node_modules/.bun/react-is@*)
mv "$S" "$S.hidden"
echo "--- react-is store entry hidden: $S ---"
cd packages/ui
for f in recharts-used recharts-story; do
  echo "# $f"
  bun build "bundle-probe/$f.tsx" --minify --target=browser --format=esm \
    --tsconfig-override tsconfig.json \
    --external react --external react-dom --external react/jsx-runtime \
    --outfile /dev/null 2>&1 | grep -v 'Internal error\|^$' | head -6
done
cd ../..
mv "$S.hidden" "$S"
echo "--- react-is restored ---"
