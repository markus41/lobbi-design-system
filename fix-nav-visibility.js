/**
 * Fix navigation visibility - Make gallery nav always visible by default
 * This fixes the "Back to Gallery" button not being accessible
 */

const fs = require('fs');
const path = require('path');

const designDir = __dirname;
let fixed = 0;
let skipped = 0;

// Get all style files
const files = fs.readdirSync(designDir)
    .filter(f => f.match(/^style-\d+-.*\.html$/))
    .sort((a, b) => {
        const numA = parseInt(a.match(/style-(\d+)/)[1]);
        const numB = parseInt(b.match(/style-(\d+)/)[1]);
        return numA - numB;
    });

console.log(`Found ${files.length} style files to fix navigation visibility...\n`);

files.forEach(file => {
    const filePath = path.join(designDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix 1: Change default nav state to visible (remove transform: translateY(-100%))
    // Replace the hidden-by-default CSS with always-visible
    if (content.includes('transform: translateY(-100%);')) {
        content = content.replace(
            /\.gallery-nav \{([^}]*?)transform: translateY\(-100%\);/g,
            '.gallery-nav {$1transform: translateY(0);'
        );
        modified = true;
    }

    // Fix 2: Update the JavaScript to not auto-hide
    // Replace the auto-hide timeout with a much longer one or remove it
    if (content.includes("hideTimeout = setTimeout(() => nav.classList.remove('visible'), 3000)")) {
        content = content.replace(
            /hideTimeout = setTimeout\(\(\) => nav\.classList\.remove\('visible'\), 3000\)/g,
            "hideTimeout = setTimeout(() => nav.classList.remove('visible'), 30000)" // 30 seconds instead of 3
        );
        modified = true;
    }

    // Fix 3: Make sure nav starts with visible class
    if (content.includes('<nav class="gallery-nav"') && !content.includes('<nav class="gallery-nav visible"')) {
        content = content.replace(
            /<nav class="gallery-nav"/g,
            '<nav class="gallery-nav visible"'
        );
        modified = true;
    }

    // Fix 4: Also handle nav with aria-label
    if (content.includes('<nav class="gallery-nav" aria-label') && !content.includes('<nav class="gallery-nav visible" aria-label')) {
        content = content.replace(
            /<nav class="gallery-nav" aria-label/g,
            '<nav class="gallery-nav visible" aria-label'
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ Fixed ${file}`);
        fixed++;
    } else {
        console.log(`  - Skipped ${file} (already fixed or different structure)`);
        skipped++;
    }
});

console.log(`\n✅ Complete! Fixed ${fixed} files, skipped ${skipped} files.`);
console.log('Navigation is now always visible by default.');
