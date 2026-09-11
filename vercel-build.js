const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'public');
const files = ['index.html', 'services.html', 'style.css', 'script.js'];
const directories = ['assets', 'image'];

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const file of files) {
    fs.copyFileSync(path.join(__dirname, file), path.join(outputDir, file));
}

for (const directory of directories) {
    fs.cpSync(path.join(__dirname, directory), path.join(outputDir, directory), { recursive: true });
}

console.log(`Static site copied to ${outputDir}`);