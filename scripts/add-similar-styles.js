#!/usr/bin/env node

/**
 * Add Similar Styles Feature
 *
 * This script adds a "Similar Styles" section to all 210 style pages,
 * showing 3-4 related styles based on shared tags.
 */

const fs = require('fs');
const path = require('path');

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

    // Parse the styles array
    const styles = [];
    const styleRegex = /\{\s*num:\s*(\d+),\s*name:\s*"([^"]+)",\s*blend:\s*"([^"]+)",\s*tags:\s*\[([^\]]+)\],\s*temp:\s*(\d+),\s*formality:\s*(\d+),\s*preview:\s*"([^"]+)",\s*file:\s*"([^"]+)"\s*\}/g;

    let match;
    while ((match = styleRegex.exec(stylesArrayStr)) !== null) {
        const [, num, name, blend, tagsStr, temp, formality, preview, file] = match;
        const tags = tagsStr.split(',').map(t => t.trim().replace(/['"]/g, ''));

        styles.push({
            num: parseInt(num),
            name,
            blend,
            tags,
            temp: parseInt(temp),
            formality: parseInt(formality),
            preview,
            file
        });
    }

    console.log(`Extracted ${styles.length} styles from index.html`);
    return styles;
}

// Find similar styles based on tag overlap
function findSimilarStyles(currentStyle, allStyles, count = 4) {
    const similarities = allStyles
        .filter(s => s.num !== currentStyle.num) // Exclude current style
        .map(style => {
            // Count shared tags
            const sharedTags = style.tags.filter(tag => currentStyle.tags.includes(tag));
            const sharedCount = sharedTags.length;

            // Check if first tag matches (primary category)
            const primaryMatch = style.tags[0] === currentStyle.tags[0] ? 1 : 0;

            // Calculate similarity score
            const score = (sharedCount * 10) + (primaryMatch * 5);

            return {
                style,
                score,
                sharedTags: sharedTags.length
            };
        })
        .filter(item => item.sharedTags >= 1) // At least 1 shared tag
        .sort((a, b) => {
            // Sort by score, then by style number
            if (b.score !== a.score) return b.score - a.score;
            return a.style.num - b.style.num;
        })
        .slice(0, count)
        .map(item => item.style);

    return similarities;
}

// Generate color gradient from style metadata
function generateGradient(style) {
    // Create a deterministic gradient based on style number and tags
    const hue1 = (style.num * 137.5) % 360; // Golden angle distribution
    const hue2 = (hue1 + 60) % 360;

    const saturation = style.tags.includes('premium') ? '70%' : '50%';
    const lightness = style.tags.includes('heritage') || style.tags.includes('academic') ? '40%' : '50%';

    return `linear-gradient(135deg, hsl(${hue1}, ${saturation}, ${lightness}), hsl(${hue2}, ${saturation}, ${lightness}))`;
}

// Generate similar styles HTML
function generateSimilarStylesHTML(similarStyles) {
    const cards = similarStyles.map(style => {
        const gradient = generateGradient(style);
        return `        <a href="${style.file}" class="similar-style-card">
            <div class="similar-preview" style="background: ${gradient}"></div>
            <span class="similar-name">${style.name}</span>
        </a>`;
    }).join('\n');

    return `
<!-- Similar Styles Section -->
<div class="similar-styles-section">
    <h3 class="similar-styles-title">Similar Styles</h3>
    <div class="similar-styles-grid">
${cards}
    </div>
</div>`;
}

// CSS for similar styles section
const similarStylesCSS = `
/* Similar Styles Section */
.similar-styles-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    padding: 1rem 2rem;
    z-index: 999;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.similar-styles-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0.75rem;
}

.similar-styles-grid {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
}

.similar-style-card {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    flex-shrink: 0;
    width: 120px;
}

.similar-preview {
    width: 120px;
    height: 75px;
    border-radius: 0.375rem;
    margin-bottom: 0.375rem;
}

.similar-name {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.similar-style-card:hover .similar-name {
    color: #60a5fa;
}`;

// Add similar styles to a single HTML file
function addSimilarStylesToFile(filePath, currentStyle, similarStyles) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if similar styles section already exists
    if (content.includes('<!-- Similar Styles Section -->')) {
        console.log(`  ⚠️  Similar styles already exist in ${path.basename(filePath)}, skipping...`);
        return false;
    }

    // Add CSS if not already present
    if (!content.includes('/* Similar Styles Section */')) {
        // Find the closing </style> tag
        const styleCloseIndex = content.lastIndexOf('</style>');
        if (styleCloseIndex === -1) {
            console.log(`  ❌ Could not find </style> tag in ${path.basename(filePath)}`);
            return false;
        }

        content = content.slice(0, styleCloseIndex) + similarStylesCSS + '\n    ' + content.slice(styleCloseIndex);
    }

    // Generate and add similar styles HTML
    const similarStylesHTML = generateSimilarStylesHTML(similarStyles);

    // Add before closing </body> tag
    const bodyCloseIndex = content.lastIndexOf('</body>');
    if (bodyCloseIndex === -1) {
        console.log(`  ❌ Could not find </body> tag in ${path.basename(filePath)}`);
        return false;
    }

    content = content.slice(0, bodyCloseIndex) + similarStylesHTML + '\n\n' + content.slice(bodyCloseIndex);

    // Write the updated content
    fs.writeFileSync(filePath, content, 'utf-8');

    return true;
}

// Main function
function main() {
    console.log('🎨 Adding Similar Styles Feature to all style pages...\n');

    try {
        // Extract style data from index.html
        const styles = extractStyleData();

        if (styles.length === 0) {
            console.error('❌ No styles found in index.html');
            process.exit(1);
        }

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        // Process each style
        styles.forEach((style, index) => {
            const filePath = path.join(__dirname, '..', style.file);

            if (!fs.existsSync(filePath)) {
                console.log(`❌ File not found: ${style.file}`);
                errorCount++;
                return;
            }

            // Find similar styles
            const similarStyles = findSimilarStyles(style, styles, 4);

            if (similarStyles.length === 0) {
                console.log(`  ⚠️  No similar styles found for Style ${style.num}: ${style.name}`);
            }

            // Add similar styles to the file
            console.log(`Processing Style ${style.num}: ${style.name}...`);
            console.log(`  Found ${similarStyles.length} similar styles: ${similarStyles.map(s => s.num).join(', ')}`);

            const result = addSimilarStylesToFile(filePath, style, similarStyles);

            if (result) {
                successCount++;
                console.log(`  ✅ Added similar styles`);
            } else {
                skipCount++;
            }

            console.log('');
        });

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary:');
        console.log(`  ✅ Successfully updated: ${successCount} files`);
        console.log(`  ⚠️  Skipped (already exists): ${skipCount} files`);
        console.log(`  ❌ Errors: ${errorCount} files`);
        console.log(`  📁 Total processed: ${styles.length} files`);
        console.log('='.repeat(60));

        if (successCount > 0) {
            console.log('\n✨ Similar Styles feature has been added successfully!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { extractStyleData, findSimilarStyles, generateGradient };
