/**
 * Setup HTTPS certificates for local development
 * 
 * This script generates self-signed SSL certificates for localhost
 * Run: npm run setup-https
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, '..', 'certificates');
const keyPath = path.join(certDir, 'localhost-key.pem');
const certPath = path.join(certDir, 'localhost.pem');

// Create certificates directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log('📁 Created certificates directory\n');
}

// Check if OpenSSL is available
try {
  execSync('openssl version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ OpenSSL is not installed or not in PATH');
  console.log('\n📝 Please install OpenSSL:');
  console.log('   Windows: Download from https://slproweb.com/products/Win32OpenSSL.html');
  console.log('   macOS: Already installed (or: brew install openssl)');
  console.log('   Linux: sudo apt-get install openssl\n');
  process.exit(1);
}

// Generate certificates if they don't exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('✅ SSL certificates already exist\n');
  console.log('   To regenerate, delete the certificates directory first.\n');
  process.exit(0);
}

console.log('🔐 Generating SSL certificates for localhost...\n');

try {
  // Generate private key
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`,
    { stdio: 'inherit' }
  );

  console.log('\n✅ SSL certificates generated successfully!\n');
  console.log('📝 Next steps:');
  console.log('   1. Run: npm run dev:https');
  console.log('   2. Open: https://localhost:3000');
  console.log('   3. Accept the security warning (self-signed certificate)\n');
  console.log('⚠️  Note: You may see a security warning in your browser.');
  console.log('   This is normal for self-signed certificates. Click "Advanced"');
  console.log('   and "Proceed to localhost" to continue.\n');
} catch (error) {
  console.error('\n❌ Failed to generate certificates:', error.message);
  process.exit(1);
}

