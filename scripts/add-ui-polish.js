#!/usr/bin/env node
/**
 * UI Polish Script
 * Adds smooth transitions, animations, focus states, and accessibility improvements
 * to all style pages in the Lobbi Design System
 */

const fs = require('fs');
const path = require('path');

const STYLE_DIR = path.join(__dirname, '..');

// CSS to inject before </style> tag
const UI_POLISH_CSS = `
        /* === UI POLISH ADDITIONS === */

        /* Smooth transitions for all interactive elements */
        a, button, input, select, textarea {
            transition: all 0.2s ease;
        }

        /* Card hover improvements */
        .card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        /* SVG transitions for collapsible sections */
        svg {
            transition: transform 0.3s ease;
        }

        /* Button active states with smooth transitions */
        button:active, .btn:active {
            transform: scale(0.98);
            transition: transform 0.1s ease-out;
        }

        /* Focus visible states for accessibility */
        a:focus-visible,
        button:focus-visible,
        input:focus-visible,
        select:focus-visible,
        textarea:focus-visible {
            outline: 2px solid currentColor;
            outline-offset: 2px;
        }

        /* Form input focus improvements */
        input:focus,
        select:focus,
        textarea:focus {
            border-color: var(--gold-500, #d4a520);
            box-shadow: 0 0 0 3px rgba(212, 165, 32, 0.15);
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }

        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }

        /* Enhanced touch feedback for mobile */
        @media (hover: none) and (pointer: coarse) {
            .card:active {
                transform: scale(0.98);
                transition: transform 0.1s ease-out;
            }

            button:active, .btn:active {
                transform: scale(0.95);
            }
        }
`;

// CSS to inject for gallery navigation improvements
const GALLERY_NAV_CSS = `
        /* Gallery Navigation Polish */
        .gallery-nav {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.3s ease;
        }

        .gallery-nav-toggle svg,
        .gallery-nav-arrow svg {
            transition: transform 0.2s ease;
        }

        .gallery-nav-toggle:hover svg {
            transform: rotate(180deg);
        }

        .gallery-nav-arrow:hover svg {
            transform: scale(1.1);
        }

        .gallery-nav-arrow:active {
            transform: scale(0.95);
            transition: transform 0.1s ease-out;
        }
`;

// CSS for similar styles section
const SIMILAR_STYLES_CSS = `
        /* Similar Styles Section Polish */
        .similar-styles-toggle svg {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .similar-styles-section.collapsed .similar-styles-toggle svg {
            transform: rotate(180deg);
        }

        .similar-style-card {
            transition: all 0.3s ease;
        }

        .similar-style-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
`;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if UI polish CSS already added
    if (content.includes('UI POLISH ADDITIONS')) {
        console.log(`  ⏭️  Skipping (already polished): ${path.basename(filePath)}`);
        return false;
    }

    // Find the </style> tag and inject CSS before it
    const styleEndMatch = content.match(/<\/style>/);
    if (styleEndMatch) {
        // Find the position to inject
        const insertPos = content.indexOf('</style>');

        // Build the CSS to inject based on what's in the file
        let cssToInject = UI_POLISH_CSS;

        // Add gallery nav CSS if file has gallery navigation
        if (content.includes('gallery-nav')) {
            cssToInject += GALLERY_NAV_CSS;
        }

        // Add similar styles CSS if file has similar styles section
        if (content.includes('similar-styles')) {
            cssToInject += SIMILAR_STYLES_CSS;
        }

        // Inject the CSS
        content = content.slice(0, insertPos) + cssToInject + content.slice(insertPos);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Polished: ${path.basename(filePath)}`);
        return true;
    }

    return false;
}

function main() {
    console.log('\n🎨 Lobbi Design System - UI Polish Script\n');
    console.log('━'.repeat(50));

    // Get all style HTML files
    const files = fs.readdirSync(STYLE_DIR)
        .filter(f => f.startsWith('style-') && f.endsWith('.html'))
        .sort((a, b) => {
            const numA = parseInt(a.match(/style-(\d+)/)?.[1] || 0);
            const numB = parseInt(b.match(/style-(\d+)/)?.[1] || 0);
            return numA - numB;
        });

    console.log(`\nFound ${files.length} style pages to process...\n`);

    let processed = 0;
    let skipped = 0;

    for (const file of files) {
        const filePath = path.join(STYLE_DIR, file);
        if (processFile(filePath)) {
            processed++;
        } else {
            skipped++;
        }
    }

    console.log('\n' + '━'.repeat(50));
    console.log(`\n✨ UI Polish Complete!`);
    console.log(`   📝 Processed: ${processed} files`);
    console.log(`   ⏭️  Skipped: ${skipped} files`);
    console.log(`   📁 Total: ${files.length} style pages\n`);
}

main();
