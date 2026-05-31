import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const logoPath = path.join(process.cwd(), 'public', 'logo.png');
const publicDir = path.join(process.cwd(), 'public');

async function generateAssets() {
  try {
    // Check if logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('Logo not found at', logoPath);
      return;
    }

    console.log('Generating assets from', logoPath);

    // Generate favicons
    await sharp(logoPath).resize(16, 16).toFile(path.join(publicDir, 'favicon-16x16.png'));
    await sharp(logoPath).resize(32, 32).toFile(path.join(publicDir, 'favicon-32x32.png'));
    await sharp(logoPath).resize(48, 48).toFile(path.join(publicDir, 'favicon-48x48.png'));
    
    // Copy the 32x32 as favicon.ico for fallback (rename trick for some servers, or just use 32x32 png in html)
    await sharp(logoPath).resize(32, 32).toFile(path.join(publicDir, 'favicon.ico'));

    // Generate PWA icons
    await sharp(logoPath).resize(192, 192).toFile(path.join(publicDir, 'icon-192x192.png'));
    await sharp(logoPath).resize(512, 512).toFile(path.join(publicDir, 'icon-512x512.png'));
    await sharp(logoPath).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));

    console.log('Assets generated successfully!');
  } catch (err) {
    console.error('Error generating assets:', err);
  }
}

generateAssets();
