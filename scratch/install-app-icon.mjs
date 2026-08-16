import fs from 'fs';
import path from 'path';

const sourceImage = 'C:\\Users\\shubh\\.gemini\\antigravity\\brain\\b3796beb-3d08-47ff-954f-1ba4ca0ce419\\.user_uploaded\\media_1786893597280.png';
const publicDir = 'c:\\MH Vadhu-Var\\public';

const destinations = [
  path.join(publicDir, 'app-icon.png'),
  path.join(publicDir, 'icon-192.png'),
  path.join(publicDir, 'icon-512.png'),
  path.join(publicDir, 'apple-touch-icon.png'),
  path.join(publicDir, 'favicon.png'),
];

for (const dest of destinations) {
  fs.copyFileSync(sourceImage, dest);
  console.log(`Copied new App Icon to ${dest}`);
}
