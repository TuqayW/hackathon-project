const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// SSL certificate paths
const certPath = path.join(__dirname, 'certificates');
const keyPath = path.join(certPath, 'localhost-key.pem');
const certFilePath = path.join(certPath, 'localhost.pem');

const app = next({ dev, hostname });
const handle = app.getRequestHandler();

// Check if certificates exist
if (!fs.existsSync(keyPath) || !fs.existsSync(certFilePath)) {
  console.error('\n❌ SSL certificates not found!');
  console.log('\n📝 Please run: npm run setup-https');
  console.log('   This will generate SSL certificates for local HTTPS.\n');
  process.exit(1);
}

app.prepare().then(() => {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certFilePath),
  };

  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, () => {
    console.log(`\n✅ Ready on https://${hostname}:${port}\n`);
    console.log('🔒 HTTPS is enabled - PWA features will work!\n');
    console.log('📱 To test on mobile:');
    console.log('   1. Find your local IP address (run: ipconfig on Windows)');
    console.log('   2. Access: https://YOUR_IP:3000');
    console.log('   3. Accept the security warning\n');
  });
});

