import { spawn, spawnSync, execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import boxen from 'boxen';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, '..', '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { mode: 'safe', scope: 'all', install: 'node', pm: 'auto' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--mode=')) out.mode = a.split('=')[1];
    else if (a === '--mode' && args[i + 1]) out.mode = args[++i];
    else if (a.startsWith('--scope=')) out.scope = a.split('=')[1];
    else if (a === '--scope' && args[i + 1]) out.scope = args[++i];
    else if (a.startsWith('--install=')) out.install = a.split('=')[1];
    else if (a === '--install' && args[i + 1]) out.install = args[++i];
    else if (a.startsWith('--pm=')) out.pm = a.split('=')[1];
    else if (a === '--pm' && args[i + 1]) out.pm = args[++i];
    else if (a === '--help' || a === '-h') {
      console.log(chalk.cyan('Usage: node scripts/update.mjs [--mode safe|force] [--scope root|all] [--install none|node|python|all] [--pm auto|pnpm|npm|cnpm]'));
      process.exit(0);
    }
  }
  return out;
}

function run(cmd, args, cwd, extraEnv) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true, env: { ...process.env, ...(extraEnv || {}) } });
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function commandExists(cmd, checkArgs = ['--version']) {
  try {
    const r = spawnSync(cmd, checkArgs, { stdio: 'ignore', shell: true });
    return r.status === 0;
  } catch {
    return false;
  }
}

function choosePM(preferred) {
  if (preferred && preferred !== 'auto') {
    if (!commandExists(preferred)) throw new Error(`Package manager ${preferred} not found in PATH`);
    return preferred;
  }
  if (commandExists('pnpm')) return 'pnpm';
  if (commandExists('npm')) return 'npm';
  if (commandExists('cnpm')) return 'cnpm';
  throw new Error('No package manager found. Please install pnpm or npm or cnpm, or pass --pm option.');
}

function isGitRepo(dir) {
  try { return fs.existsSync(path.join(dir, '.git')); } catch { return false; }
}

function getCurrentBranch(dir) {
  try {
    const out = execSync('git rev-parse --abbrev-ref HEAD', { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'], shell: true }).toString().trim();
    if (out && out !== 'HEAD') return out;
  } catch {}
  try {
    const head = fs.readFileSync(path.join(dir, '.git', 'HEAD'), 'utf8');
    const m = head.match(/refs\/(heads|remotes\/origin)\/([\w\-\.\/]+)/);
    if (m) return m[2];
  } catch {}
  return 'main';
}

async function safeUpdate(dir) {
  await run('git', ['fetch', '--all', '--prune'], dir);
  try {
    await run('git', ['pull', '--ff-only'], dir);
  } catch {
    await run('git', ['pull', '--rebase', '--autostash'], dir);
  }
}

async function forceUpdate(dir) {
  const branch = getCurrentBranch(dir);
  await run('git', ['fetch', '--all', '--prune'], dir);
  await run('git', ['reset', '--hard', `origin/${branch}`], dir);
  await run('git', ['clean', '-fdx'], dir);
}

async function ensureDependencies(install, pmChoice) {
  if (install === 'none') return;
  if (install === 'node' || install === 'all') {
    await run(process.execPath, [path.join('scripts', 'bootstrap.mjs'), '--only', 'node', '--force', '--pm', pmChoice], repoRoot);
  }
  if (install === 'python' || install === 'all') {
    await run(process.execPath, [path.join('scripts', 'bootstrap.mjs'), '--only', 'python', '--force'], repoRoot);
  }
}

async function main() {
  console.log(boxen(chalk.bold.magenta('Sentra Agent Update'), { padding: 1, borderStyle: 'round' }));
  const opts = parseArgs();
  const pm = choosePM(opts.pm);

  if (!isGitRepo(repoRoot)) {
    console.log(chalk.yellow('No git repository detected at repo root, skipping git update.'));
  } else {
    if (opts.mode === 'force') {
      console.log(chalk.yellow('Force updating repository...'));
      await forceUpdate(repoRoot);
    } else {
      console.log(chalk.blue('Safe updating repository...'));
      await safeUpdate(repoRoot);
    }
  }

  await ensureDependencies(opts.install, pm);

  console.log(chalk.green.bold('Update complete.'));
}

main().catch((e) => {
  console.error(chalk.red.bold('Error: ') + (e.message || e));
  process.exit(1);
});
