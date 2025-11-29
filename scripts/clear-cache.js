/**
 * Clear Next.js and TypeScript build caches
 * Run: node scripts/clear-cache.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const dirsToRemove = [
  path.join(rootDir, '.next'),
  path.join(rootDir, 'node_modules', '.cache'),
  path.join(rootDir, '.turbo'),
];

console.log('🧹 Clearing build caches...\n');

dirsToRemove.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ Removed: ${path.basename(dir)}`);
    } catch (error) {
      console.log(`⚠️  Could not remove: ${path.basename(dir)} - ${error.message}`);
    }
  } else {
    console.log(`ℹ️  Not found: ${path.basename(dir)}`);
  }
});

console.log('\n✅ Cache cleared!');
console.log('\n📝 Next steps:');
console.log('   1. Restart your TypeScript server in your IDE');
console.log('   2. Run: npm run build');
console.log('');

