import fs from 'node:fs';
import path from 'node:path';
const STORE = 'node_modules/.bun/radix-ui@1.6.7+c32617ced709d283/node_modules';
const SRC = 'packages/ui/src';
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
})(SRC);
const nsToLeaf = {};
const dts = fs.readFileSync(path.join(STORE, 'radix-ui/dist/index.d.mts'), 'utf8');
const re = /import \* as (\w+) from '([^']+)';\nexport \{ \1 as (\w+) \};/g;
let m; while ((m = re.exec(dts))) nsToLeaf[m[3]] = m[2];
const used = {};
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const im = src.match(/import \{([^}]+)\} from "radix-ui"/);
  if (!im) continue;
  for (const spec of im[1].split(',')) {
    const parts = spec.trim().split(/\s+as\s+/);
    const ns = parts[0].trim(); const alias = (parts[1] || parts[0]).trim();
    (used[ns] ||= new Set());
    for (const mm of src.matchAll(new RegExp('\\b' + alias + '\\.(\\w+)', 'g'))) used[ns].add(mm[1]);
  }
}
// runtime parts of a leaf: value exports that are "short names" (not <Namespace>-prefixed long form, not create*Scope)
function leafParts(pkg, ns) {
  const p = path.join(STORE, pkg, 'dist/index.d.mts');
  if (!fs.existsSync(p)) return null;
  const t = fs.readFileSync(p, 'utf8');
  const names = new Set();
  for (const mm of t.matchAll(/^export \{([^}]+)\}/gms))
    for (const s of mm[1].split(',')) {
      const raw = s.trim();
      if (raw.startsWith('type ')) continue;
      const a = raw.split(/\s+as\s+/);
      const n = (a[1] || a[0] || '').trim();
      if (/^[A-Za-z_]\w*$/.test(n)) names.add(n);
    }
  const longPrefixes = [ns, ...Object.keys(nsToLeaf)];
  const shorts = [...names].filter((n) => !/^create\w*Scope$/.test(n) && !(n !== ns && n.startsWith(ns) && names.has(n.slice(ns.length))) && n !== ns);
  return { all: names, shorts: new Set(shorts) };
}
let tu = 0, ta = 0; const rows = [];
for (const ns of Object.keys(used).sort()) {
  const leaf = nsToLeaf[ns];
  const lp = leafParts(leaf, ns);
  const u = [...used[ns]].sort();
  const unusedParts = lp ? [...lp.shorts].filter((x) => !used[ns].has(x)).sort() : [];
  tu += u.length; if (lp) ta += lp.shorts.size;
  rows.push(`| ${ns} | ${leaf} | ${u.length} | ${lp ? lp.shorts.size : '?'} | ${unusedParts.join(' ') || '-'} |`);
}
console.log('| ns | leaf | used | runtime parts | unused parts |');
console.log(rows.join('\n'));
console.log(`TOTAL used ${tu} / runtime parts ${ta}`);
