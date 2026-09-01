import fs from 'node:fs';
import path from 'node:path';
const STORE = 'node_modules/.bun';
const REAL_STORE = fs.realpathSync(STORE);
const entries = fs.readdirSync(STORE);
function parse(dir) {
  const at = dir.lastIndexOf('@');
  const nv = dir.slice(0, at).replace(/\+/g, '/');
  const ver = dir.slice(at + 1).split('+')[0];
  return { name: nv, version: ver };
}
function deps(dir) {
  const nm = path.join(STORE, dir, 'node_modules');
  if (!fs.existsSync(nm)) return [];
  const out = [];
  for (const e of fs.readdirSync(nm)) {
    if (e.startsWith('@')) {
      for (const s of fs.readdirSync(path.join(nm, e))) out.push(e + '/' + s);
    } else out.push(e);
  }
  return out;
}
function target(dir, dep) {
  const p = path.join(STORE, dir, 'node_modules', dep);
  try {
    const real = fs.realpathSync(p);
    const rel = path.relative(REAL_STORE, real);
    if (rel.startsWith('..')) return null;
    return rel.split(path.sep)[0];
  } catch { return null; }
}
const roots = process.argv.slice(2);
const byName = {};
for (const d of entries) { const { name } = parse(d); (byName[name] ||= []).push(d); }
for (const r of roots) {
  for (const dir of (byName[r] || [])) {
    const self = parse(dir);
    const direct = deps(dir).filter((d) => d !== self.name).sort();
    const seen = new Set();
    const q = [dir];
    while (q.length) {
      const cur = q.shift();
      const curName = parse(cur).name;
      for (const d of deps(cur)) {
        if (d === curName) continue;
        const t = target(cur, d);
        if (!t || seen.has(t) || t === dir) continue;
        seen.add(t); q.push(t);
      }
    }
    const list = [...seen].map((x) => { const p = parse(x); return p.name + '@' + p.version; }).sort();
    console.log(`\n### ${self.name}@${self.version}  (store dir: ${dir})`);
    console.log(`direct (${direct.length}): ${direct.join(', ')}`);
    console.log(`transitive closure (${list.length}): ${list.join(', ')}`);
  }
}
