import fs from 'node:fs';
import path from 'node:path';
const S = 'node_modules/.bun';
const dirs = fs.readdirSync(S);
function findDir(name) {
  return dirs.find((d) => d.replace(/\+/g, '/').startsWith(name + '@') && fs.existsSync(path.join(S, d, 'node_modules', name)));
}
for (const name of process.argv.slice(2)) {
  const d = findDir(name);
  const pkg = JSON.parse(fs.readFileSync(path.join(S, d, 'node_modules', name, 'package.json'), 'utf8'));
  const meta = pkg.peerDependenciesMeta || {};
  console.log(`\n### ${pkg.name}@${pkg.version}`);
  for (const [p, range] of Object.entries(pkg.peerDependencies || {})) {
    const link = path.join(S, d, 'node_modules', p);
    let installed = 'NOT INSTALLED';
    if (fs.existsSync(link)) {
      installed = JSON.parse(fs.readFileSync(path.join(link, 'package.json'), 'utf8')).version;
    }
    console.log(`  ${p}: wants "${range}"${meta[p]?.optional ? ' [optional]' : ''} -> resolved ${installed}`);
  }
}
