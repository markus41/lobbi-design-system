/**
 * Script to fix navigation issues in all 135 style demo pages
 *
 * Fixes:
 * 1. Update incorrect total count from "of 70" or "of 120" to "of 140"
 * 2. Add keyboard shortcuts tooltip
 * 3. Add category/tag indicators to navigation
 */

const fs = require('fs');
const path = require('path');

const designDir = __dirname;

// Category mapping for each style (based on groups)
const styleCategories = {
    // Original 12 styles (1-12)
    1: ['luxury', 'heritage'],
    2: ['modern', 'art-deco'],
    3: ['minimal', 'luxury'],
    4: ['minimal', 'zen'],
    5: ['modern', 'swiss'],
    6: ['cyberpunk', 'art-deco'],
    7: ['brutalism', 'playful'],
    8: ['minimal', 'modern'],
    9: ['traditional', 'academic'],
    10: ['retro', 'playful'],
    11: ['eco', 'modern'],
    12: ['brutalism', 'concrete'],

    // Professional Services (13-42)
    13: ['luxury', 'minimal'],
    14: ['swiss', 'editorial'],
    15: ['luxury', 'finance'],
    16: ['professional', 'minimal'],
    17: ['executive', 'luxury'],
    18: ['professional', 'legal'],
    19: ['luxury', 'hospitality'],
    20: ['finance', 'executive'],
    21: ['finance', 'luxury'],
    22: ['finance', 'tech'],
    23: ['finance', 'tech'],
    24: ['finance', 'professional'],
    25: ['finance', 'tech'],
    26: ['luxury', 'real-estate'],
    27: ['professional', 'executive'],
    28: ['healthcare', 'professional'],
    29: ['healthcare', 'luxury'],
    30: ['healthcare', 'professional'],
    31: ['professional', 'technical'],
    32: ['professional', 'finance'],
    33: ['legal', 'professional'],
    34: ['professional', 'corporate'],
    35: ['luxury', 'lifestyle'],
    36: ['luxury', 'lifestyle'],
    37: ['luxury', 'wellness'],
    38: ['luxury', 'hospitality'],
    39: ['luxury', 'aviation'],
    40: ['luxury', 'retail'],
    41: ['luxury', 'retail'],
    42: ['luxury', 'arts'],

    // Tech & Innovation (43-50)
    43: ['tech', 'innovation'],
    44: ['tech', 'science'],
    45: ['tech', 'aerospace'],
    46: ['tech', 'innovation'],
    47: ['tech', 'science'],
    48: ['tech', 'eco'],
    49: ['tech', 'aerospace'],
    50: ['tech', 'security'],

    // Media & Creative (51-58)
    51: ['editorial', 'media'],
    52: ['editorial', 'fashion'],
    53: ['editorial', 'literary'],
    54: ['media', 'creative'],
    55: ['media', 'creative'],
    56: ['media', 'creative'],
    57: ['media', 'creative'],
    58: ['media', 'tech'],

    // Corporate & Institution (59-70)
    59: ['executive', 'corporate'],
    60: ['corporate', 'executive'],
    61: ['tech', 'startup'],
    62: ['nonprofit', 'professional'],
    63: ['education', 'institution'],
    64: ['institution', 'research'],
    65: ['nonprofit', 'institution'],
    66: ['government', 'civic'],
    67: ['luxury', 'auction'],
    68: ['luxury', 'lifestyle'],
    69: ['luxury', 'lifestyle'],
    70: ['luxury', 'automotive'],

    // Association Styles (71-90)
    71: ['association', 'business'],
    72: ['association', 'business'],
    73: ['association', 'professional'],
    74: ['association', 'education'],
    75: ['association', 'legal'],
    76: ['association', 'healthcare'],
    77: ['association', 'real-estate'],
    78: ['association', 'service'],
    79: ['association', 'finance'],
    80: ['association', 'community'],
    81: ['association', 'education'],
    82: ['association', 'nonprofit'],
    83: ['association', 'sports'],
    84: ['association', 'service'],
    85: ['association', 'religious'],
    86: ['association', 'fraternal'],
    87: ['association', 'industry'],
    88: ['association', 'cooperative'],
    89: ['association', 'professional'],
    90: ['association', 'membership'],

    // 3-Way Blends (91-120)
    91: ['tech', 'enterprise', 'saas'],
    92: ['minimal', 'nordic', 'modern'],
    93: ['luxury', 'service', 'concierge'],
    94: ['tech', 'security', 'command'],
    95: ['wellness', 'organic', 'eco'],
    96: ['finance', 'investment', 'luxury'],
    97: ['creative', 'studio', 'media'],
    98: ['research', 'academic', 'education'],
    99: ['sports', 'premium', 'lifestyle'],
    100: ['heritage', 'society', 'institution'],
    101: ['tech', 'science', 'quantum'],
    102: ['maritime', 'guild', 'professional'],
    103: ['artisan', 'collective', 'creative'],
    104: ['aviation', 'luxury', 'elite'],
    105: ['music', 'education', 'arts'],
    106: ['energy', 'eco', 'tech'],
    107: ['legal', 'professional', 'summit'],
    108: ['culinary', 'guild', 'hospitality'],
    109: ['architecture', 'professional', 'forum'],
    110: ['philanthropy', 'nonprofit', 'luxury'],
    111: ['esports', 'tech', 'arena'],
    112: ['wine', 'society', 'luxury'],
    113: ['blockchain', 'tech', 'dao'],
    114: ['healthcare', 'network', 'professional'],
    115: ['fashion', 'council', 'luxury'],
    116: ['motorsport', 'club', 'luxury'],
    117: ['diplomatic', 'corps', 'government'],
    118: ['startup', 'accelerator', 'tech'],
    119: ['meditation', 'wellness', 'spiritual'],
    120: ['space', 'tech', 'pioneers'],

    // 4+ Way Experimental Blends (121-135)
    121: ['civic', 'innovation', 'hub', 'government'],
    122: ['democratic', 'transparency', 'government', 'civic'],
    123: ['public-service', 'excellence', 'government', 'civic'],
    124: ['regulatory', 'modernization', 'government', 'tech'],
    125: ['impact', 'collective', 'nonprofit', 'social'],
    126: ['philanthropic', 'legacy', 'nonprofit', 'institution'],
    127: ['community', 'catalyst', 'civic', 'nonprofit'],
    128: ['advocacy', 'alliance', 'nonprofit', 'civic'],
    129: ['member', 'ecosystem', 'association', 'tech'],
    130: ['credential', 'authority', 'professional', 'certification'],
    131: ['industry', 'council', 'association', 'evolution'],
    132: ['membership', 'renaissance', 'association', 'modern'],
    133: ['professional', 'guild', 'association', 'modern'],
    134: ['association', 'intelligence', 'tech', 'data'],
    135: ['global', 'standards', 'international', 'governance']
};

// Get all style files
const files = fs.readdirSync(designDir)
    .filter(f => f.match(/^style-\d+-.*\.html$/))
    .sort((a, b) => {
        const numA = parseInt(a.match(/style-(\d+)/)[1]);
        const numB = parseInt(b.match(/style-(\d+)/)[1]);
        return numA - numB;
    });

console.log(`Found ${files.length} style files to fix...`);

let updated = 0;
let skipped = 0;

files.forEach(file => {
    const filePath = path.join(designDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Extract style number from filename
    const numMatch = file.match(/style-(\d+)/);
    if (!numMatch) {
        console.log(`  Skipping ${file} (couldn't parse number)`);
        skipped++;
        return;
    }

    const styleNum = parseInt(numMatch[1]);
    let modified = false;

    // FIX 1: Update incorrect "of XX" to "of 140"
    // Match "of 70", "of 120", "of 120+", etc. and replace with "of 140"
    const ofPattern = /(<span class="gallery-nav-title">Style <strong>\d+<\/strong> of )(\d+\+?)( &mdash;)/g;
    const matches = content.match(ofPattern);

    if (matches) {
        const oldContent = content;
        content = content.replace(ofPattern, (match, p1, p2, p3) => {
            // Only replace if it's not already 135
            if (p2 !== '135') {
                console.log(`  Fixed "of ${p2}" to "of 140" in ${file}`);
                modified = true;
                return p1 + '135' + p3;
            }
            return match;
        });
    }

    // FIX 2: Add keyboard shortcuts tooltip after the title span
    // Look for the gallery-nav-title span and add keyboard hints after it
    const navTitlePattern = /(            <span class="gallery-nav-title">Style <strong>\d+<\/strong> of 140 &mdash; [^<]+<\/span>)/;

    if (navTitlePattern.test(content)) {
        // Check if keyboard hints already exist
        if (!content.includes('gallery-nav-hints')) {
            const categories = styleCategories[styleNum] || [];
            const categoryBadges = categories.map(cat =>
                `<span class="category-tag">${cat}</span>`
            ).join('');

            const keyboardHints = `
            <span class="gallery-nav-hints" title="Keyboard Shortcuts">
                <span class="hint-text">← → Navigate • ESC Hide</span>
            </span>`;

            const categoryTags = categoryBadges ? `
            <span class="gallery-nav-categories">
                ${categoryBadges}
            </span>` : '';

            content = content.replace(navTitlePattern, `$1${keyboardHints}${categoryTags}`);
            console.log(`  Added keyboard hints and category tags to ${file}`);
            modified = true;
        }
    }

    // FIX 3: Add CSS for keyboard hints and category tags if not present
    if (modified && !content.includes('.gallery-nav-hints')) {
        const cssInsertPoint = content.indexOf('        @media (max-width: 640px) {');

        if (cssInsertPoint !== -1) {
            const additionalCSS = `        .gallery-nav-hints {
            font-size: 0.6875rem;
            color: rgba(255,255,255,0.5);
            font-weight: 400;
            margin-left: 1rem;
            padding-left: 1rem;
            border-left: 1px solid rgba(255,255,255,0.2);
        }
        .hint-text {
            font-family: 'Courier New', monospace;
        }
        .gallery-nav-categories {
            display: inline-flex;
            gap: 0.25rem;
            margin-left: 1rem;
        }
        .category-tag {
            font-size: 0.625rem;
            padding: 2px 6px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 3px;
            color: rgba(255,255,255,0.6);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
        }
        `;

            content = content.slice(0, cssInsertPoint) + additionalCSS + content.slice(cssInsertPoint);
            console.log(`  Added CSS for hints and tags to ${file}`);
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        updated++;
    } else {
        skipped++;
    }
});

console.log(`\nComplete! Updated ${updated} files, skipped ${skipped} files.`);

// Count how many files have correct count now
const totalStyleFiles = fs.readdirSync(designDir)
    .filter(f => f.match(/^style-\d+-.*\.html$/)).length;

console.log(`\nTotal style files found: ${totalStyleFiles}`);
console.log(`\nChanges made:`);
console.log(`  - Fixed incorrect total count to "of 140"`);
console.log(`  - Added keyboard shortcuts tooltip (← → Navigate • ESC Hide)`);
console.log(`  - Added category tags to navigation`);

if (totalStyleFiles > 135) {
    console.log(`\nNote: Found ${totalStyleFiles} files but configured for 135. Files 136-${totalStyleFiles} exist.`);
}
