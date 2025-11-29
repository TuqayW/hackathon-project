/**
 * Icon Generation Script
 * 
 * This script generates PWA icons from the SVG source.
 * 
 * To use this script, you'll need to install sharp:
 * npm install --save-dev sharp
 * 
 * Then run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [
  72, 96, 128, 144, 152, 192, 384, 512, 180 // 180 is for apple-touch-icon
];

async function generateIcons() {
  try {
    // Check if sharp is installed
    let sharp;
    try {
      sharp = require('sharp');
    } catch (e) {
      console.error('Error: sharp is not installed.');
      console.log('Please install it with: npm install --save-dev sharp');
      process.exit(1);
    }

    const svgPath = path.join(__dirname, '../public/icon.svg');
    const svgBuffer = fs.readFileSync(svgPath);

    console.log('Generating PWA icons...');

    for (const size of iconSizes) {
      const outputPath = path.join(
        __dirname,
        '../public',
        size === 180 ? 'apple-touch-icon.png' : `icon-${size}x${size}.png`
      );

      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated ${path.basename(outputPath)}`);
    }

    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();

