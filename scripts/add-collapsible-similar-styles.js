#!/usr/bin/env node

/**
 * Add Collapsible Feature to Similar Styles Section
 *
 * This script updates the Similar Styles section on all style pages
 * to make it collapsible with a toggle button and remembered state.
 */

const fs = require('fs');
const path = require('path');

// Updated CSS for collapsible similar styles section
const collapsibleCSS = `
/* Similar Styles Section - Collapsible */
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
    transition: transform 0.3s ease, padding 0.3s ease;
}

.similar-styles-section.collapsed {
    transform: translateY(calc(100% - 44px));
    padding-bottom: 0.5rem;
}

.similar-styles-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
}

.similar-styles-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0;
    transition: margin 0.3s ease;
}

.similar-styles-section:not(.collapsed) .similar-styles-title {
    margin-bottom: 0.75rem;
}

.similar-styles-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    transition: color 0.2s, background 0.2s;
}

.similar-styles-toggle:hover {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.1);
}

.similar-styles-toggle svg {
    width: 16px;
    height: 16px;
    transition: transform 0.3s ease;
}

.similar-styles-section.collapsed .similar-styles-toggle svg {
    transform: rotate(180deg);
}

.similar-styles-grid {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    transition: opacity 0.3s ease, max-height 0.3s ease;
    max-height: 120px;
}

.similar-styles-section.collapsed .similar-styles-grid {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    margin-top: 0;
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

// JavaScript for toggle functionality
const collapsibleJS = `
<script>
(function() {
    const section = document.querySelector('.similar-styles-section');
    const toggle = document.querySelector('.similar-styles-toggle');
    const STORAGE_KEY = 'lobbi-similar-styles-collapsed';

    // Restore collapsed state from localStorage
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
        section.classList.add('collapsed');
    }

    // Toggle collapse on click
    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            section.classList.toggle('collapsed');
            localStorage.setItem(STORAGE_KEY, section.classList.contains('collapsed'));
        });
    }

    // Also allow clicking the header to toggle
    const header = document.querySelector('.similar-styles-header');
    if (header) {
        header.addEventListener('click', () => {
            section.classList.toggle('collapsed');
            localStorage.setItem(STORAGE_KEY, section.classList.contains('collapsed'));
        });
    }
})();
</script>`;

// Process a single HTML file
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if this file has the similar styles section
    if (!content.includes('similar-styles-section')) {
        return { status: 'skip', reason: 'No similar styles section found' };
    }

    // Check if already updated with collapsible feature
    if (content.includes('similar-styles-toggle')) {
        return { status: 'skip', reason: 'Already has collapsible feature' };
    }

    // Update CSS: Replace old similar styles CSS with new collapsible version
    const cssPattern = /\/\* Similar Styles Section \*\/[\s\S]*?\.similar-style-card:hover \.similar-name \{[\s\S]*?\}/;

    if (cssPattern.test(content)) {
        content = content.replace(cssPattern, collapsibleCSS.trim());
    } else {
        // If pattern not found, try to add before </style>
        const styleCloseIndex = content.lastIndexOf('</style>');
        if (styleCloseIndex !== -1) {
            content = content.slice(0, styleCloseIndex) + collapsibleCSS + '\n    ' + content.slice(styleCloseIndex);
        }
    }

    // Update HTML: Add header wrapper and toggle button
    const oldHTMLPattern = /<div class="similar-styles-section">\s*<h3 class="similar-styles-title">Similar Styles<\/h3>\s*<div class="similar-styles-grid">/;

    const newHTMLStart = `<div class="similar-styles-section">
    <div class="similar-styles-header">
        <h3 class="similar-styles-title">Similar Styles</h3>
        <button class="similar-styles-toggle" aria-label="Toggle similar styles">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 15l-6-6-6 6"/>
            </svg>
        </button>
    </div>
    <div class="similar-styles-grid">`;

    content = content.replace(oldHTMLPattern, newHTMLStart);

    // Add JavaScript before </body> if not already present
    if (!content.includes('lobbi-similar-styles-collapsed')) {
        const bodyCloseIndex = content.lastIndexOf('</body>');
        if (bodyCloseIndex !== -1) {
            content = content.slice(0, bodyCloseIndex) + collapsibleJS + '\n' + content.slice(bodyCloseIndex);
        }
    }

    // Write updated content
    fs.writeFileSync(filePath, content, 'utf-8');

    return { status: 'success' };
}

// Main function
function main() {
    console.log('🎨 Adding Collapsible Feature to Similar Styles Sections...\n');

    const rootDir = path.join(__dirname, '..');
    const files = fs.readdirSync(rootDir).filter(f => f.startsWith('style-') && f.endsWith('.html'));

    console.log(`Found ${files.length} style files to process.\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    files.forEach(file => {
        const filePath = path.join(rootDir, file);

        try {
            const result = processFile(filePath);

            if (result.status === 'success') {
                successCount++;
                console.log(`✅ ${file}`);
            } else if (result.status === 'skip') {
                skipCount++;
                console.log(`⏭️  ${file} - ${result.reason}`);
            }
        } catch (error) {
            errorCount++;
            console.log(`❌ ${file} - Error: ${error.message}`);
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`  ✅ Successfully updated: ${successCount} files`);
    console.log(`  ⏭️  Skipped: ${skipCount} files`);
    console.log(`  ❌ Errors: ${errorCount} files`);
    console.log('='.repeat(60));

    if (successCount > 0) {
        console.log('\n✨ Collapsible Similar Styles feature has been added!');
        console.log('Users can now click the header or chevron to collapse/expand the similar styles section.');
        console.log('The collapsed state is remembered across page visits.');
    }
}

// Run
main();
