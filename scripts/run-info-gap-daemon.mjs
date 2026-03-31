import { spawn } from 'node:child_process';

const intervalMinutes = Number(process.env.SCAN_INTERVAL_MINUTES || 360);
const intervalMs = intervalMinutes * 60 * 1000;

function runOnce() {
  return new Promise(resolve => {
    const child = spawn(process.execPath, ['scripts/info-gap-scanner.mjs'], {
      stdio: 'inherit'
    });

    child.on('exit', code => {
      if (code === 0) {
        console.log(`[daemon] 扫描成功 @ ${new Date().toISOString()}`);
      } else {
        console.log(`[daemon] 扫描失败(code=${code}) @ ${new Date().toISOString()}`);
      }
      resolve();
    });
  });
}

async function loop() {
  console.log(`[daemon] 启动，扫描间隔 ${intervalMinutes} 分钟`);
  while (true) {
    await runOnce();
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
}

loop().catch(error => {
  console.error('[daemon] 崩溃', error);
  process.exitCode = 1;
});
