const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '../dist');
const version = Date.now().toString();

console.log(`\n빌드 시작 (버전: ${version})\n`);

// 1. 빌드
execSync('npx expo export -p web', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

// 2. sw.js에 버전 주입
const swPath = path.join(DIST, 'sw.js');
const sw = fs.readFileSync(swPath, 'utf8').replace('__BUILD_VERSION__', version);
fs.writeFileSync(swPath, sw);

// 3. 아이콘 복사 (expo export가 public/icons를 복사 안 할 수 있음)
const iconSrc = path.resolve(__dirname, '../public/icons');
const iconDest = path.join(DIST, 'icons');
if (fs.existsSync(iconSrc)) {
  fs.mkdirSync(iconDest, { recursive: true });
  for (const file of fs.readdirSync(iconSrc)) {
    fs.copyFileSync(path.join(iconSrc, file), path.join(iconDest, file));
  }
}

// 4. dist/ git push
console.log('\nGitHub에 배포 중...\n');
execSync('git add -A', { cwd: DIST, stdio: 'inherit' });
execSync(`git commit -m "deploy: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}"`, { cwd: DIST, stdio: 'inherit' });
execSync('git push origin main', { cwd: DIST, stdio: 'inherit' });

console.log('\n배포 완료. 앱 껐다 키면 자동 업데이트됩니다.\n');
