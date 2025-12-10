const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Check if CSS already exists
if (html.includes('Perfect For Tags') || html.includes('.perfect-for-tag')) {
    console.log('✓ Perfect For CSS already exists');
    process.exit(0);
}

// CSS to add
const cssToAdd = `
        /* Perfect For Tags */
        .card-perfect-for {
            display: flex;
            gap: 0.25rem;
            flex-wrap: wrap;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid var(--border);
        }

        .perfect-for-tag {
            font-size: 0.625rem;
            color: var(--text-muted);
            background: transparent;
            padding: 0.125rem 0.375rem;
            border: 1px solid var(--border);
            border-radius: 2rem;
        }

        .style-card:hover .perfect-for-tag {
            border-color: var(--accent);
            color: var(--accent-light);
        }
`;

// Find the line with .tag.association and insert after it
const searchStr = '        .tag.association { background: rgba(99, 102, 241, 0.15); color: #818cf8; }';
const index = html.indexOf(searchStr);

if (index !== -1) {
    const insertPos = index + searchStr.length;
    html = html.slice(0, insertPos) + cssToAdd + html.slice(insertPos);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('✓ Added Perfect For CSS styles');
} else {
    console.error('✗ Could not find insertion point for CSS');
    process.exit(1);
}
