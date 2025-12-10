const fs = require('fs');
const path = require('path');

/**
 * Navigation Enhancement Script
 *
 * This script enhances navigation across all style pages with:
 * 1. Scroll-to-top button
 * 2. Enhanced focus indicators
 * 3. Improved keyboard navigation
 * 4. Better ARIA labels and landmarks
 * 5. Breadcrumb navigation hints
 */

// CSS for scroll-to-top button (consistent with index.html)
const scrollToTopCSS = `
/* Scroll to Top Button */
.scroll-to-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 80;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.scroll-to-top.visible {
    opacity: 1;
    visibility: visible;
}

.scroll-to-top:hover {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
}

.scroll-to-top:active {
    transform: translateY(-2px);
}

.scroll-to-top:focus {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
}

/* Enhanced focus indicators */
*:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}

button:focus-visible,
a:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
}

/* Keyboard navigation indicator */
.nav-keyboard-hint {
    position: fixed;
    bottom: 5rem;
    right: 2rem;
    background: rgba(0, 0, 0, 0.85);
    color: rgba(255, 255, 255, 0.7);
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.6875rem;
    font-family: 'Courier New', monospace;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 79;
    pointer-events: none;
}

.nav-keyboard-hint.visible {
    opacity: 1;
    visibility: visible;
}

.nav-keyboard-hint kbd {
    background: rgba(255, 255, 255, 0.15);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    margin: 0 0.125rem;
}

/* Progress indicator for style navigation */
.style-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    z-index: 10000;
    transition: width 0.3s ease;
}

@media (max-width: 767px) {
    .scroll-to-top {
        bottom: 5rem;
        right: 1rem;
        width: 44px;
        height: 44px;
    }

    .nav-keyboard-hint {
        display: none;
    }
}
`;

// HTML for scroll-to-top button
const scrollToTopHTML = `
<!-- Scroll to Top Button -->
<button class="scroll-to-top" id="scrollToTop" aria-label="Scroll to top">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 15l-6-6-6 6"/>
    </svg>
</button>

<!-- Keyboard Navigation Hint -->
<div class="nav-keyboard-hint" id="navKeyboardHint">
    Press <kbd>?</kbd> for shortcuts
</div>
`;

// JavaScript for scroll-to-top and enhanced navigation
const scrollToTopJS = `
<!-- Enhanced Navigation Script -->
<script>
(function() {
    'use strict';

    // Scroll to Top Button
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const keyboardHint = document.getElementById('navKeyboardHint');

    if (scrollToTopBtn) {
        // Show/hide based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }, { passive: true });

        // Scroll to top on click
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            // Focus skip link after scroll for accessibility
            setTimeout(function() {
                var skipLink = document.querySelector('.skip-link');
                if (skipLink) skipLink.focus();
            }, 500);
        });
    }

    // Show keyboard hint on first tab
    let hasShownHint = sessionStorage.getItem('nav-hint-shown');

    if (!hasShownHint && keyboardHint) {
        document.addEventListener('keydown', function showHint(e) {
            if (e.key === 'Tab') {
                keyboardHint.classList.add('visible');
                sessionStorage.setItem('nav-hint-shown', 'true');
                setTimeout(function() {
                    keyboardHint.classList.remove('visible');
                }, 3000);
                document.removeEventListener('keydown', showHint);
            }
        });
    }

    // Enhanced keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Don't trigger if typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case '?':
                // Show keyboard shortcuts overlay
                showKeyboardShortcuts();
                break;
            case 'h':
            case 'H':
                // Go home
                if (!e.ctrlKey && !e.metaKey) {
                    window.location.href = 'index.html';
                }
                break;
            case 't':
            case 'T':
                // Scroll to top
                if (!e.ctrlKey && !e.metaKey) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                break;
        }
    });

    function showKeyboardShortcuts() {
        // Check if overlay already exists
        if (document.getElementById('keyboardShortcutsOverlay')) {
            document.getElementById('keyboardShortcutsOverlay').classList.toggle('visible');
            return;
        }

        var overlay = document.createElement('div');
        overlay.id = 'keyboardShortcutsOverlay';
        overlay.className = 'keyboard-shortcuts-overlay visible';
        overlay.innerHTML = \`
            <div class="keyboard-shortcuts-panel">
                <div class="ks-header">
                    <h3>Keyboard Shortcuts</h3>
                    <button onclick="this.closest('.keyboard-shortcuts-overlay').classList.remove('visible')" aria-label="Close">×</button>
                </div>
                <div class="ks-content">
                    <div class="ks-item"><kbd>←</kbd> Previous style</div>
                    <div class="ks-item"><kbd>→</kbd> Next style</div>
                    <div class="ks-item"><kbd>H</kbd> Go to gallery home</div>
                    <div class="ks-item"><kbd>T</kbd> Scroll to top</div>
                    <div class="ks-item"><kbd>ESC</kbd> Hide navigation</div>
                    <div class="ks-item"><kbd>?</kbd> Show this panel</div>
                </div>
            </div>
        \`;

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                overlay.classList.remove('visible');
            }
        });

        document.body.appendChild(overlay);

        // Add styles
        if (!document.getElementById('ksOverlayStyles')) {
            var style = document.createElement('style');
            style.id = 'ksOverlayStyles';
            style.textContent = \`
                .keyboard-shortcuts-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10002;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                .keyboard-shortcuts-overlay.visible {
                    opacity: 1;
                    visibility: visible;
                }
                .keyboard-shortcuts-panel {
                    background: rgba(20, 20, 25, 0.98);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    padding: 1.5rem;
                    min-width: 280px;
                    max-width: 90vw;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                }
                .ks-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .ks-header h3 {
                    margin: 0;
                    font-size: 1rem;
                    color: #fff;
                }
                .ks-header button {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
                .ks-header button:hover {
                    color: #fff;
                }
                .ks-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .ks-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.875rem;
                }
                .ks-item kbd {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-family: 'Courier New', monospace;
                    font-size: 0.75rem;
                    color: #60a5fa;
                    min-width: 2rem;
                    text-align: center;
                }
            \`;
            document.head.appendChild(style);
        }
    }

    // Add progress indicator based on style number
    var match = location.pathname.match(/style-(\\d+)/);
    if (match) {
        var num = parseInt(match[1]);
        var progress = (num / 255) * 100;
        var progressBar = document.createElement('div');
        progressBar.className = 'style-progress';
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuenow', num);
        progressBar.setAttribute('aria-valuemin', '1');
        progressBar.setAttribute('aria-valuemax', '255');
        progressBar.setAttribute('aria-label', 'Style ' + num + ' of 255');
        document.body.insertBefore(progressBar, document.body.firstChild);
    }

    // Announce page for screen readers
    var announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(announcer);

    // Announce when navigation happens
    window.addEventListener('popstate', function() {
        var title = document.title;
        announcer.textContent = 'Now viewing: ' + title;
    });
})();
</script>
`;

// CSS for enhanced ARIA and focus management
const accessibilityCSS = `
/* Screen reader only class */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Focus within for grouped elements */
.gallery-nav-arrows:focus-within {
    outline: 2px solid rgba(59, 130, 246, 0.5);
    outline-offset: 4px;
    border-radius: 0.5rem;
}

/* High contrast focus for navigation */
@media (prefers-contrast: high) {
    *:focus-visible {
        outline: 3px solid #fff;
        outline-offset: 3px;
    }

    .skip-link:focus {
        background: #000;
        color: #fff;
        outline: 3px solid #fff;
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    .scroll-to-top,
    .gallery-nav,
    .nav-keyboard-hint,
    .style-progress {
        transition: none;
    }

    .scroll-to-top:hover {
        transform: none;
    }
}
`;

function processFile(filePath) {
    console.log(`Processing: ${path.basename(filePath)}`);

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if already has scroll-to-top
    if (content.includes('id="scrollToTop"')) {
        console.log(`  ⏭️  Already has scroll-to-top, skipping...`);
        return false;
    }

    // 1. Add scroll-to-top CSS before closing </style> tag
    if (!content.includes('.scroll-to-top {')) {
        const styleCloseIndex = content.lastIndexOf('</style>');
        if (styleCloseIndex !== -1) {
            content = content.slice(0, styleCloseIndex) +
                      scrollToTopCSS + '\n' +
                      accessibilityCSS + '\n    ' +
                      content.slice(styleCloseIndex);
            console.log(`  ✅ Added scroll-to-top CSS`);
            modified = true;
        }
    }

    // 2. Add scroll-to-top HTML and JS before closing </body> tag
    const bodyCloseIndex = content.lastIndexOf('</body>');
    if (bodyCloseIndex !== -1) {
        content = content.slice(0, bodyCloseIndex) +
                  scrollToTopHTML + '\n' +
                  scrollToTopJS + '\n' +
                  content.slice(bodyCloseIndex);
        console.log(`  ✅ Added scroll-to-top HTML and JS`);
        modified = true;
    }

    // 3. Enhance gallery-nav ARIA attributes
    if (content.includes('class="gallery-nav"') && !content.includes('role="navigation"')) {
        content = content.replace(
            /<nav class="gallery-nav/g,
            '<nav role="navigation" class="gallery-nav'
        );
        console.log(`  ✅ Enhanced nav ARIA attributes`);
        modified = true;
    }

    // 4. Add aria-current to active nav items
    if (content.includes('class="active"') && !content.includes('aria-current="page"')) {
        content = content.replace(
            /class="active"/g,
            'class="active" aria-current="page"'
        );
        console.log(`  ✅ Added aria-current to active items`);
        modified = true;
    }

    // 5. Add landmark roles to main sections
    if (content.includes('<main class="main"') && !content.includes('role="main"')) {
        content = content.replace(
            /<main class="main"/g,
            '<main role="main" class="main"'
        );
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Saved ${path.basename(filePath)}\n`);
        return true;
    }

    return false;
}

// Main execution
console.log('🚀 Enhancing navigation across all style pages...\n');

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
        if (processFile(fullPath)) {
            processed++;
        } else {
            skipped++;
        }
    } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
    }
});

console.log('═══════════════════════════════════════');
console.log(`✅ Complete!`);
console.log(`   Processed: ${processed} files`);
console.log(`   Skipped: ${skipped} files (already enhanced)`);
console.log(`   Total: ${files.length} files`);
console.log('═══════════════════════════════════════');
