#!/usr/bin/env node
/**
 * Generate Missing Data Files
 * Creates similar-styles.json, style-fits.json, and completes style-colors.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Extract style data from index.html
function extractStyleData() {
    const indexPath = path.join(__dirname, '..', 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    // Extract the styles array from the JavaScript
    const stylesMatch = indexContent.match(/const styles = \[([\s\S]*?)\];/);
    if (!stylesMatch) {
        throw new Error('Could not find styles array in index.html');
    }

    const stylesArrayStr = '[' + stylesMatch[1] + ']';

    // Parse the styles array - updated regex to match actual format
    const styles = [];
    const styleRegex = /\{\s*num:\s*(\d+),\s*name:\s*"([^"]+)",\s*blend:\s*"([^"]+)",\s*tags:\s*\[([^\]]+)\],\s*temp:\s*(\d+),\s*formality:\s*(\d+),\s*preview:\s*"([^"]+)",\s*perfectFor:\s*\[([^\]]*)\],\s*file:\s*"([^"]+)"\s*\}/g;

    let match;
    while ((match = styleRegex.exec(stylesArrayStr)) !== null) {
        const [, num, name, blend, tagsStr, temp, formality, preview, perfectForStr, file] = match;
        const tags = tagsStr.split(',').map(t => t.trim().replace(/['"]/g, ''));
        const perfectFor = perfectForStr.split(',').map(t => t.trim().replace(/['"]/g, '')).filter(t => t);

        styles.push({
            num: parseInt(num),
            name,
            blend,
            tags,
            temp: parseInt(temp),
            formality: parseInt(formality),
            preview,
            perfectFor,
            file
        });
    }

    console.log(`📊 Extracted ${styles.length} styles from index.html`);
    return styles;
}

// Find similar styles based on tag overlap
function findSimilarStyles(currentStyle, allStyles, count = 4) {
    const similarities = allStyles
        .filter(s => s.num !== currentStyle.num)
        .map(style => {
            const sharedTags = style.tags.filter(tag => currentStyle.tags.includes(tag));
            const sharedCount = sharedTags.length;
            const primaryMatch = style.tags[0] === currentStyle.tags[0] ? 1 : 0;
            const tempDiff = Math.abs(style.temp - currentStyle.temp);
            const formalityDiff = Math.abs(style.formality - currentStyle.formality);

            // Calculate similarity score
            const score = (sharedCount * 10) + (primaryMatch * 5) - tempDiff - formalityDiff;

            return { style, score, sharedTags: sharedTags.length };
        })
        .filter(item => item.sharedTags >= 1)
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .map(item => item.style.num);

    return similarities;
}

// Generate "Perfect for" recommendations based on tags
function generatePerfectFor(style) {
    const fits = [];
    const tags = style.tags;

    const tagToFits = {
        'premium': ['Luxury membership organizations', 'Executive boards', 'VIP services'],
        'professional': ['Corporate associations', 'Professional societies', 'B2B platforms'],
        'creative': ['Design agencies', 'Art galleries', 'Creative studios'],
        'technology': ['Tech startups', 'SaaS platforms', 'Digital products'],
        'heritage': ['Heritage societies', 'Historical organizations', 'Cultural institutions'],
        'hospitality': ['Hotels & resorts', 'Restaurants', 'Wellness centers'],
        'academic': ['Universities', 'Research institutions', 'Think tanks'],
        'media': ['Publishers', 'Broadcasting', 'Entertainment'],
        'association': ['Trade associations', 'Chambers of commerce', 'Professional networks'],
        'finance': ['Investment firms', 'Banking', 'Wealth management'],
        'health': ['Healthcare networks', 'Medical associations', 'Wellness brands'],
        'legal': ['Law firms', 'Bar associations', 'Legal services'],
        'real-estate': ['Real estate agencies', 'Property developers', 'HOAs'],
        'sports': ['Sports leagues', 'Athletic clubs', 'Fitness centers'],
        'nonprofit': ['Foundations', 'Charities', 'NGOs'],
        'government': ['Government agencies', 'Civic organizations', 'Public services'],
        'religious': ['Religious organizations', 'Faith communities', 'Spiritual centers'],
        'education': ['Schools', 'Training centers', 'Educational platforms'],
        'energy': ['Energy companies', 'Sustainability orgs', 'Clean tech'],
        'aerospace': ['Aviation companies', 'Space industry', 'Defense contractors'],
        'automotive': ['Auto manufacturers', 'Motorsports', 'Dealerships'],
        'food': ['Culinary guilds', 'Food industry', 'Restaurant groups'],
        'fashion': ['Fashion houses', 'Boutiques', 'Style councils'],
        'art': ['Art institutions', 'Museums', 'Cultural foundations'],
        'music': ['Music labels', 'Orchestras', 'Conservatories'],
        'gaming': ['Esports', 'Gaming platforms', 'Entertainment tech'],
        'web3': ['DAOs', 'Crypto projects', 'Blockchain platforms']
    };

    // Get fits from primary tags
    for (const tag of tags) {
        if (tagToFits[tag]) {
            fits.push(...tagToFits[tag]);
        }
    }

    // Add based on temperature/formality
    if (style.temp >= 7) {
        fits.push('Warm, inviting brands');
    }
    if (style.formality >= 8) {
        fits.push('Formal institutional identity');
    }
    if (style.formality <= 4) {
        fits.push('Casual, approachable brands');
    }

    // Dedupe and limit
    return [...new Set(fits)].slice(0, 5);
}

// Generate color palette for missing styles
function generateColorForStyle(styleNum, styleName) {
    // Use golden angle distribution for unique hues
    const hue1 = (styleNum * 137.5) % 360;
    const hue2 = (hue1 + 120) % 360;
    const hue3 = (hue1 + 240) % 360;

    // Convert HSL to hex
    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    // Generate 4 colors: primary, accent, background, text
    const primary = hslToHex(hue1, 60, 40);
    const accent = hslToHex(hue2, 70, 50);
    const background = hslToHex(hue3, 10, 95);
    const text = hslToHex(hue1, 30, 20);

    return [primary, accent, background, text];
}

// Main function
function main() {
    console.log('\n🎨 Lobbi Design System - Generate Data Files\n');
    console.log('━'.repeat(50));

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    try {
        const styles = extractStyleData();

        // 1. Generate similar-styles.json
        console.log('\n📁 Generating similar-styles.json...');
        const similarStyles = {};
        for (const style of styles) {
            similarStyles[style.num] = findSimilarStyles(style, styles, 4);
        }
        fs.writeFileSync(
            path.join(DATA_DIR, 'similar-styles.json'),
            JSON.stringify(similarStyles, null, 2)
        );
        console.log(`   ✅ Created similar-styles.json with ${Object.keys(similarStyles).length} entries`);

        // 2. Generate style-fits.json (use existing perfectFor data if available)
        console.log('\n📁 Generating style-fits.json...');
        const styleFits = {};
        for (const style of styles) {
            // Use existing perfectFor data from index.html if available
            if (style.perfectFor && style.perfectFor.length > 0) {
                styleFits[style.num] = style.perfectFor;
            } else {
                styleFits[style.num] = generatePerfectFor(style);
            }
        }
        fs.writeFileSync(
            path.join(DATA_DIR, 'style-fits.json'),
            JSON.stringify(styleFits, null, 2)
        );
        console.log(`   ✅ Created style-fits.json with ${Object.keys(styleFits).length} entries`);

        // 3. Complete style-colors.json
        console.log('\n📁 Completing style-colors.json...');
        let styleColors = {};
        const colorsPath = path.join(DATA_DIR, 'style-colors.json');

        if (fs.existsSync(colorsPath)) {
            styleColors = JSON.parse(fs.readFileSync(colorsPath, 'utf-8'));
        }

        let addedCount = 0;
        for (const style of styles) {
            if (!styleColors[style.num]) {
                styleColors[style.num] = generateColorForStyle(style.num, style.name);
                addedCount++;
            }
        }

        // Sort by style number
        const sortedColors = {};
        Object.keys(styleColors)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(key => {
                sortedColors[key] = styleColors[key];
            });

        fs.writeFileSync(colorsPath, JSON.stringify(sortedColors, null, 2));
        console.log(`   ✅ Added ${addedCount} missing color entries`);
        console.log(`   📊 Total: ${Object.keys(sortedColors).length} style colors`);

        // Summary
        console.log('\n' + '━'.repeat(50));
        console.log('\n✨ Data Generation Complete!');
        console.log('   📄 similar-styles.json - Style similarity mappings');
        console.log('   📄 style-fits.json - "Perfect for" recommendations');
        console.log('   📄 style-colors.json - Complete color palettes');
        console.log('\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
