// Quick script to update all files from "of 135" to "of 140"
const fs = require('fs');
const path = require('path');

const designDir = __dirname;

const files = fs.readdirSync(designDir)
    .filter(f => f.match(/^style-\d+-.*\.html$/));

let updated = 0;

files.forEach(file => {
    const filePath = path.join(designDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const originalContent = content;
    content = content.replace(/of 135 &mdash;/g, 'of 140 &mdash;');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        updated++;
    }
});

console.log(`Updated ${updated} files from "of 135" to "of 140"`);
