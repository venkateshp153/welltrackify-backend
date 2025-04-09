import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const targetPath = path.resolve(fileURLToPath(new URL('./src/controllers/authController.js', import.meta.url)));
console.log('Resolved path:', targetPath);
console.log('File exists:', existsSync(targetPath));

try {
  const module = await import('./src/controllers/authController.js');
  console.log('Import successful!', module);
} catch (e) {
  console.error('Import failed:', e);
}