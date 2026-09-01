import fs from 'node:fs';
const roots = process.argv.slice(2);
for (const r of roots) {
  const p = JSON.parse(fs.readFileSync(`packages/ui/node_modules/${r}/package.json`, 'utf8'));
  const d = Object.entries(p.dependencies || {});
  const pd = Object.entries(p.peerDependencies || {});
  const pdm = p.peerDependenciesMeta || {};
  console.log(`\n### ${p.name}@${p.version}`);
  console.log(`dependencies (${d.length}): ${d.map(([k, v]) => `${k}@${v}`).join(', ') || '(none)'}`);
  console.log(`peerDependencies (${pd.length}): ${pd.map(([k, v]) => `${k}@${v}${pdm[k]?.optional ? ' [optional]' : ''}`).join(', ') || '(none)'}`);
  console.log(`sideEffects: ${JSON.stringify(p.sideEffects)}  module:${p.module || '-'}  exports:${p.exports ? 'yes' : 'no'}`);
}
