#!/usr/bin/env node

/**
 * Fix Navigation Visibility - Make nav properly hide off-screen
 *
 * This script updates the gallery navigation on all style pages to:
 * 1. Hide off-screen by default (transform: translateY(-100%))
 * 2. Slide in when visible (transform: translateY(0))
 * 3. Add better auto-hide behavior on scroll
 */

const fs = require('fs');
const path = require('path');

// Updated CSS for the gallery nav that properly hides off-screen
const fixedNavCSS = `/* Gallery Navigation - Injected */
        .gallery-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9999;
            background: linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,20,0.98) 100%);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            padding: 0.75rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            transform: translateY(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .gallery-nav.visible {
            transform: translateY(0);
        }`;

// Updated JavaScript with scroll detection and improved auto-hide
const fixedNavJS = `<script>
        (function() {
            const nav = document.getElementById('galleryNav');
            const toggle = document.getElementById('galleryNavToggle');
            let hideTimeout;
            let lastScrollY = 0;
            let ticking = false;

            function showNav() {
                nav.classList.add('visible');
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(hideNav, 3000);
            }

            function hideNav() {
                nav.classList.remove('visible');
            }

            // Show briefly on page load
            setTimeout(showNav, 300);

            // Toggle button
            toggle.addEventListener('click', showNav);

            // Show on mouse near top
            document.addEventListener('mousemove', (e) => {
                if (e.clientY < 60) showNav();
            });

            // Keep visible on hover
            nav.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
            nav.addEventListener('mouseleave', () => {
                hideTimeout = setTimeout(hideNav, 1500);
            });

            // Hide on scroll down, show on scroll up
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        const currentScrollY = window.scrollY;
                        if (currentScrollY > lastScrollY && currentScrollY > 100) {
                            hideNav();
                        } else if (currentScrollY < lastScrollY - 10) {
                            showNav();
                        }
                        lastScrollY = currentScrollY;
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') hideNav();
                if (e.key === 'ArrowLeft' && nav.querySelector('a.gallery-nav-arrow:first-child:not(.disabled)')) {
                    const prevLink = nav.querySelector('.gallery-nav-arrows a:first-child');
                    if (prevLink && !prevLink.classList.contains('disabled')) {
                        window.location.href = prevLink.href;
                    }
                }
                if (e.key === 'ArrowRight') {
                    const nextLink = nav.querySelector('.gallery-nav-arrows a:last-child');
                    if (nextLink && !nextLink.classList.contains('disabled')) {
                        window.location.href = nextLink.href;
                    }
                }
            });
        })();
    </script>`;

// Process a single HTML file
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if this file has the gallery navigation
    if (!content.includes('gallery-nav')) {
        return { status: 'skip', reason: 'No gallery navigation found' };
    }

    // Check if already fixed (nav hides off-screen)
    if (content.includes('transform: translateY(-100%)')) {
        return { status: 'skip', reason: 'Already has proper hide behavior' };
    }

    // Replace the old gallery-nav CSS block
    const oldCSSPattern = /\/\* Gallery Navigation - Injected \*\/\s*\.gallery-nav \{[^}]*transform:\s*translateY\(0\);[^}]*\}\s*\.gallery-nav\.visible \{[^}]*\}/s;

    if (oldCSSPattern.test(content)) {
        content = content.replace(oldCSSPattern, fixedNavCSS);
    }

    // Replace the old JavaScript block
    const oldJSPattern = /<script>\s*\(function\(\)\s*\{\s*const nav = document\.getElementById\('galleryNav'\);[\s\S]*?if \(e\.key === 'ArrowRight'[\s\S]*?\}\);\s*\}\)\(\);\s*<\/script>/;

    if (oldJSPattern.test(content)) {
        content = content.replace(oldJSPattern, fixedNavJS);
    }

    // Write updated content
    fs.writeFileSync(filePath, content, 'utf-8');

    return { status: 'success' };
}

// Main function
function main() {
    console.log('🔧 Fixing Gallery Navigation Visibility...\n');

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
        console.log('\n✨ Navigation now properly hides off-screen!');
        console.log('Behavior:');
        console.log('  - Auto-hides after 3 seconds');
        console.log('  - Hides when scrolling down');
        console.log('  - Shows when scrolling up or mouse near top');
        console.log('  - Toggle button always visible to restore nav');
    }
}

// Run
main();
