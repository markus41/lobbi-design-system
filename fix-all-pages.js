/**
 * Comprehensive fix script for Lobbi Design System Gallery
 * Fixes: Navigation counter (to 210), skip links, ARIA labels
 * Run with: node fix-all-pages.js
 */

const fs = require('fs');
const path = require('path');

const designDir = __dirname;
const TOTAL_STYLES = 210;

// Statistics
let stats = {
    navCounterFixed: 0,
    skipLinkAdded: 0,
    ariaLabelsAdded: 0,
    filesProcessed: 0,
    errors: []
};

// Complete style name mapping for all 210 styles
const styleNameMap = {
    // Original 1-90
    1: 'Byzantine Luxury', 2: 'Streamline Moderne', 3: 'Quiet Luxury', 4: 'Japandi Glass', 5: 'Swiss Aurora',
    6: 'Deco Cyberpunk', 7: 'Neubrutalism Memphis', 8: 'Scandi Bento', 9: 'Dark Academia', 10: 'Vaporwave Y2K',
    11: 'Solarpunk Biophilic', 12: 'Brutalist Concrete', 13: 'Quiet Luxury Alt', 14: 'Editorial Swiss', 15: 'Private Banking',
    16: 'Architect Portfolio', 17: 'Executive Suite', 18: 'Law Firm Premium', 19: 'Luxury Hotel', 20: 'Investment Fund',
    21: 'Wealth Management', 22: 'Fintech Modern', 23: 'Trading Terminal', 24: 'Insurance Premium', 25: 'Crypto Luxury',
    26: 'Real Estate Luxury', 27: 'Consulting Elite', 28: 'Medical Premium', 29: 'Dental Luxury', 30: 'Pharmaceutical',
    31: 'Engineering Firm', 32: 'Accounting Premium', 33: 'Patent Law', 34: 'HR Enterprise', 35: 'Yacht Club',
    36: 'Golf Resort', 37: 'Spa Wellness', 38: 'Fine Dining', 39: 'Private Aviation', 40: 'Watch Luxury',
    41: 'Jewelry Boutique', 42: 'Art Gallery', 43: 'AI Research', 44: 'Biotech Lab', 45: 'Aerospace',
    46: 'Robotics', 47: 'Quantum Computing', 48: 'Clean Energy', 49: 'Space Industry', 50: 'Cybersecurity',
    51: 'News Editorial', 52: 'Fashion Magazine', 53: 'Literary Journal', 54: 'Music Label', 55: 'Film Studio',
    56: 'Photography Pro', 57: 'Podcast Premium', 58: 'Streaming Platform', 59: 'Board Room', 60: 'Fortune 500',
    61: 'Startup Unicorn', 62: 'Non-Profit Premium', 63: 'University Ivy', 64: 'Think Tank', 65: 'Foundation',
    66: 'Government Civic', 67: 'Auction House', 68: 'Wine Estate', 69: 'Equestrian', 70: 'Luxury Auto',
    71: 'Chamber of Commerce', 72: 'Trade Association', 73: 'Professional Society', 74: 'Alumni Association', 75: 'Bar Association',
    76: 'Medical Association', 77: 'Realtors Association', 78: 'Rotary Service Club', 79: 'Credit Union League', 80: 'HOA Management',
    81: 'Teachers Union', 82: 'Nonprofit Alliance', 83: 'Sports League', 84: 'Veterans Organization', 85: 'Religious Denomination',
    86: 'Fraternal Organization', 87: 'Industry Council', 88: 'Cooperative Association', 89: 'Professional Network', 90: 'Membership Collective',
    // 3-Way Blends 91-120
    91: 'Enterprise SaaS', 92: 'Nordic Minimal', 93: 'Luxury Concierge', 94: 'Cyber Command', 95: 'Organic Wellness',
    96: 'Investment Elite', 97: 'Creative Studio', 98: 'Academic Research', 99: 'Sports Premium', 100: 'Heritage Society',
    101: 'Quantum Lab', 102: 'Maritime Guild', 103: 'Artisan Collective', 104: 'Aviation Elite', 105: 'Music Conservatory',
    106: 'Green Energy', 107: 'Legal Summit', 108: 'Culinary Guild', 109: 'Architecture Forum', 110: 'Philanthropy Circle',
    111: 'eSports Arena', 112: 'Wine Society', 113: 'Blockchain DAO', 114: 'Healthcare Network', 115: 'Fashion Council',
    116: 'Motorsport Club', 117: 'Diplomatic Corps', 118: 'Startup Accelerator', 119: 'Meditation Sangha', 120: 'Space Pioneers',
    // 4+ Way Experimental 121-135
    121: 'Civic Innovation Hub', 122: 'Democratic Transparency', 123: 'Public Service Excellence', 124: 'Regulatory Modernization', 125: 'Impact Collective',
    126: 'Philanthropic Legacy', 127: 'Community Catalyst', 128: 'Advocacy Alliance', 129: 'Member Ecosystem', 130: 'Credential Authority',
    131: 'Industry Council Evolution', 132: 'Membership Renaissance', 133: 'Professional Guild Modern', 134: 'Association Intelligence', 135: 'Global Standards Body',
    // 2-Way Premium 136-140
    136: 'Minimal Wellness', 137: 'Heritage Modernist', 138: 'Eco-Luxury Refined', 139: 'Artisan Contemporary', 140: 'Accessible Professional Plus',
    // Historical & Classical 141-152
    141: 'Art Nouveau Elegance', 142: 'Gothic Revival Digital', 143: 'Victorian Modernist', 144: 'Rococo Digital Garden',
    145: 'Neoclassical Authority', 146: 'Renaissance Revival', 147: 'Medieval Guild Hall', 148: 'Baroque Grandeur',
    149: 'Roman Empire Digital', 150: 'Ancient Egyptian Luxe', 151: 'Byzantine Contemporary', 152: 'Colonial American Heritage',
    // Cultural & Regional 153-164
    153: 'Japanese Wabi-Sabi', 154: 'Scandinavian Hygge', 155: 'Moroccan Geometric', 156: 'Indian Mughal Luxury',
    157: 'Chinese Imperial', 158: 'Greek Mediterranean', 159: 'African Kente', 160: 'Celtic Heritage',
    161: 'Persian Carpet', 162: 'Mexican Folk Art', 163: 'Nordic Rune', 164: 'Brazilian Carnival',
    // Digital UI & Illustration 165-176
    165: 'Flat Design 2.0', 166: 'Skeuomorphic Revival', 167: 'Isometric Illustration', 168: 'Line Art Minimal',
    169: 'Gradient Mesh UI', 170: 'Duotone Photography', 171: 'Low Poly 3D', 172: 'Watercolor Digital',
    173: 'Comic Book Pop', 174: 'Pixel Art Retro', 175: 'Sticker Playful', 176: 'Blueprint Technical',
    // Retro & Nostalgic 177-188
    177: '1950s Diner', 178: '1960s Mod', 179: '1970s Disco', 180: '1980s Synthwave',
    181: '1990s Grunge', 182: 'Y2K Millennium', 183: 'Vintage Americana', 184: 'Art Deco Golden',
    185: 'Vintage Cinema', 186: 'Retro Computing', 187: 'Victorian Steampunk', 188: 'Mid-Century Modern',
    // Texture, Motion & Gaming 189-200
    189: 'Paper Texture', 190: 'Concrete Brutalist', 191: 'Wood Grain Natural', 192: 'Marble Luxury',
    193: 'Kinetic Typography', 194: 'Parallax Depth', 195: 'Liquid Motion', 196: 'Micro-Interaction Rich',
    197: 'RPG Fantasy', 198: 'Sci-Fi HUD', 199: 'Casual Mobile', 200: 'Esports Arena',
    // Light, Dark & Emerging 201-210
    201: 'Pure Light Minimal', 202: 'Warm Light Natural', 203: 'Cool Light Professional', 204: 'True Dark Mode',
    205: 'Elevated Dark', 206: 'AI Native Interface', 207: 'Neural Network', 208: 'Spatial Computing',
    209: 'Generative Art', 210: 'Sustainable Digital'
};

// Skip link CSS and HTML to inject
const skipLinkCSS = `
        /* Skip Link for Accessibility */
        .skip-link {
            position: absolute;
            top: -100px;
            left: 0;
            background: #000;
            color: #fff;
            padding: 0.75rem 1.5rem;
            z-index: 10001;
            text-decoration: none;
            font-weight: 600;
            border-radius: 0 0 4px 0;
            transition: top 0.3s ease;
        }
        .skip-link:focus {
            top: 0;
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }`;

const skipLinkHTML = `<a href="#main-content" class="skip-link">Skip to main content</a>`;

// ARIA label for gallery nav
const ariaNavLabel = ' aria-label="Gallery navigation"';

// Get all style files
function getStyleFiles() {
    return fs.readdirSync(designDir)
        .filter(f => f.match(/^style-\d+-.*\.html$/))
        .sort((a, b) => {
            const numA = parseInt(a.match(/style-(\d+)/)[1]);
            const numB = parseInt(b.match(/style-(\d+)/)[1]);
            return numA - numB;
        });
}

// Fix navigation counter from various old values to 210
function fixNavCounter(content, styleNum) {
    let modified = false;

    // Fix "of 70", "of 120", "of 135", "of 140" to "of 210"
    const oldCounters = ['of 70', 'of 120', 'of 135', 'of 140'];
    oldCounters.forEach(oldVal => {
        if (content.includes(oldVal)) {
            content = content.replace(new RegExp(oldVal.replace(/\s/g, '\\s*'), 'g'), 'of 210');
            modified = true;
        }
    });

    // Also fix nextNum boundary check (< 140 -> < 210)
    if (content.includes('styleNum < 140')) {
        content = content.replace(/styleNum < 140/g, 'styleNum < 210');
        modified = true;
    }
    if (content.includes('< 140 ?')) {
        content = content.replace(/< 140 \?/g, '< 210 ?');
        modified = true;
    }

    return { content, modified };
}

// Add skip link if missing
function addSkipLink(content) {
    if (content.includes('skip-link') || content.includes('Skip to main content')) {
        return { content, added: false };
    }

    // Find the last </style> to inject CSS
    const styleCloseIndex = content.lastIndexOf('</style>');
    if (styleCloseIndex === -1) {
        return { content, added: false };
    }

    // Add CSS before </style>
    content = content.slice(0, styleCloseIndex) + skipLinkCSS + '\n    ' + content.slice(styleCloseIndex);

    // Find <body> tag to inject HTML
    const bodyMatch = content.match(/<body[^>]*>/);
    if (!bodyMatch) {
        return { content, added: false };
    }

    const bodyIndex = content.indexOf(bodyMatch[0]) + bodyMatch[0].length;
    content = content.slice(0, bodyIndex) + '\n    ' + skipLinkHTML + content.slice(bodyIndex);

    // Add id="main-content" to first main or section element if not present
    if (!content.includes('id="main-content"')) {
        // Try to add to <main> or first major content container
        if (content.includes('<main') && !content.includes('<main id="main-content"')) {
            content = content.replace(/<main([^>]*)>/, '<main$1 id="main-content">');
        } else if (content.includes('class="container"') && !content.includes('id="main-content"')) {
            // Add to first container
            content = content.replace(/class="container"/, 'id="main-content" class="container"');
        }
    }

    return { content, added: true };
}

// Add ARIA label to gallery nav if missing
function addAriaLabel(content) {
    if (content.includes('class="gallery-nav"') && !content.includes('aria-label="Gallery navigation"')) {
        content = content.replace(
            /<nav class="gallery-nav"/g,
            '<nav class="gallery-nav" aria-label="Gallery navigation"'
        );
        return { content, added: true };
    }
    return { content, added: false };
}

// Process a single file
function processFile(file) {
    const filePath = path.join(designDir, file);
    let content;

    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        stats.errors.push({ file, error: `Read error: ${err.message}` });
        return;
    }

    const numMatch = file.match(/style-(\d+)/);
    if (!numMatch) {
        stats.errors.push({ file, error: 'Could not parse style number' });
        return;
    }

    const styleNum = parseInt(numMatch[1]);
    let modified = false;

    // Fix 1: Navigation counter
    const navFix = fixNavCounter(content, styleNum);
    if (navFix.modified) {
        content = navFix.content;
        stats.navCounterFixed++;
        modified = true;
    }

    // Fix 2: Skip link
    const skipFix = addSkipLink(content);
    if (skipFix.added) {
        content = skipFix.content;
        stats.skipLinkAdded++;
        modified = true;
    }

    // Fix 3: ARIA labels
    const ariaFix = addAriaLabel(content);
    if (ariaFix.added) {
        content = ariaFix.content;
        stats.ariaLabelsAdded++;
        modified = true;
    }

    // Write back if modified
    if (modified) {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✓ Fixed ${file}`);
        } catch (err) {
            stats.errors.push({ file, error: `Write error: ${err.message}` });
        }
    } else {
        console.log(`  - Skipped ${file} (no changes needed)`);
    }

    stats.filesProcessed++;
}

// Main execution
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  LOBBI DESIGN SYSTEM - COMPREHENSIVE PAGE FIX                 ║');
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log('║  Fixes: Navigation Counter, Skip Links, ARIA Labels           ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const files = getStyleFiles();
console.log(`Found ${files.length} style files to process...\n`);

files.forEach(processFile);

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('                        SUMMARY                                 ');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`Files Processed:      ${stats.filesProcessed}`);
console.log(`Nav Counter Fixed:    ${stats.navCounterFixed}`);
console.log(`Skip Links Added:     ${stats.skipLinkAdded}`);
console.log(`ARIA Labels Added:    ${stats.ariaLabelsAdded}`);

if (stats.errors.length > 0) {
    console.log(`\nErrors (${stats.errors.length}):`);
    stats.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
}

console.log('\n✅ Complete! All pages have been improved.');
