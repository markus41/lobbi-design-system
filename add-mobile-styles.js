#!/usr/bin/env node

/**
 * Add Mobile-First Responsive Styles to All Style Pages
 * 
 * This script adds comprehensive mobile-first CSS to all 255 style pages
 * ensuring consistent responsive behavior across the entire design system.
 */

const fs = require('fs');
const path = require('path');

// Mobile-first CSS to inject before the closing </style> tag
const mobileFirstCSS = `
        /* ============================================
           MOBILE-FIRST RESPONSIVE STYLES
           ============================================ */
        
        /* Mobile Base (320px+) - Default styles optimized for mobile */
        @media (max-width: 767px) {
            .main {
                padding: 1.5rem 1rem;
            }

            .page-title {
                font-size: 1.75rem;
                line-height: 1.2;
            }

            .subtitle {
                font-size: 0.9375rem;
                margin-bottom: 2rem;
            }

            .card-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .card {
                padding: 1rem;
            }

            .card-title {
                font-size: 1.125rem;
            }

            .card-badge {
                font-size: 0.6875rem;
                padding: 0.2rem 0.5rem;
            }

            .table-container {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }

            table {
                min-width: 600px;
                font-size: 0.875rem;
            }

            th, td {
                padding: 0.75rem 0.5rem;
            }

            /* Gallery navigation - mobile optimized */
            .gallery-nav {
                padding: 0.5rem 1rem;
                flex-wrap: wrap;
            }

            .gallery-nav-title {
                display: none;
            }

            .gallery-nav-hints {
                display: none;
            }

            .gallery-nav-categories {
                margin-left: 0;
                margin-top: 0.5rem;
                width: 100%;
            }

            /* Export panel - mobile positioning */
            .export-panel {
                bottom: 1rem;
                right: 1rem;
                left: 1rem;
                padding: 0.875rem 1rem;
            }

            .export-buttons {
                flex-wrap: wrap;
            }

            .export-btn {
                flex: 1;
                min-width: calc(50% - 0.25rem);
                padding: 0.625rem 0.75rem;
                font-size: 0.75rem;
            }
        }

        /* Tablet (768px - 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
            .main {
                padding: 2rem 1.5rem;
            }

            .page-title {
                font-size: 2.25rem;
            }

            .subtitle {
                font-size: 1rem;
            }

            .card-grid {
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1.25rem;
            }

            .export-panel {
                bottom: 1.5rem;
                right: 1.5rem;
            }
        }

        /* Desktop (1024px+) - Keep original styles */
        @media (min-width: 1024px) {
            /* Original desktop styles apply */
        }

        /* Touch-friendly enhancements */
        @media (hover: none) and (pointer: coarse) {
            .card {
                -webkit-tap-highlight-color: rgba(212, 165, 32, 0.1);
            }

            .card:active {
                transform: scale(0.98);
            }

            .gallery-nav-arrow,
            .gallery-nav-toggle,
            .export-btn,
            button {
                min-height: 44px;
                min-width: 44px;
            }
        }

        /* Extra small screens (max 375px) */
        @media (max-width: 375px) {
            .main {
                padding: 1rem 0.75rem;
            }

            .page-title {
                font-size: 1.5rem;
            }

            .subtitle {
                font-size: 0.875rem;
            }

            .card {
                padding: 0.875rem;
            }

            .export-panel {
                bottom: 0.75rem;
                right: 0.75rem;
                left: 0.75rem;
            }
        }

        /* Landscape orientation - optimize vertical space */
        @media (max-height: 500px) and (orientation: landscape) {
            .main {
                padding: 1rem;
            }

            .page-title {
                font-size: 1.5rem;
                margin-bottom: 0.25rem;
            }

            .subtitle {
                font-size: 0.875rem;
                margin-bottom: 1rem;
            }

            .card-grid {
                gap: 0.875rem;
            }

            .gallery-nav {
                padding: 0.375rem 1rem;
            }
        }
`;

// Find all style HTML files
const styleFiles = fs.readdirSync(__dirname)
    .filter(file => file.startsWith('style-') && file.endsWith('.html'))
    .sort((a, b) => {
        const numA = parseInt(a.match(/style-(\d+)-/)[1]);
        const numB = parseInt(b.match(/style-(\d+)-/)[1]);
        return numA - numB;
    });

console.log(`Found ${styleFiles.length} style files to process\n`);

let successCount = 0;
let errorCount = 0;
let skippedCount = 0;

styleFiles.forEach((file, index) => {
    const filePath = path.join(__dirname, file);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if mobile styles already added
        if (content.includes('MOBILE-FIRST RESPONSIVE STYLES')) {
            console.log(`✓ Skipped ${file} (already has mobile styles)`);
            skippedCount++;
            return;
        }

        // Find the closing </style> tag and inject CSS before it
        const styleCloseTag = '</style>';
        const styleCloseIndex = content.lastIndexOf(styleCloseTag);
        
        if (styleCloseIndex === -1) {
            console.error(`✗ Error: No closing </style> tag found in ${file}`);
            errorCount++;
            return;
        }

        // Inject the mobile-first CSS
        content = content.slice(0, styleCloseIndex) + 
                  mobileFirstCSS + 
                  '\n    ' + content.slice(styleCloseIndex);

        // Write back to file
        fs.writeFileSync(filePath, content, 'utf8');
        
        successCount++;
        if ((index + 1) % 10 === 0 || index === styleFiles.length - 1) {
            console.log(`✓ Processed ${index + 1}/${styleFiles.length} files...`);
        }
        
    } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
        errorCount++;
    }
});

console.log('\n========================================');
console.log('Summary:');
console.log(`  ✓ Success: ${successCount} files`);
console.log(`  ⊘ Skipped: ${skippedCount} files`);
console.log(`  ✗ Errors:  ${errorCount} files`);
console.log('========================================\n');

if (successCount > 0) {
    console.log('✓ Mobile-first responsive styles added successfully!');
    console.log('  All style pages are now optimized for mobile devices.\n');
}
