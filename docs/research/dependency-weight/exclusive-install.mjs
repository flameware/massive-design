import fs from 'node:fs';
import path from 'node:path';
const S = 'node_modules/.bun';
const REAL = fs.realpathSync(S);
const dirs = fs.readdirSync(S);
const parse = (d) => { const at = d.lastIndexOf('@'); return { name: d.slice(0, at).replace(/\+/g, '/'), version: d.slice(at + 1).split('+')[0] }; };
function deps(dir) {
  const nm = path.join(S, dir, 'node_modules');
  if (!fs.existsSync(nm)) return [];
  const out = [];
  for (const e of fs.readdirSync(nm)) {
    if (e.startsWith('@')) for (const s of fs.readdirSync(path.join(nm, e))) out.push(e + '/' + s);
    else out.push(e);
  }
  return out;
}
function tgt(dir, dep) {
  try { const r = path.relative(REAL, fs.realpathSync(path.join(S, dir, 'node_modules', dep))); return r.startsWith('..') ? null : r.split(path.sep)[0]; } catch { return null; }
}
function closure(dir) {
  const seen = new Set([dir]); const q = [dir];
  while (q.length) { const c = q.shift(); const cn = parse(c).name;
    for (const d of deps(c)) { if (d === cn) continue; const t = tgt(c, d); if (t && !seen.has(t)) { seen.add(t); q.push(t); } } }
  return seen;
}
const find = (n) => dirs.find((d) => parse(d).name === n);
const targets = ['radix-ui', 'embla-carousel-react', 'recharts', 'input-otp', 'react-resizable-panels'];
const others = ['react', 'react-dom', 'class-variance-authority', 'clsx', 'tailwind-merge'];
const cl = {};
for (const t of [...targets, ...others]) cl[t] = closure(find(t));
for (const t of targets) {
  const rest = new Set();
  for (const o of [...targets, ...others]) if (o !== t) for (const x of cl[o]) rest.add(x);
  const excl = [...cl[t]].filter((x) => x !== find(t) && !rest.has(x)).map((x) => { const p = parse(x); return p.name + '@' + p.version; }).sort();
  console.log(`\n${t}: closure ${cl[t].size - 1}, exclusive-to-it ${excl.length}`);
  console.log('  ' + excl.join(', '));
}
