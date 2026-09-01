import fs from 'node:fs';
const raw = fs.readFileSync('bun.lock', 'utf8').replace(/,(\s*[}\]])/g, '$1');
const lock = JSON.parse(raw);
const pkgs = lock.packages;
function closure(name, includePeers) {
  const seen = new Set(); const q = [name];
  while (q.length) {
    const n = q.shift(); const e = pkgs[n]; if (!e) continue;
    const meta = e[2] || {};
    const all = { ...(meta.dependencies || {}), ...(meta.optionalDependencies || {}), ...(includePeers ? meta.peerDependencies || {} : {}) };
    for (const d of Object.keys(all)) if (!seen.has(d)) { seen.add(d); q.push(d); }
  }
  return seen;
}
for (const n of ['radix-ui', 'embla-carousel-react', 'recharts', 'input-otp', 'react-resizable-panels']) {
  const a = closure(n, false), b = closure(n, true);
  console.log(`${n}: deps-only closure ${a.size}, deps+peers closure ${b.size}`);
}
