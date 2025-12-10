/**
 * Thumbnail Generation Script for Lobbi Design System
 *
 * This script uses Puppeteer to generate WebP thumbnails for all 210 style pages.
 * Run with: npm run generate-thumbnails
 *
 * Prerequisites:
 * - Node.js 18+
 * - npm install puppeteer sharp
 *
 * Output: thumbnails/style-{num}.webp (400x250px)
 */

const puppeteer = require('puppeteer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TOTAL_STYLES = 210;
const OUTPUT_DIR = path.join(__dirname, '..', 'thumbnails');
const VIEWPORT_WIDTH = 1400;
const VIEWPORT_HEIGHT = 900;
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 250;
const CONCURRENT_PAGES = 5;

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateThumbnail(browser, styleNum) {
    const page = await browser.newPage();

    try {
        await page.setViewport({
            width: VIEWPORT_WIDTH,
            height: VIEWPORT_HEIGHT,
            deviceScaleFactor: 1
        });

        // Find the style file
        const styleName = getStyleFileName(styleNum);
        const styleFile = path.join(__dirname, '..', styleName);

        if (!fs.existsSync(styleFile)) {
            console.log(`  [SKIP] Style ${styleNum}: File not found`);
            return false;
        }

        const fileUrl = `file://${styleFile}`;

        await page.goto(fileUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for any animations/transitions
        await page.waitForTimeout(500);

        // Take screenshot as PNG buffer
        const screenshotBuffer = await page.screenshot({
            type: 'png',
            clip: {
                x: 0,
                y: 0,
                width: VIEWPORT_WIDTH,
                height: VIEWPORT_HEIGHT
            }
        });

        // Resize and convert to WebP using sharp
        const outputPath = path.join(OUTPUT_DIR, `style-${styleNum}.webp`);

        await sharp(screenshotBuffer)
            .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
                fit: 'cover',
                position: 'top'
            })
            .webp({
                quality: 85,
                effort: 4
            })
            .toFile(outputPath);

        console.log(`  [OK] Style ${styleNum}`);
        return true;

    } catch (error) {
        console.error(`  [ERROR] Style ${styleNum}:`, error.message);
        return false;
    } finally {
        await page.close();
    }
}

function getStyleFileName(num) {
    // Style files follow pattern: style-{num}-{name}.html
    // We need to find the actual filename
    const files = fs.readdirSync(path.join(__dirname, '..'));
    const pattern = new RegExp(`^style-${num}-.*\\.html$`);
    const match = files.find(f => pattern.test(f));
    return match || `style-${num}.html`;
}

async function generateAllThumbnails() {
    console.log('Lobbi Design System - Thumbnail Generator');
    console.log('=========================================\n');
    console.log(`Generating thumbnails for ${TOTAL_STYLES} styles...`);
    console.log(`Output: ${OUTPUT_DIR}`);
    console.log(`Size: ${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}px WebP\n`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let successful = 0;
    let failed = 0;

    // Process in batches for better performance
    for (let i = 1; i <= TOTAL_STYLES; i += CONCURRENT_PAGES) {
        const batch = [];
        for (let j = i; j < i + CONCURRENT_PAGES && j <= TOTAL_STYLES; j++) {
            batch.push(generateThumbnail(browser, j));
        }

        const results = await Promise.all(batch);
        results.forEach(success => {
            if (success) successful++;
            else failed++;
        });

        // Progress indicator
        const progress = Math.min(i + CONCURRENT_PAGES - 1, TOTAL_STYLES);
        process.stdout.write(`\rProgress: ${progress}/${TOTAL_STYLES} (${Math.round(progress/TOTAL_STYLES*100)}%)`);
    }

    await browser.close();

    console.log('\n\n=========================================');
    console.log(`Completed: ${successful} successful, ${failed} failed`);
    console.log('=========================================\n');
}

// Generate placeholder thumbnail
async function generatePlaceholder() {
    const placeholderPath = path.join(OUTPUT_DIR, 'placeholder.webp');

    // Create a gradient placeholder using sharp
    const svg = `
        <svg width="${THUMBNAIL_WIDTH}" height="${THUMBNAIL_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#1a1a24;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#2a2a3a;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#1a1a24;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)"/>
            <text x="50%" y="50%" text-anchor="middle" dy=".3em"
                  fill="#64748b" font-family="system-ui, sans-serif" font-size="14">
                Loading preview...
            </text>
        </svg>
    `;

    await sharp(Buffer.from(svg))
        .webp({ quality: 80 })
        .toFile(placeholderPath);

    console.log('Placeholder thumbnail generated: placeholder.webp');
}

// Main execution
(async () => {
    const args = process.argv.slice(2);

    if (args.includes('--placeholder-only')) {
        await generatePlaceholder();
    } else if (args.includes('--single') && args[1]) {
        const styleNum = parseInt(args[1]);
        const browser = await puppeteer.launch({ headless: 'new' });
        await generateThumbnail(browser, styleNum);
        await browser.close();
    } else {
        await generatePlaceholder();
        await generateAllThumbnails();
    }
})();
