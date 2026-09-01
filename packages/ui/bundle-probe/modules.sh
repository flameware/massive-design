#!/bin/sh
# Which npm packages actually survive into a probe bundle, counted by sourcemap "sources".
# Usage: sh packages/ui/bundle-probe/modules.sh ui-cn
cd "$(dirname "$0")/.."
f=${1:-ui-cn}
D=bundle-probe/out/maps/$f
rm -rf "$D"; mkdir -p "$D"
bun build "bundle-probe/$f.tsx" --minify --target=browser --format=esm \
  --tsconfig-override tsconfig.json --sourcemap=external \
  --external react --external react-dom --external react/jsx-runtime \
  --outdir "$D" >/dev/null 2>&1
node -e '
const m=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));
const c={};
for(const s of m.sources){
  const i=s.lastIndexOf("node_modules/");
  let k;
  if(i>=0){const r=s.slice(i+13).split("/");k=r[0].startsWith("@")?r[0]+"/"+r[1]:r[0];}
  else k="(@massive/ui source)";
  c[k]=(c[k]||0)+1;
}
console.log(Object.entries(c).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${String(v).padStart(4)}  ${k}`).join("\n"));
console.log("total modules:", m.sources.length);
' "$D/$f.js.map"
