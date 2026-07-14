import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputFile = 'src/assets/logo.png';
const outDir = 'public/icons';
const rootDir = 'public';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
const faviconSizes = [16, 32, 48];

async function generate() {
  // Generate PWA icons
  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .toFile(path.join(outDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Generate favicons
  for (const size of faviconSizes) {
    await sharp(inputFile)
      .resize(size, size)
      .toFile(path.join(rootDir, `favicon-${size}x${size}.png`));
    console.log(`Generated favicon-${size}x${size}.png`);
  }
  
  // Apple touch icon
  await sharp(inputFile)
    .resize(180, 180)
    .toFile(path.join(rootDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
  
  // favicon.ico (fallback to 32x32 png as ico or just rename)
  await sharp(inputFile)
    .resize(32, 32)
    .toFile(path.join(rootDir, 'favicon.ico'));
  console.log('Generated favicon.ico');
  
  // Android chrome icons
  await sharp(inputFile)
    .resize(192, 192)
    .toFile(path.join(rootDir, 'android-chrome-192x192.png'));
  await sharp(inputFile)
    .resize(512, 512)
    .toFile(path.join(rootDir, 'android-chrome-512x512.png'));
  console.log('Generated android chrome icons');
}

generate().catch(console.error);
