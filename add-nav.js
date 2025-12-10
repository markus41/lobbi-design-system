/**
 * Script to add floating "Back to Gallery" navigation to all style pages
 * This creates a consistent, non-intrusive navigation experience
 */

const fs = require('fs');
const path = require('path');

const designDir = __dirname;

// Style name mapping for files that don't have clear titles
const styleNameMap = {
    1: 'Byzantine Luxury',
    2: 'Streamline Moderne',
    3: 'Quiet Luxury',
    4: 'Japandi Glass',
    5: 'Swiss Aurora',
    6: 'Deco Cyberpunk',
    7: 'Neubrutalism Memphis',
    8: 'Scandi Bento',
    9: 'Dark Academia',
    10: 'Vaporwave Y2K',
    11: 'Solarpunk Biophilic',
    12: 'Brutalist Concrete',
    13: 'Quiet Luxury Alt',
    14: 'Editorial Swiss',
    15: 'Private Banking',
    16: 'Architect Portfolio',
    17: 'Executive Suite',
    18: 'Law Firm Premium',
    19: 'Luxury Hotel',
    20: 'Investment Fund',
    21: 'Wealth Management',
    22: 'Fintech Modern',
    23: 'Trading Terminal',
    24: 'Insurance Premium',
    25: 'Crypto Luxury',
    26: 'Real Estate Luxury',
    27: 'Consulting Elite',
    28: 'Medical Premium',
    29: 'Dental Luxury',
    30: 'Pharmaceutical',
    31: 'Engineering Firm',
    32: 'Accounting Premium',
    33: 'Patent Law',
    34: 'HR Enterprise',
    35: 'Yacht Club',
    36: 'Golf Resort',
    37: 'Spa Wellness',
    38: 'Fine Dining',
    39: 'Private Aviation',
    40: 'Watch Luxury',
    41: 'Jewelry Boutique',
    42: 'Art Gallery',
    43: 'AI Research',
    44: 'Biotech Lab',
    45: 'Aerospace',
    46: 'Robotics',
    47: 'Quantum Computing',
    48: 'Clean Energy',
    49: 'Space Industry',
    50: 'Cybersecurity',
    51: 'News Editorial',
    52: 'Fashion Magazine',
    53: 'Literary Journal',
    54: 'Music Label',
    55: 'Film Studio',
    56: 'Photography Pro',
    57: 'Podcast Premium',
    58: 'Streaming Platform',
    59: 'Board Room',
    60: 'Fortune 500',
    61: 'Startup Unicorn',
    62: 'Non-Profit Premium',
    63: 'University Ivy',
    64: 'Think Tank',
    65: 'Foundation',
    66: 'Government Civic',
    67: 'Auction House',
    68: 'Wine Estate',
    69: 'Equestrian',
    70: 'Luxury Auto',
    71: 'Chamber of Commerce',
    72: 'Trade Association',
    73: 'Professional Society',
    74: 'Alumni Association',
    75: 'Bar Association',
    76: 'Medical Association',
    77: 'Realtors Association',
    78: 'Rotary Service Club',
    79: 'Credit Union League',
    80: 'HOA Management',
    81: 'Teachers Union',
    82: 'Nonprofit Alliance',
    83: 'Sports League',
    84: 'Veterans Organization',
    85: 'Religious Denomination',
    86: 'Fraternal Organization',
    87: 'Industry Council',
    88: 'Cooperative Association',
    89: 'Professional Network',
    90: 'Membership Collective',
    // 3-Way Blend Styles 91-120
    91: 'Enterprise SaaS',
    92: 'Nordic Minimal',
    93: 'Luxury Concierge',
    94: 'Cyber Command',
    95: 'Organic Wellness',
    96: 'Investment Elite',
    97: 'Creative Studio',
    98: 'Academic Research',
    99: 'Sports Premium',
    100: 'Heritage Society',
    101: 'Quantum Lab',
    102: 'Maritime Guild',
    103: 'Artisan Collective',
    104: 'Aviation Elite',
    105: 'Music Conservatory',
    106: 'Green Energy',
    107: 'Legal Summit',
    108: 'Culinary Guild',
    109: 'Architecture Forum',
    110: 'Philanthropy Circle',
    111: 'eSports Arena',
    112: 'Wine Society',
    113: 'Blockchain DAO',
    114: 'Healthcare Network',
    115: 'Fashion Council',
    116: 'Motorsport Club',
    117: 'Diplomatic Corps',
    118: 'Startup Accelerator',
    119: 'Meditation Sangha',
    120: 'Space Pioneers',
    // 4+ Way Experimental Blends 121-135
    121: 'Civic Innovation Hub',
    122: 'Democratic Transparency',
    123: 'Public Service Excellence',
    124: 'Regulatory Modernization',
    125: 'Impact Collective',
    126: 'Philanthropic Legacy',
    127: 'Community Catalyst',
    128: 'Advocacy Alliance',
    129: 'Member Ecosystem',
    130: 'Credential Authority',
    131: 'Industry Council Evolution',
    132: 'Membership Renaissance',
    133: 'Professional Guild Modern',
    134: 'Association Intelligence',
    135: 'Global Standards Body',
    // 2-Way Premium Blends 136-140
    136: 'Minimal Wellness',
    137: 'Heritage Modernist',
    138: 'Eco-Luxury Refined',
    139: 'Artisan Contemporary',
    140: 'Accessible Professional Plus',
    // Historical & Classical 141-152
    141: 'Art Nouveau Elegance',
    142: 'Gothic Revival Digital',
    143: 'Victorian Modernist',
    144: 'Rococo Digital Garden',
    145: 'Neoclassical Authority',
    146: 'Renaissance Revival',
    147: 'Medieval Guild Hall',
    148: 'Baroque Grandeur',
    149: 'Roman Empire Digital',
    150: 'Ancient Egyptian Luxe',
    151: 'Byzantine Contemporary',
    152: 'Colonial American Heritage',
    // Cultural & Regional 153-164
    153: 'Japanese Wabi-Sabi',
    154: 'Scandinavian Hygge',
    155: 'Moroccan Geometric',
    156: 'Indian Mughal Luxury',
    157: 'Chinese Imperial',
    158: 'Greek Mediterranean',
    159: 'African Kente',
    160: 'Celtic Heritage',
    161: 'Persian Carpet',
    162: 'Mexican Folk Art',
    163: 'Nordic Rune',
    164: 'Brazilian Carnival',
    // Digital UI & Illustration 165-176
    165: 'Flat Design 2.0',
    166: 'Skeuomorphic Revival',
    167: 'Isometric Illustration',
    168: 'Line Art Minimal',
    169: 'Gradient Mesh UI',
    170: 'Duotone Photography',
    171: 'Low Poly 3D',
    172: 'Watercolor Digital',
    173: 'Comic Book Pop',
    174: 'Pixel Art Retro',
    175: 'Sticker Playful',
    176: 'Blueprint Technical',
    // Retro & Nostalgic 177-188
    177: '1950s Diner',
    178: '1960s Mod',
    179: '1970s Disco',
    180: '1980s Synthwave',
    181: '1990s Grunge',
    182: 'Y2K Millennium',
    183: 'Vintage Americana',
    184: 'Art Deco Golden',
    185: 'Vintage Cinema',
    186: 'Retro Computing',
    187: 'Victorian Steampunk',
    188: 'Mid-Century Modern',
    // Texture, Motion & Gaming 189-200
    189: 'Paper Texture',
    190: 'Concrete Brutalist',
    191: 'Wood Grain Natural',
    192: 'Marble Luxury',
    193: 'Kinetic Typography',
    194: 'Parallax Depth',
    195: 'Liquid Motion',
    196: 'Micro-Interaction Rich',
    197: 'RPG Fantasy',
    198: 'Sci-Fi HUD',
    199: 'Casual Mobile',
    200: 'Esports Arena',
    // Light, Dark & Emerging 201-210
    201: 'Pure Light Minimal',
    202: 'Warm Light Natural',
    203: 'Cool Light Professional',
    204: 'True Dark Mode',
    205: 'Elevated Dark',
    206: 'AI Native Interface',
    207: 'Neural Network',
    208: 'Spatial Computing',
    209: 'Generative Art',
    210: 'Sustainable Digital'
};

// Style file mapping
const styleFiles = {
    1: 'style-1-byzantine-luxury.html',
    2: 'style-2-streamline-moderne.html',
    3: 'style-3-quiet-luxury.html',
    4: 'style-4-japandi-glass.html',
    5: 'style-5-swiss-aurora.html',
    6: 'style-6-deco-cyberpunk.html',
    7: 'style-7-neubrutalism-memphis.html',
    8: 'style-8-scandi-bento.html',
    9: 'style-9-dark-academia-lobbi.html',
    10: 'style-10-vaporwave-y2k.html',
    11: 'style-11-solarpunk-biophilic.html',
    12: 'style-12-brutalist-concrete.html',
    13: 'style-13-quiet-luxury.html',
    14: 'style-14-editorial-swiss.html',
    15: 'style-15-private-banking.html',
    16: 'style-16-architect-portfolio.html',
    17: 'style-17-executive-suite.html',
    18: 'style-18-law-firm-premium.html',
    19: 'style-19-luxury-hotel.html',
    20: 'style-20-investment-fund.html',
    21: 'style-21-wealth-management.html',
    22: 'style-22-fintech-modern.html',
    23: 'style-23-trading-terminal.html',
    24: 'style-24-insurance-premium.html',
    25: 'style-25-crypto-luxury.html',
    26: 'style-26-real-estate-luxury.html',
    27: 'style-27-consulting-elite.html',
    28: 'style-28-medical-premium.html',
    29: 'style-29-dental-luxury.html',
    30: 'style-30-pharmaceutical.html',
    31: 'style-31-engineering-firm.html',
    32: 'style-32-accounting-premium.html',
    33: 'style-33-patent-law.html',
    34: 'style-34-hr-enterprise.html',
    35: 'style-35-yacht-club.html',
    36: 'style-36-golf-resort.html',
    37: 'style-37-spa-wellness.html',
    38: 'style-38-fine-dining.html',
    39: 'style-39-private-aviation.html',
    40: 'style-40-watch-luxury.html',
    41: 'style-41-jewelry-boutique.html',
    42: 'style-42-art-gallery.html',
    43: 'style-43-ai-research.html',
    44: 'style-44-biotech-lab.html',
    45: 'style-45-aerospace.html',
    46: 'style-46-robotics.html',
    47: 'style-47-quantum-computing.html',
    48: 'style-48-clean-energy.html',
    49: 'style-49-space-industry.html',
    50: 'style-50-cybersecurity.html',
    51: 'style-51-news-editorial.html',
    52: 'style-52-fashion-magazine.html',
    53: 'style-53-literary-journal.html',
    54: 'style-54-music-label.html',
    55: 'style-55-film-studio.html',
    56: 'style-56-photography-pro.html',
    57: 'style-57-podcast-premium.html',
    58: 'style-58-streaming-platform.html',
    59: 'style-59-board-room.html',
    60: 'style-60-fortune-500.html',
    61: 'style-61-startup-unicorn.html',
    62: 'style-62-nonprofit-premium.html',
    63: 'style-63-university-ivy.html',
    64: 'style-64-think-tank.html',
    65: 'style-65-foundation.html',
    66: 'style-66-government-civic.html',
    67: 'style-67-auction-house.html',
    68: 'style-68-wine-estate.html',
    69: 'style-69-equestrian.html',
    70: 'style-70-luxury-auto.html',
    71: 'style-71-chamber-commerce.html',
    72: 'style-72-trade-association.html',
    73: 'style-73-professional-society.html',
    74: 'style-74-alumni-association.html',
    75: 'style-75-bar-association.html',
    76: 'style-76-medical-association.html',
    77: 'style-77-realtors-association.html',
    78: 'style-78-rotary-service.html',
    79: 'style-79-credit-union.html',
    80: 'style-80-hoa.html',
    81: 'style-81-teachers-union.html',
    82: 'style-82-nonprofit-alliance.html',
    83: 'style-83-sports-league.html',
    84: 'style-84-veterans-org.html',
    85: 'style-85-religious-denomination.html',
    86: 'style-86-fraternal-org.html',
    87: 'style-87-industry-council.html',
    88: 'style-88-cooperative.html',
    89: 'style-89-professional-network.html',
    90: 'style-90-membership-collective.html',
    // 3-Way Blend Styles 91-120
    91: 'style-91-enterprise-saas.html',
    92: 'style-92-nordic-minimal.html',
    93: 'style-93-luxury-concierge.html',
    94: 'style-94-cyber-command.html',
    95: 'style-95-organic-wellness.html',
    96: 'style-96-investment-elite.html',
    97: 'style-97-creative-studio.html',
    98: 'style-98-academic-research.html',
    99: 'style-99-sports-premium.html',
    100: 'style-100-heritage-society.html',
    101: 'style-101-quantum-lab.html',
    102: 'style-102-maritime-guild.html',
    103: 'style-103-artisan-collective.html',
    104: 'style-104-aviation-elite.html',
    105: 'style-105-music-conservatory.html',
    106: 'style-106-green-energy.html',
    107: 'style-107-legal-summit.html',
    108: 'style-108-culinary-guild.html',
    109: 'style-109-architecture-forum.html',
    110: 'style-110-philanthropy-circle.html',
    111: 'style-111-esports-arena.html',
    112: 'style-112-wine-society.html',
    113: 'style-113-blockchain-dao.html',
    114: 'style-114-healthcare-network.html',
    115: 'style-115-fashion-council.html',
    116: 'style-116-motorsport-club.html',
    117: 'style-117-diplomatic-corps.html',
    118: 'style-118-startup-accelerator.html',
    119: 'style-119-meditation-sangha.html',
    120: 'style-120-space-pioneers.html',
    // 4+ Way Experimental Blends 121-135
    121: 'style-121-civic-innovation-hub.html',
    122: 'style-122-democratic-transparency.html',
    123: 'style-123-public-service-excellence.html',
    124: 'style-124-regulatory-modernization.html',
    125: 'style-125-impact-collective.html',
    126: 'style-126-philanthropic-legacy.html',
    127: 'style-127-community-catalyst.html',
    128: 'style-128-advocacy-alliance.html',
    129: 'style-129-member-ecosystem.html',
    130: 'style-130-credential-authority.html',
    131: 'style-131-industry-council.html',
    132: 'style-132-membership-renaissance.html',
    133: 'style-133-professional-guild-modern.html',
    134: 'style-134-association-intelligence.html',
    135: 'style-135-global-standards-body.html',
    // 2-Way Premium Blends 136-140
    136: 'style-136-minimal-wellness.html',
    137: 'style-137-heritage-modernist.html',
    138: 'style-138-eco-luxury.html',
    139: 'style-139-artisan-contemporary.html',
    140: 'style-140-accessible-professional.html',
    // Historical & Classical 141-152
    141: 'style-141-art-nouveau-elegance.html',
    142: 'style-142-gothic-revival-digital.html',
    143: 'style-143-victorian-modernist.html',
    144: 'style-144-rococo-digital-garden.html',
    145: 'style-145-neoclassical-authority.html',
    146: 'style-146-renaissance-revival.html',
    147: 'style-147-medieval-guild-hall.html',
    148: 'style-148-baroque-grandeur.html',
    149: 'style-149-roman-empire-digital.html',
    150: 'style-150-ancient-egyptian-luxe.html',
    151: 'style-151-byzantine-contemporary.html',
    152: 'style-152-colonial-american-heritage.html',
    // Cultural & Regional 153-164
    153: 'style-153-japanese-wabi-sabi.html',
    154: 'style-154-scandinavian-hygge.html',
    155: 'style-155-moroccan-geometric.html',
    156: 'style-156-indian-mughal-luxury.html',
    157: 'style-157-chinese-imperial.html',
    158: 'style-158-greek-mediterranean.html',
    159: 'style-159-african-kente.html',
    160: 'style-160-celtic-heritage.html',
    161: 'style-161-persian-carpet.html',
    162: 'style-162-mexican-folk-art.html',
    163: 'style-163-nordic-rune.html',
    164: 'style-164-brazilian-carnival.html',
    // Digital UI & Illustration 165-176
    165: 'style-165-flat-design-2-0.html',
    166: 'style-166-skeuomorphic-revival.html',
    167: 'style-167-isometric-illustration.html',
    168: 'style-168-line-art-minimal.html',
    169: 'style-169-gradient-mesh-ui.html',
    170: 'style-170-duotone-photography.html',
    171: 'style-171-low-poly-3d.html',
    172: 'style-172-watercolor-digital.html',
    173: 'style-173-comic-book-pop.html',
    174: 'style-174-pixel-art-retro.html',
    175: 'style-175-sticker-playful.html',
    176: 'style-176-blueprint-technical.html',
    // Retro & Nostalgic 177-188
    177: 'style-177-1950s-diner.html',
    178: 'style-178-1960s-mod.html',
    179: 'style-179-1970s-disco.html',
    180: 'style-180-1980s-synthwave.html',
    181: 'style-181-1990s-grunge.html',
    182: 'style-182-y2k-millennium.html',
    183: 'style-183-vintage-americana.html',
    184: 'style-184-art-deco-golden.html',
    185: 'style-185-vintage-cinema.html',
    186: 'style-186-retro-computing.html',
    187: 'style-187-victorian-steampunk.html',
    188: 'style-188-mid-century-modern.html',
    // Texture, Motion & Gaming 189-200
    189: 'style-189-paper-texture.html',
    190: 'style-190-concrete-brutalist.html',
    191: 'style-191-wood-grain-natural.html',
    192: 'style-192-marble-luxury.html',
    193: 'style-193-kinetic-typography.html',
    194: 'style-194-parallax-depth.html',
    195: 'style-195-liquid-motion.html',
    196: 'style-196-micro-interaction-rich.html',
    197: 'style-197-rpg-fantasy.html',
    198: 'style-198-sci-fi-hud.html',
    199: 'style-199-casual-mobile.html',
    200: 'style-200-esports-arena.html',
    // Light, Dark & Emerging 201-210
    201: 'style-201-pure-light-minimal.html',
    202: 'style-202-warm-light-natural.html',
    203: 'style-203-cool-light-professional.html',
    204: 'style-204-true-dark-mode.html',
    205: 'style-205-elevated-dark.html',
    206: 'style-206-ai-native-interface.html',
    207: 'style-207-neural-network.html',
    208: 'style-208-spatial-computing.html',
    209: 'style-209-generative-art.html',
    210: 'style-210-sustainable-digital.html'
};

// The navigation HTML and CSS to inject
const navCSS = `
        /* Gallery Navigation - Injected */
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
        }
        .gallery-nav-left {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .gallery-nav-back {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 6px;
            color: #fff;
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        .gallery-nav-back:hover {
            background: rgba(255,255,255,0.2);
            border-color: rgba(255,255,255,0.3);
            transform: translateX(-2px);
        }
        .gallery-nav-back svg {
            width: 16px;
            height: 16px;
        }
        .gallery-nav-title {
            font-size: 0.8125rem;
            color: rgba(255,255,255,0.7);
            font-weight: 400;
        }
        .gallery-nav-title strong {
            color: #fff;
            font-weight: 600;
        }
        .gallery-nav-right {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .gallery-nav-arrows {
            display: flex;
            gap: 0.25rem;
        }
        .gallery-nav-arrow {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 4px;
            color: #fff;
            text-decoration: none;
            transition: all 0.2s ease;
        }
        .gallery-nav-arrow:hover {
            background: rgba(255,255,255,0.2);
        }
        .gallery-nav-arrow.disabled {
            opacity: 0.3;
            pointer-events: none;
        }
        .gallery-nav-arrow svg {
            width: 14px;
            height: 14px;
        }
        .gallery-nav-toggle {
            position: fixed;
            top: 1rem;
            left: 1rem;
            z-index: 9998;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,30,0.95) 100%);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .gallery-nav-toggle:hover {
            background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(50,50,50,0.98) 100%);
            transform: scale(1.05);
        }
        .gallery-nav-toggle svg {
            width: 20px;
            height: 20px;
        }
        .gallery-nav.visible + .gallery-nav-toggle {
            opacity: 0;
            pointer-events: none;
        }
        @media (max-width: 640px) {
            .gallery-nav-title { display: none; }
            .gallery-nav { padding: 0.5rem 1rem; }
        }
`;

const navHTML = (styleNum, styleName) => {
    const prevNum = styleNum > 1 ? styleNum - 1 : null;
    const nextNum = styleNum < 210 ? styleNum + 1 : null;

    const prevHref = prevNum ? styleFiles[prevNum] : '#';
    const nextHref = nextNum ? styleFiles[nextNum] : '#';

    return `
    <!-- Gallery Navigation -->
    <nav class="gallery-nav" id="galleryNav">
        <div class="gallery-nav-left">
            <a href="index.html" class="gallery-nav-back">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Gallery
            </a>
            <span class="gallery-nav-title">Style <strong>${styleNum}</strong> of 210 &mdash; ${styleName}</span>
        </div>
        <div class="gallery-nav-right">
            <div class="gallery-nav-arrows">
                <a href="${prevHref}" class="gallery-nav-arrow${prevNum ? '' : ' disabled'}" title="Previous Style">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </a>
                <a href="${nextHref}" class="gallery-nav-arrow${nextNum ? '' : ' disabled'}" title="Next Style">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </a>
            </div>
        </div>
    </nav>
    <button class="gallery-nav-toggle" id="galleryNavToggle" title="Show Navigation">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
    </button>
    <script>
        (function() {
            const nav = document.getElementById('galleryNav');
            const toggle = document.getElementById('galleryNavToggle');
            let hideTimeout;

            function showNav() {
                nav.classList.add('visible');
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(() => nav.classList.remove('visible'), 3000);
            }

            function hideNav() {
                nav.classList.remove('visible');
            }

            // Show on page load briefly
            setTimeout(showNav, 500);

            // Toggle button
            toggle.addEventListener('click', showNav);

            // Show on mouse near top
            document.addEventListener('mousemove', (e) => {
                if (e.clientY < 60) showNav();
            });

            // Keep visible on hover
            nav.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
            nav.addEventListener('mouseleave', () => {
                hideTimeout = setTimeout(() => nav.classList.remove('visible'), 1500);
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') hideNav();
                if (e.key === 'ArrowLeft' && ${prevNum || 0}) window.location.href = '${prevHref}';
                if (e.key === 'ArrowRight' && ${nextNum || 0}) window.location.href = '${nextHref}';
            });
        })();
    </script>
`;
};

// Get all style files
const files = fs.readdirSync(designDir)
    .filter(f => f.match(/^style-\d+-.*\.html$/))
    .sort((a, b) => {
        const numA = parseInt(a.match(/style-(\d+)/)[1]);
        const numB = parseInt(b.match(/style-(\d+)/)[1]);
        return numA - numB;
    });

console.log(`Found ${files.length} style files to update...`);

let updated = 0;
let skipped = 0;

files.forEach(file => {
    const filePath = path.join(designDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has gallery nav
    if (content.includes('gallery-nav')) {
        console.log(`  Skipping ${file} (already has navigation)`);
        skipped++;
        return;
    }

    // Extract style number from filename
    const numMatch = file.match(/style-(\d+)/);
    if (!numMatch) {
        console.log(`  Skipping ${file} (couldn't parse number)`);
        skipped++;
        return;
    }

    const styleNum = parseInt(numMatch[1]);
    const styleName = styleNameMap[styleNum] || `Style ${styleNum}`;

    // Inject CSS before </style>
    const styleCloseIndex = content.lastIndexOf('</style>');
    if (styleCloseIndex === -1) {
        console.log(`  Skipping ${file} (no </style> found)`);
        skipped++;
        return;
    }

    content = content.slice(0, styleCloseIndex) + navCSS + '\n    ' + content.slice(styleCloseIndex);

    // Inject HTML after <body> or <body ...>
    const bodyMatch = content.match(/<body[^>]*>/);
    if (!bodyMatch) {
        console.log(`  Skipping ${file} (no <body> found)`);
        skipped++;
        return;
    }

    const bodyIndex = content.indexOf(bodyMatch[0]) + bodyMatch[0].length;
    content = content.slice(0, bodyIndex) + navHTML(styleNum, styleName) + content.slice(bodyIndex);

    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Updated ${file}`);
    updated++;
});

console.log(`\nComplete! Updated ${updated} files, skipped ${skipped} files.`);
