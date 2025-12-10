#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Export panel HTML
const exportPanelHTML = `
<!-- Export Panel -->
<div class="export-panel">
    <h4>Export Tokens</h4>
    <div class="export-buttons">
        <button onclick="copyCSS()" class="export-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
            CSS
        </button>
        <button onclick="copyTailwind()" class="export-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Tailwind
        </button>
        <button onclick="copyJSON()" class="export-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
            JSON
        </button>
    </div>
</div>
<div id="exportToast" class="export-toast"></div>
`;

// Export panel CSS
const exportPanelCSS = `
/* Export Panel */
.export-panel {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: rgba(0, 0, 0, 0.95);
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    z-index: 1000;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.export-panel h4 {
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 0.75rem;
}

.export-buttons {
    display: flex;
    gap: 0.5rem;
}

.export-btn {
    padding: 0.5rem 0.875rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.8125rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    transition: all 0.2s;
}

.export-btn:hover {
    background: #3b82f6;
    border-color: #3b82f6;
}

.export-toast {
    position: fixed;
    bottom: 6rem;
    right: 2rem;
    background: #10b981;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 1001;
    pointer-events: none;
}

.export-toast.visible {
    opacity: 1;
    transform: translateY(0);
}
`;

// Export panel JavaScript
const exportPanelJS = `
<script>
function getTokens() {
    var root = document.documentElement;
    var styles = getComputedStyle(root);
    var tokens = {};
    for (var i = 0; i < styles.length; i++) {
        var prop = styles[i];
        if (prop.startsWith('--')) {
            tokens[prop] = styles.getPropertyValue(prop).trim();
        }
    }
    return tokens;
}

function copyCSS() {
    var tokens = getTokens();
    var css = ':root {\\n' + Object.keys(tokens).map(function(k) {
        return '    ' + k + ': ' + tokens[k] + ';';
    }).join('\\n') + '\\n}';
    navigator.clipboard.writeText(css);
    showToast('CSS variables copied!');
}

function copyJSON() {
    var tokens = getTokens();
    navigator.clipboard.writeText(JSON.stringify(tokens, null, 2));
    showToast('JSON tokens copied!');
}

function copyTailwind() {
    var tokens = getTokens();
    var config = {
        theme: {
            extend: {
                colors: {},
                fontFamily: {}
            }
        }
    };
    Object.keys(tokens).forEach(function(key) {
        var value = tokens[key];
        var cleanKey = key.replace('--', '').replace(/-/g, '_');
        if (value.includes('#') || value.includes('rgb')) {
            config.theme.extend.colors[cleanKey] = value;
        }
    });
    var output = 'module.exports = ' + JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(output);
    showToast('Tailwind config copied!');
}

function showToast(message) {
    var toast = document.getElementById('exportToast');
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(function() {
        toast.classList.remove('visible');
    }, 2000);
}
</script>
`;

function addExportPanel(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if export panel already exists
        if (content.includes('<!-- Export Panel -->')) {
            console.log(`⏭️  Skipping ${path.basename(filePath)} - Export panel already exists`);
            return false;
        }

        // Find the closing </style> tag and add CSS
        const styleEndIndex = content.lastIndexOf('</style>');
        if (styleEndIndex !== -1) {
            content = content.slice(0, styleEndIndex) + exportPanelCSS + '\n    ' + content.slice(styleEndIndex);
        }

        // Find the closing </body> tag and add HTML + JS before it
        const bodyEndIndex = content.lastIndexOf('</body>');
        if (bodyEndIndex !== -1) {
            content = content.slice(0, bodyEndIndex) + exportPanelHTML + '\n' + exportPanelJS + '\n' + content.slice(bodyEndIndex);
        }

        // Write the modified content back to the file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Added export panel to ${path.basename(filePath)}`);
        return true;
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
        return false;
    }
}

function main() {
    console.log('🚀 Starting export panel addition...\n');

    // Get all style HTML files using built-in fs
    const currentDir = process.cwd();
    const allFiles = fs.readdirSync(currentDir);
    const styleFiles = allFiles
        .filter(file => file.startsWith('style-') && file.endsWith('.html'))
        .map(file => path.join(currentDir, file));

    if (styleFiles.length === 0) {
        console.error('❌ No style-*.html files found in current directory');
        process.exit(1);
    }

    console.log(`📁 Found ${styleFiles.length} style files\n`);

    let successCount = 0;
    let skippedCount = 0;

    styleFiles.forEach(file => {
        const result = addExportPanel(file);
        if (result) {
            successCount++;
        } else {
            skippedCount++;
        }
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Successfully added: ${successCount} files`);
    console.log(`   ⏭️  Skipped (already exists): ${skippedCount} files`);
    console.log(`   📁 Total files: ${styleFiles.length}`);
    console.log('='.repeat(60));

    if (successCount > 0) {
        console.log('\n✨ Export panel successfully added to all style pages!');
    } else {
        console.log('\n⚠️  No changes were made (all files already have export panels)');
    }
}

// Run the script
main();
