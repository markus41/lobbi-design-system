const fs = require('fs');
const path = require('path');

// HTML for the back button (to be added after <body> tag)
const backButtonHTML = `
<!-- Back to Gallery Navigation -->
<a href="index.html" class="back-to-gallery" aria-label="Back to gallery">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
    Back to Gallery
</a>
`;

// CSS for the back button (to be added before closing </style> tag)
const backButtonCSS = `
/* Back to Gallery Navigation */
.back-to-gallery {
    position: fixed;
    top: 1rem;
    left: 1rem;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    text-decoration: none;
    z-index: 1000;
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.back-to-gallery:hover {
    background: rgba(59, 130, 246, 0.9);
    transform: translateX(-4px);
}

.back-to-gallery svg {
    transition: transform 0.2s;
}

.back-to-gallery:hover svg {
    transform: translateX(-4px);
}
`;

// Recently Viewed tracking script (to be added before </body> tag)
const recentlyViewedScript = `
<!-- Recently Viewed Tracking -->
<script>
(function() {
    var match = location.pathname.match(/style-(\\d+)/);
    if (match) {
        var num = parseInt(match[1]);
        var key = 'lobbi-recent-styles';
        var recent = JSON.parse(localStorage.getItem(key) || '[]');
        recent = recent.filter(function(n) { return n !== num; });
        recent.unshift(num);
        recent = recent.slice(0, 8);
        localStorage.setItem(key, JSON.stringify(recent));
    }
})();
</script>
`;

function processFile(filePath) {
    console.log(`Processing: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already processed
    if (content.includes('<!-- Back to Gallery Navigation -->')) {
        console.log(`  ⏭️  Already has back navigation, skipping...`);
        return;
    }

    // 1. Add CSS before closing </style> tag
    if (!content.includes('.back-to-gallery {')) {
        content = content.replace('</style>', `${backButtonCSS}\n    </style>`);
        console.log(`  ✅ Added back button CSS`);
    }

    // 2. Add back button HTML after opening <body> tag
    // Look for the pattern: <body> followed by whitespace/skip-link
    const bodyMatch = content.match(/(<body>[\s\S]*?)(<a href="#main-content" class="skip-link"|<!-- Gallery Navigation -->|<nav class="gallery-nav"|<header)/);
    if (bodyMatch) {
        const beforeInsert = bodyMatch[1];
        const afterInsert = bodyMatch[2];
        content = content.replace(bodyMatch[0], `${beforeInsert}${backButtonHTML}\n    ${afterInsert}`);
        console.log(`  ✅ Added back button HTML`);
    }

    // 3. Add recently viewed tracking script before </body> tag
    if (!content.includes('<!-- Recently Viewed Tracking -->')) {
        content = content.replace('</body>', `${recentlyViewedScript}\n</body>`);
        console.log(`  ✅ Added recently viewed tracking`);
    }

    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Saved ${filePath}\n`);
}

// Main execution
console.log('🚀 Adding Back to Gallery navigation to all style pages...\n');

// Find all style-*.html files using built-in fs
const files = fs.readdirSync(process.cwd())
    .filter(file => file.match(/^style-\d+.*\.html$/))
    .sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
    });

console.log(`Found ${files.length} style files\n`);

let processed = 0;
let skipped = 0;

files.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('<!-- Back to Gallery Navigation -->')) {
            skipped++;
        } else {
            processFile(fullPath);
            processed++;
        }
    } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
    }
});

console.log('═══════════════════════════════════════');
console.log(`✅ Complete!`);
console.log(`   Processed: ${processed} files`);
console.log(`   Skipped: ${skipped} files (already processed)`);
console.log(`   Total: ${files.length} files`);
console.log('═══════════════════════════════════════');
