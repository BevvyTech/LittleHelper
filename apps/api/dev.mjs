import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entryPoint = path.join(__dirname, 'src/server/server.ts');
const outFile = path.join(__dirname, 'dist/server/server.js');

let serverProcess = null;

const startServer = () => {
  serverProcess = spawn('node', [outFile], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: process.env.NODE_ENV ?? 'development' },
  });

  serverProcess.on('exit', (code, signal) => {
    // Keep a small hint in logs when the process stops unexpectedly.
    if (signal) {
      console.warn(`API server exited due to signal ${signal}`);
    } else if (code && code !== 0) {
      console.warn(`API server exited with code ${code}`);
    }
  });
};

const stopServer = () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
};

const restartServer = () => {
  stopServer();
  startServer();
};

async function getEsbuild() {
  try {
    return await import('esbuild');
  } catch {
    // Fallback to the workspace-level esbuild bundled by other tools.
    const fallback = '../../node_modules/.pnpm/esbuild@0.21.5/node_modules/esbuild/lib/main.js';
    return import(pathToFileURL(path.join(__dirname, fallback)).href);
  }
}

async function main() {
  const esbuild = await getEsbuild();
  await mkdir(path.dirname(outFile), { recursive: true });

  let firstBuild = true;

  const ctx = await esbuild.context({
    entryPoints: [entryPoint],
    bundle: false,
    packages: 'external',
    platform: 'node',
    format: 'esm',
    sourcemap: true,
    outfile: outFile,
    target: 'node20',
    logLevel: 'info',
    plugins: [
      {
        name: 'start-api-after-build',
        setup(build) {
          build.onEnd((result) => {
            if (result.errors.length > 0) {
              console.error('API rebuild failed:', result.errors);
              return;
            }

            if (firstBuild) {
              startServer();
              firstBuild = false;
            } else {
              console.log('API rebuilt, restarting server...');
              restartServer();
            }
          });
        },
      },
    ],
  });

  await ctx.watch();

  const cleanup = async () => {
    stopServer();
    await ctx.dispose();
    process.exit();
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
