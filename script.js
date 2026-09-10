/**
 * DITO WEB DESIGN - CLIENT-SIDE ARCHITECTURE & INTERACTIVE ENGINE
 * Features:
 *  - Web Audio Synthesizer (Zero asset sound engine)
 *  - Interactive Particle Physics & Matrix Digital Rain Canvas
 *  - Cyber Command Terminal / HUD (Ctrl + K)
 *  - Real-time Project Cost & Timeline Estimator
 *  - Theme Engine (Amber, Cyan, Violet, Matrix)
 *  - Live IST Clock & Telemetry
 *  - Case Study Modal & Project Filters
 *  - Mouse Spotlight Tracker
 *  - Testimonial Carousel
 *  - Mobile Glass Drawer
 */

// ==========================================================================
// 1. WEB AUDIO API SYNTHESIZER (Tactile Sci-Fi Audio Micro-Feedback)
// ==========================================================================
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = localStorage.getItem('dito_sound_enabled') === 'true';
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.initContext();
        this.enabled = !this.enabled;
        localStorage.setItem('dito_sound_enabled', this.enabled);
        if (this.enabled) {
            this.playSuccess();
        }
        return this.enabled;
    }

    playHover() {
        if (!this.enabled) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(620, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

            gain.gain.setValueAtTime(0.025, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {
            // Audio context policy fallback
        }
    }

    playClick() {
        if (!this.enabled) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(340, now);
            osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);

            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.07);
        } catch (e) {}
    }

    playKey() {
        if (!this.enabled) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800 + Math.random() * 200, now);

            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.03);
        } catch (e) {}
    }

    playSuccess() {
        if (!this.enabled) return;
        this.initContext();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const start = now + i * 0.08;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);

                gain.gain.setValueAtTime(0.05, start);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(start);
                osc.stop(start + 0.25);
            });
        } catch (e) {}
    }
}

const sounds = new SoundEngine();

// Setup Sound UI Controls
const audioBtn = document.getElementById('audioToggleBtn');
if (audioBtn) {
    if (sounds.enabled) {
        audioBtn.classList.add('active');
    }

    audioBtn.addEventListener('click', () => {
        const isEnabled = sounds.toggle();
        audioBtn.classList.toggle('active', isEnabled);
    });
}

// Global sound event delegation
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-sound="hover"], .btn, .nav-link, .service-vcard, .hint-tag, .type-card');
    if (target) {
        sounds.playHover();
    }
});

document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-sound="click"], .btn, button, .type-card, .addon-checkbox, .hint-tag');
    if (target) {
        sounds.playClick();
    }
});

// ==========================================================================
// 2. CANVAS ENGINE (Particle Mesh Physics & Matrix Rain Easter Egg)
// ==========================================================================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let canvasWidth = (canvas.width = window.innerWidth);
let canvasHeight = (canvas.height = window.innerHeight);

let isMatrixMode = false;
let particles = [];
let matrixDrops = [];
const matrixChars = '0123456789ABCDEFアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

const mouse = {
    x: null,
    y: null,
    radius: 140
};

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.speedX = (Math.random() - 0.5) * 0.7;
        this.speedY = (Math.random() - 0.5) * 0.7;
        this.alpha = Math.random() * 0.6 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse repulsion
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const dirX = dx / distance;
                const dirY = dy / distance;
                this.x -= dirX * force * 3;
                this.y -= dirY * force * 3;
            }
        }

        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((canvasWidth * canvasHeight) / 12000), 90);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}

function initMatrix() {
    matrixDrops = [];
    const columns = Math.floor(canvasWidth / 20);
    for (let i = 0; i < columns; i++) {
        matrixDrops[i] = Math.random() * -100;
    }
}

function renderCanvas() {
    if (!isMatrixMode) {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Render particle connections
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 110) {
                    const alpha = (1 - dist / 110) * 0.15;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    } else {
        // Matrix digital rain
        ctx.fillStyle = 'rgba(6, 7, 10, 0.1)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#10b981';
        ctx.font = '15px "JetBrains Mono", monospace';

        for (let i = 0; i < matrixDrops.length; i++) {
            const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            const x = i * 20;
            const y = matrixDrops[i] * 20;

            ctx.fillText(char, x, y);

            if (y > canvasHeight && Math.random() > 0.975) {
                matrixDrops[i] = 0;
            }
            matrixDrops[i]++;
        }
    }

    requestAnimationFrame(renderCanvas);
}

initParticles();
renderCanvas();

window.addEventListener('resize', () => {
    canvasWidth = canvas.width = window.innerWidth;
    canvasHeight = canvas.height = window.innerHeight;
    if (isMatrixMode) initMatrix();
    else initParticles();
});

// ==========================================================================
// 3. CYBER COMMAND TERMINAL / HUD (Ctrl + K)
// ==========================================================================
const hudBackdrop = document.getElementById('hudBackdrop');
const hudOpenBtn = document.getElementById('hudOpenBtn');
const hudCloseBtn = document.getElementById('hudCloseBtn');
const hudInput = document.getElementById('hudCommandInput');
const hudOutput = document.getElementById('hudOutput');
const hudRunBtn = document.getElementById('hudRunBtn');
const hintTags = document.querySelectorAll('.hint-tag');

function openHUD() {
    hudBackdrop.classList.add('open');
    setTimeout(() => hudInput.focus(), 100);
    sounds.playClick();
}

function closeHUD() {
    hudBackdrop.classList.remove('open');
    hudInput.value = '';
    sounds.playClick();
}

if (hudOpenBtn) hudOpenBtn.addEventListener('click', openHUD);
if (hudCloseBtn) hudCloseBtn.addEventListener('click', closeHUD);

hudBackdrop.addEventListener('click', (e) => {
    if (e.target === hudBackdrop) closeHUD();
});

window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (hudBackdrop.classList.contains('open')) closeHUD();
        else openHUD();
    }
    if (e.key === 'Escape') {
        if (hudBackdrop.classList.contains('open')) closeHUD();
        closeCaseStudyModal();
        closeMobileDrawer();
    }
});

function appendHUDLine(text, isCommand = false) {
    const p = document.createElement('p');
    if (isCommand) {
        p.innerHTML = `<span class="hud-prompt">dito@core:~$</span> ${text}`;
    } else {
        p.innerHTML = text;
    }
    hudOutput.appendChild(p);
    hudOutput.scrollTop = hudOutput.scrollHeight;
}

function executeCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    appendHUDLine(cmd, true);
    sounds.playKey();

    const parts = cmd.split(' ');
    const root = parts[0];
    const arg = parts[1];

    switch (root) {
        case 'help':
            appendHUDLine(
                `<strong>AVAILABLE COMMANDS:</strong><br>` +
                `• <code>services</code> : Explore service verticals<br>` +
                `• <code>skills</code> : Explore technical arsenal<br>` +
                `• <code>quote</code> : Open interactive cost estimator<br>` +
                `• <code>contact</code> : Transmit direct message<br>` +
                `• <code>theme [amber|cyan|violet|matrix]</code> : Change UI wavelength<br>` +
                `• <code>matrix</code> : Toggle Matrix Rain background engine<br>` +
                `• <code>sound</code> : Toggle tactile sound engine<br>` +
                `• <code>about</code> : View core philosophy<br>` +
                `• <code>clear</code> : Purge console memory`
            );
            break;

        case 'services':
        case 'projects':
            appendHUDLine(`> Routing to Core Services & Architecture...`);
            setTimeout(() => {
                closeHUD();
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
            }, 600);
            break;

        case 'skills':
        case 'arsenal':
            appendHUDLine(`> Routing to Technical Arsenal...`);
            setTimeout(() => {
                closeHUD();
                document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
            }, 600);
            break;

        case 'quote':
        case 'estimator':
        case 'calc':
            appendHUDLine(`> Routing to Interactive Project Estimator...`);
            setTimeout(() => {
                closeHUD();
                document.getElementById('estimator')?.scrollIntoView({ behavior: 'smooth' });
            }, 600);
            break;

        case 'contact':
        case 'hire':
            appendHUDLine(`> Initializing contact transmission pipeline...`);
            setTimeout(() => {
                closeHUD();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }, 600);
            break;

        case 'theme':
            const themes = {
                amber: 'amber-sunset',
                cyan: 'cyber-cyan',
                violet: 'hyper-violet',
                matrix: 'matrix-emerald'
            };
            if (arg && themes[arg]) {
                setTheme(themes[arg]);
                appendHUDLine(`> Theme frequency tuned to <strong>${arg.toUpperCase()}</strong>.`);
            } else {
                appendHUDLine(`> Usage: <code>theme amber</code>, <code>theme cyan</code>, <code>theme violet</code>, <code>theme matrix</code>`);
            }
            break;

        case 'matrix':
            isMatrixMode = !isMatrixMode;
            if (isMatrixMode) {
                initMatrix();
                appendHUDLine(`<span style="color:#10b981;">> Entering Matrix digital rain mode. Welcome to the construct.</span>`);
            } else {
                initParticles();
                appendHUDLine(`> Reverting to particle physics grid.`);
            }
            break;

        case 'sound':
            const sActive = sounds.toggle();
            if (audioBtn) audioBtn.classList.toggle('active', sActive);
            appendHUDLine(`> Sound engine is now <strong>${sActive ? 'ENABLED' : 'MUTED'}</strong>.`);
            break;

        case 'about':
            appendHUDLine(`> Architect: Aditya (Dito)<br>> Ethos: Mathematical code + emotional luxury aesthetics.`);
            setTimeout(() => {
                closeHUD();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }, 600);
            break;

        case 'clear':
            hudOutput.innerHTML = '';
            break;

        default:
            appendHUDLine(`> Command not recognized: <code>${cmd}</code>. Type <code>help</code> for options.`);
            break;
    }

    hudInput.value = '';
}

if (hudInput) {
    hudInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            executeCommand(hudInput.value);
        } else {
            sounds.playKey();
        }
    });
}

if (hudRunBtn) {
    hudRunBtn.addEventListener('click', () => {
        executeCommand(hudInput.value);
    });
}

hintTags.forEach(tag => {
    tag.addEventListener('click', () => {
        const cmd = tag.getAttribute('data-cmd');
        if (cmd) executeCommand(cmd);
    });
});

// ==========================================================================
// 4. THEME SWITCHER ENGINE
// ==========================================================================
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeMenu = document.getElementById('themeMenu');
const themeOptions = document.querySelectorAll('[data-set-theme]');

function setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('dito_theme', themeName);

    themeOptions.forEach(opt => {
        if (opt.getAttribute('data-set-theme') === themeName) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
    sounds.playClick();
}

// Load persisted theme
const savedTheme = localStorage.getItem('dito_theme') || 'amber-sunset';
setTheme(savedTheme);

if (themeToggleBtn && themeMenu) {
    themeToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        themeMenu.classList.remove('show');
    });
}

themeOptions.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const t = btn.getAttribute('data-set-theme');
        if (t) setTheme(t);
        if (themeMenu) themeMenu.classList.remove('show');
    });
});

// ==========================================================================
// 5. INTERACTIVE PROJECT ESTIMATOR ENGINE
// ==========================================================================
const projectTypeRadios = document.querySelectorAll('input[name="projectType"]');
const typeCards = document.querySelectorAll('.type-card');
const pageSlider = document.getElementById('pageRange');
const pageCountBadge = document.getElementById('pageCountBadge');
const addonSeo = document.getElementById('addonSeo');
const addonMotion = document.getElementById('addonMotion');
const addonCms = document.getElementById('addonCms');
const addonExpress = document.getElementById('addonExpress');

const estimatedPriceEl = document.getElementById('estimatedPrice');
const estimatedTimeEl = document.getElementById('estimatedTime');
const estimatedArchEl = document.getElementById('estimatedArch');
const bookEstimatedBtn = document.getElementById('bookEstimatedBtn');

const baseConfig = {
    landing: {
        name: 'Landing Page',
        basePrice: 5000,
        baseDaysMin: 3,
        baseDaysMax: 5,
        arch: 'Next.js / React / Optimized Frontend'
    },
    website: {
        name: 'Multi-Page Website',
        basePrice: 15000,
        baseDaysMin: 5,
        baseDaysMax: 10,
        arch: 'Next.js / React / Tailwind CSS'
    },
    ecommerce: {
        name: 'E-Commerce',
        basePrice: 35000,
        baseDaysMin: 10,
        baseDaysMax: 20,
        arch: 'Next.js / React / PostgreSQL / Payment Gateway'
    },
    saas: {
        name: 'Custom SaaS / Web App',
        basePrice: 60000,
        baseDaysMin: 15,
        baseDaysMax: 30,
        arch: 'Next.js / Node.js / PostgreSQL / API Architecture'
    }
};

const sliderTiers = {
    1: { label: '1–3 Pages', cost: 0, daysAddMin: 0, daysAddMax: 0 },
    2: { label: '4–7 Pages', cost: 5000, daysAddMin: 2, daysAddMax: 3 },
    3: { label: '8–14 Pages', cost: 15000, daysAddMin: 4, daysAddMax: 6 },
    4: { label: '15+ Pages', cost: 35000, daysAddMin: 7, daysAddMax: 10 }
};

function formatINR(val) {
    return val.toLocaleString('en-IN');
}

function calculateEstimate() {
    let selectedType = 'landing';
    projectTypeRadios.forEach(radio => {
        if (radio.checked) selectedType = radio.value;
    });

    typeCards.forEach(card => {
        const input = card.querySelector('input');
        if (input && input.checked) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    const config = baseConfig[selectedType] || baseConfig.landing;
    const pageTier = pageSlider ? parseInt(pageSlider.value) : 1;
    const tierData = sliderTiers[pageTier] || sliderTiers[1];

    if (pageCountBadge) {
        pageCountBadge.textContent = tierData.label;
    }

    let rawPrice = config.basePrice + tierData.cost;
    let dMin = config.baseDaysMin + tierData.daysAddMin;
    let dMax = config.baseDaysMax + tierData.daysAddMax;

    // Premium Addons calculation
    if (addonSeo && addonSeo.checked) {
        rawPrice += 10000;
        dMin += 1;
        dMax += 2;
    }
    if (addonMotion && addonMotion.checked) {
        rawPrice += 20000;
        dMin += 2;
        dMax += 3;
    }
    if (addonCms && addonCms.checked) {
        rawPrice += 15000;
        dMin += 3;
        dMax += 5;
    }
    if (addonExpress && addonExpress.checked) {
        rawPrice += 10000;
        dMin = Math.max(3, Math.round(dMin * 0.65));
        dMax = Math.max(7, Math.round(dMax * 0.7));
    }

    // Strict Bounds: Min ₹5,000 | Max ₹1,50,000
    let isCapped = false;
    if (rawPrice >= 150000) {
        rawPrice = 150000;
        isCapped = true;
    }
    if (rawPrice < 5000) {
        rawPrice = 5000;
    }

    // Animate price counter with Indian currency formatting
    if (estimatedPriceEl) {
        const currentStr = estimatedPriceEl.textContent.replace(/[^0-9]/g, '');
        const currentVal = parseInt(currentStr) || 5000;
        animateINR(estimatedPriceEl, currentVal, rawPrice, 350, isCapped);
    }

    // Dynamic timeline range
    if (estimatedTimeEl) {
        const expressTag = (addonExpress && addonExpress.checked) ? ' (Priority Express)' : '';
        const maxPlus = (selectedType === 'saas' && !addonExpress?.checked) ? '+' : '';
        estimatedTimeEl.textContent = `${dMin} – ${dMax}${maxPlus} Days${expressTag}`;
    }

    // Dynamic architecture
    if (estimatedArchEl) {
        estimatedArchEl.textContent = config.arch;
    }
}

let priceAnimTimer = null;

function animateINR(elem, start, end, duration, isCapped) {
    if (priceAnimTimer) {
        clearInterval(priceAnimTimer);
        priceAnimTimer = null;
    }
    if (start === end) {
        elem.textContent = formatINR(end) + (isCapped ? '+' : '');
        return;
    }
    const range = end - start;
    let current = start;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = range / steps;
    priceAnimTimer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            elem.textContent = formatINR(end) + (isCapped ? '+' : '');
            clearInterval(priceAnimTimer);
            priceAnimTimer = null;
        } else {
            elem.textContent = formatINR(Math.round(current));
        }
    }, stepTime);
}

// Helper to extract active estimator specifications
function getCurrentEstimatorSpecs() {
    let selectedTypeKey = 'landing';
    let selectedTypeName = 'Landing Page & High-Conversion Funnel';
    projectTypeRadios.forEach(r => {
        if (r.checked) {
            selectedTypeKey = r.value;
            selectedTypeName = baseConfig[r.value]?.name || 'Landing Page & High-Conversion Funnel';
        }
    });

    const tierIndex = pageSlider ? parseInt(pageSlider.value) : 1;
    const pages = sliderTiers[tierIndex]?.label || '1–3 Pages';

    const activeAddons = [];
    if (addonSeo && addonSeo.checked) activeAddons.push('Full SEO Mastery (+₹10,000)');
    if (addonMotion && addonMotion.checked) activeAddons.push('Luxury Motion & 3D (+₹20,000)');
    if (addonCms && addonCms.checked) activeAddons.push('Headless CMS (+₹15,000)');
    if (addonExpress && addonExpress.checked) activeAddons.push('Express Sprint Delivery (+₹10,000)');

    const priceText = estimatedPriceEl ? estimatedPriceEl.textContent.trim() : '5,000';
    const timeText = estimatedTimeEl ? estimatedTimeEl.textContent.trim() : '3 – 5 Days';
    const archText = estimatedArchEl ? estimatedArchEl.textContent.trim() : 'Next.js / React';

    return {
        typeKey: selectedTypeKey,
        typeName: selectedTypeName,
        pages,
        addons: activeAddons,
        addonsStr: activeAddons.length > 0 ? activeAddons.join(', ') : 'None',
        price: `₹${priceText} INR`,
        time: timeText,
        arch: archText
    };
}

// Live Synchronize Estimator with Contact Inquiry Form
function syncEstimatorPreview() {
    const specs = getCurrentEstimatorSpecs();

    const previewPrice = document.getElementById('previewPrice');
    const previewTime = document.getElementById('previewTime');
    const previewPages = document.getElementById('previewPages');
    const previewArch = document.getElementById('previewArch');
    const previewAddons = document.getElementById('previewAddons');

    if (previewPrice) previewPrice.textContent = specs.price;
    if (previewTime) previewTime.textContent = specs.time;
    if (previewPages) previewPages.textContent = specs.pages;
    if (previewArch) previewArch.textContent = specs.arch;
    if (previewAddons) {
        previewAddons.textContent = specs.addons.length > 0 ? specs.addons.join(', ') : 'Standard Build (No Add-ons)';
    }

    // Update hidden form payload fields
    const inqProjectType = document.getElementById('inqProjectType');
    const inqPages = document.getElementById('inqPages');
    const inqAddons = document.getElementById('inqAddons');
    const inqPrice = document.getElementById('inqPrice');
    const inqTime = document.getElementById('inqTime');
    const inqArch = document.getElementById('inqArch');

    if (inqProjectType) inqProjectType.value = specs.typeName;
    if (inqPages) inqPages.value = specs.pages;
    if (inqAddons) inqAddons.value = specs.addonsStr;
    if (inqPrice) inqPrice.value = specs.price;
    if (inqTime) inqTime.value = specs.time;
    if (inqArch) inqArch.value = specs.arch;

    // Sync select dropdown
    const selectBox = document.getElementById('projectVerticalSelect');
    if (selectBox) {
        for (let i = 0; i < selectBox.options.length; i++) {
            if (selectBox.options[i].value === specs.typeName || selectBox.options[i].text.toLowerCase().includes(specs.typeKey)) {
                selectBox.selectedIndex = i;
                break;
            }
        }
    }
}

// Attach estimator change listeners
projectTypeRadios.forEach(radio => radio.addEventListener('change', () => {
    calculateEstimate();
    syncEstimatorPreview();
}));

if (pageSlider) pageSlider.addEventListener('input', () => {
    calculateEstimate();
    syncEstimatorPreview();
});

[addonSeo, addonMotion, addonCms, addonExpress].forEach(cb => {
    if (cb) cb.addEventListener('change', () => {
        calculateEstimate();
        syncEstimatorPreview();
    });
});

calculateEstimate();
syncEstimatorPreview();

// Start Your Project CTA -> Populate contact form & smooth scroll
if (bookEstimatedBtn) {
    bookEstimatedBtn.addEventListener('click', () => {
        syncEstimatorPreview();
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        setTimeout(() => {
            const nameInput = document.getElementById('senderName');
            if (nameInput) nameInput.focus();
        }, 700);
    });
}

// Edit Specs Link in Preview Card -> Smooth scroll back to Estimator
const editEstimatorBtn = document.getElementById('editEstimatorBtn');
if (editEstimatorBtn) {
    editEstimatorBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const estimatorSection = document.getElementById('estimator');
        if (estimatorSection) {
            estimatorSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ==========================================================================
// 6. LIVE IST CLOCK (Telemetry & Real-Time Sync)
// ==========================================================================
function updateLiveClock() {
    const clockEl = document.getElementById('liveClock');
    if (!clockEl) return;

    try {
        const options = {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        const formatter = new Intl.DateTimeFormat([], options);
        clockEl.textContent = formatter.format(new Date());
    } catch (e) {
        const d = new Date();
        clockEl.textContent = d.toLocaleTimeString();
    }
}

setInterval(updateLiveClock, 1000);
updateLiveClock();

// ==========================================================================
// 7. MOUSE SPOTLIGHT TRACKER ON GLASS CARDS
// ==========================================================================
const spotlightCards = document.querySelectorAll('.spotlight-card');
spotlightCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// ==========================================================================
// 8. TECHNICAL ARSENAL CATEGORY TABS
// ==========================================================================
const arsenalTabs = document.querySelectorAll('.arsenal-tab-btn');
const arsenalCards = document.querySelectorAll('.arsenal-card');

arsenalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        arsenalTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const cat = tab.getAttribute('data-tab');

        arsenalCards.forEach(card => {
            const cardCat = card.getAttribute('data-cat');
            if (cat === 'all' || cardCat === cat) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ==========================================================================
// 9. MOBILE NAVIGATION DRAWER
// ==========================================================================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileDrawer = document.getElementById('mobileDrawer');
const drawerCloseBtn = document.getElementById('drawerCloseBtn');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const mobileNavLinks = document.querySelectorAll('.mobile-link');

function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    sounds.playClick();
}

function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
}

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeMobileDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeMobileDrawer);

mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileDrawer);
});

// ==========================================================================
// 10. CLIPBOARD UTILITY (Direct Email)
// ==========================================================================
const copyEmailCard = document.getElementById('copyEmailCard');
if (copyEmailCard) {
    copyEmailCard.addEventListener('click', () => {
        const email = document.getElementById('directEmailText')?.innerText || 'ditowebdesign@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
            const chVal = copyEmailCard.querySelector('.ch-val');
            const original = chVal.innerText;
            chVal.innerText = 'Copied to Clipboard!';
            chVal.style.color = 'var(--accent)';
            sounds.playSuccess();
            setTimeout(() => {
                chVal.innerText = original;
                chVal.style.color = 'var(--text-pure)';
            }, 2500);
        });
    });
}

// ==========================================================================
// 13. CLIENT INQUIRY ENGINE & SUBMISSION HANDLER
// ==========================================================================
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const inquirySuccessScreen = document.getElementById('inquirySuccessScreen');
const sendAnotherBtn = document.getElementById('sendAnotherBtn');
const messageTextarea = document.getElementById('messageContent');
const charCountSpan = document.getElementById('charCount');

// Character counter for Client Message textarea (0 / 1000 characters)
if (messageTextarea && charCountSpan) {
    const updateCharCounter = () => {
        const len = messageTextarea.value.length;
        charCountSpan.textContent = len;
        const counterWrap = charCountSpan.closest('.char-counter');
        if (counterWrap) {
            counterWrap.classList.toggle('limit-near', len >= 850 && len < 1000);
            counterWrap.classList.toggle('limit-max', len >= 1000);
        }
    };
    messageTextarea.addEventListener('input', updateCharCounter);
    updateCharCounter();
}

// Clear inline error indicators on user input / edit
const formInputsToClear = [
    { el: document.getElementById('senderName'), wrap: document.getElementById('fieldWrapName') },
    { el: document.getElementById('senderEmail'), wrap: document.getElementById('fieldWrapEmail') },
    { el: document.getElementById('senderPhone'), wrap: document.getElementById('fieldWrapPhone') },
    { el: document.getElementById('projectVerticalSelect'), wrap: document.getElementById('fieldWrapProject') },
    { el: document.getElementById('messageContent'), wrap: document.getElementById('fieldWrapMessage') }
];

formInputsToClear.forEach(item => {
    if (item.el && item.wrap) {
        const clearErr = () => {
            item.wrap.classList.remove('has-error');
            if (formStatus) {
                formStatus.textContent = '';
                formStatus.className = 'form-feedback';
            }
        };
        item.el.addEventListener('input', clearErr);
        item.el.addEventListener('change', clearErr);
    }
});

// Dropdown sync with hidden project type field
const selectBox = document.getElementById('projectVerticalSelect');
if (selectBox) {
    selectBox.addEventListener('change', (e) => {
        const inqProjectType = document.getElementById('inqProjectType');
        if (inqProjectType) inqProjectType.value = e.target.value;
    });
}

// Formatter for Instant WhatsApp Dispatch to +91 6363561751
function formatWhatsAppInquiryMessage(payload) {
    const lines = [
        `*NEW PROJECT INQUIRY — Dito Web Design*`,
        ``,
        `*Client Name:* ${payload.name}`,
        `*Email:* ${payload.email}`,
        payload.phone ? `*Phone/WhatsApp:* ${payload.phone}` : null,
        payload.company ? `*Company/Brand:* ${payload.company}` : null,
        ``,
        `*Project Estimator Specifications:*`,
        `• *Project Vertical:* ${payload.projectType}`,
        `• *Scope & Volume:* ${payload.pages}`,
        `• *Selected Add-ons:* ${payload.addons}`,
        `• *Architecture:* ${payload.arch}`,
        `• *Estimated Timeline:* ${payload.estimatedTime}`,
        `• *Estimated Investment:* ${payload.estimatedPrice}`,
        ``,
        `*Client Message / Requirements:*`,
        `${payload.message}`
    ].filter(l => l !== null);

    return lines.join('\n');
}

// Collects and validates form fields for both Email and WhatsApp routes
function getValidatedInquiryPayload() {
    const nameInput = document.getElementById('senderName');
    const emailInput = document.getElementById('senderEmail');
    const phoneInput = document.getElementById('senderPhone');
    const companyInput = document.getElementById('senderCompany');
    const selectBox = document.getElementById('projectVerticalSelect');
    const messageInput = document.getElementById('messageContent');
    const hpInput = document.getElementById('website_hp');

    const inqProjectType = document.getElementById('inqProjectType');
    const inqPages = document.getElementById('inqPages');
    const inqAddons = document.getElementById('inqAddons');
    const inqPrice = document.getElementById('inqPrice');
    const inqTime = document.getElementById('inqTime');
    const inqArch = document.getElementById('inqArch');

    let hasError = false;
    let firstInvalidField = null;

    const triggerFieldError = (wrapId, errorId, msg) => {
        const wrap = document.getElementById(wrapId);
        const errEl = document.getElementById(errorId);
        if (wrap) wrap.classList.add('has-error');
        if (errEl && msg) errEl.textContent = msg;
        if (!firstInvalidField && wrap) {
            firstInvalidField = wrap.querySelector('input, textarea, select');
        }
        hasError = true;
    };

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const emailVal = emailInput ? emailInput.value.trim() : '';
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    const companyVal = companyInput ? companyInput.value.trim() : '';
    const projectVal = selectBox ? selectBox.value : (inqProjectType ? inqProjectType.value : 'Landing Page & High-Conversion Funnel');
    const messageVal = messageInput ? messageInput.value.trim() : '';
    const hpVal = hpInput ? hpInput.value.trim() : '';

    if (!nameVal || nameVal.length < 2) {
        triggerFieldError('fieldWrapName', 'nameError', 'Please enter your full name (minimum 2 characters).');
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailPattern.test(emailVal)) {
        triggerFieldError('fieldWrapEmail', 'emailError', 'Please enter a valid email address.');
    }

    if (phoneVal && phoneVal.replace(/[^0-9]/g, '').length < 7) {
        triggerFieldError('fieldWrapPhone', 'phoneError', 'Please enter a valid phone number or leave blank.');
    }

    if (!projectVal) {
        triggerFieldError('fieldWrapProject', 'projectError', 'Please select a project vertical.');
    }

    if (!messageVal || messageVal.length < 10) {
        triggerFieldError('fieldWrapMessage', 'messageError', 'Please describe your project goals or requirements (minimum 10 characters).');
    } else if (messageVal.length > 1000) {
        triggerFieldError('fieldWrapMessage', 'messageError', 'Message exceeds the 1,000 character limit.');
    }

    if (hasError) {
        if (formStatus) {
            formStatus.textContent = 'Please review and correct the highlighted fields before sending.';
            formStatus.className = 'form-feedback error';
        }
        if (firstInvalidField) firstInvalidField.focus();
        return null;
    }

    return {
        name: nameVal,
        email: emailVal,
        phone: phoneVal,
        company: companyVal,
        projectType: projectVal,
        pages: inqPages ? inqPages.value : '1–3 Pages',
        addons: inqAddons ? inqAddons.value : 'None',
        estimatedPrice: inqPrice ? inqPrice.value : '₹5,000 INR',
        estimatedTime: inqTime ? inqTime.value : '3 – 5 Days',
        arch: inqArch ? inqArch.value : 'Next.js / React',
        message: messageVal,
        website_hp: hpVal
    };
}

function displayConfirmationScreen(payload) {
    const scProjectType = document.getElementById('scProjectType');
    const scInvestment = document.getElementById('scInvestment');
    const scTimeline = document.getElementById('scTimeline');
    const scClientName = document.getElementById('scClientName');
    const scClientEmail = document.getElementById('scClientEmail');
    const scArchitecture = document.getElementById('scArchitecture');
    const confirmWhatsappLink = document.getElementById('confirmWhatsappLink');

    if (scProjectType) scProjectType.textContent = payload.projectType;
    if (scInvestment) scInvestment.textContent = payload.estimatedPrice;
    if (scTimeline) scTimeline.textContent = payload.estimatedTime;
    if (scClientName) scClientName.textContent = payload.name;
    if (scClientEmail) scClientEmail.textContent = payload.email;
    if (scArchitecture) scArchitecture.textContent = payload.arch;

    // Build personalized WhatsApp deep link
    if (confirmWhatsappLink) {
        const waMsg = formatWhatsAppInquiryMessage(payload);
        confirmWhatsappLink.href = `https://wa.me/916363561751?text=${encodeURIComponent(waMsg)}`;
    }

    if (contactForm) contactForm.style.display = 'none';
    if (inquirySuccessScreen) {
        inquirySuccessScreen.style.display = 'block';
        inquirySuccessScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (window.lucide) lucide.createIcons();
}

if (contactForm) {
    // 1. ROUTE A: Send via Email to ditowebdesign@gmail.com
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = getValidatedInquiryPayload();
        if (!payload) return;

        const submitBtn = document.getElementById('submitBtn');
        if (formStatus) {
            formStatus.textContent = '';
            formStatus.className = 'form-feedback';
        }

        const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="btn-text">Sending to ditowebdesign@gmail.com...</span> <i data-lucide="loader-2" class="spin"></i>`;
            if (window.lucide) lucide.createIcons();
        }

        try {
            const res = await fetch('/api/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                if (submitBtn) {
                    submitBtn.innerHTML = `<span class="btn-text">Message Sent ✓</span> <i data-lucide="check-circle-2"></i>`;
                    submitBtn.style.background = '#10b981';
                    if (window.lucide) lucide.createIcons();
                }
                if (window.sounds && sounds.playSuccess) sounds.playSuccess();
                displayConfirmationScreen(payload);
            } else {
                throw new Error(data.error || 'Server rejected transmission.');
            }
        } catch (err) {
            console.error('Inquiry Submission Error:', err);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
                submitBtn.style.background = '';
                if (window.lucide) lucide.createIcons();
            }

            if (formStatus) {
                formStatus.textContent = err.message || 'Your inquiry could not be sent right now. You can also send directly via WhatsApp (+91 6363561751).';
                formStatus.className = 'form-feedback error';
            }
        }
    });

    // 2. ROUTE B: Instant WhatsApp Transmission to +91 6363561751
    const whatsappInquiryBtn = document.getElementById('whatsappInquiryBtn');
    if (whatsappInquiryBtn) {
        whatsappInquiryBtn.addEventListener('click', () => {
            const payload = getValidatedInquiryPayload();
            if (!payload) return;

            // Silently dispatch email backup to ditowebdesign@gmail.com
            fetch('/api/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(e => console.log('Silent backup email dispatch logged:', e.message));

            // Immediately launch WhatsApp with pre-filled specs
            const waMsg = formatWhatsAppInquiryMessage(payload);
            const waUrl = `https://wa.me/916363561751?text=${encodeURIComponent(waMsg)}`;
            window.open(waUrl, '_blank');

            if (window.sounds && sounds.playSuccess) sounds.playSuccess();
            displayConfirmationScreen(payload);
        });
    }
}

// "Send Another Inquiry" action handler
if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', () => {
        if (contactForm) {
            contactForm.reset();
            const charCountEl = document.getElementById('charCount');
            if (charCountEl) charCountEl.textContent = '0';
            document.querySelectorAll('.input-field.has-error').forEach(el => el.classList.remove('has-error'));
            contactForm.style.display = 'block';
        }
        if (inquirySuccessScreen) {
            inquirySuccessScreen.style.display = 'none';
        }
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span class="btn-text">Send Project Inquiry</span> <i data-lucide="arrow-up-right" class="btn-icon"></i>`;
            submitBtn.style.background = '';
        }
        if (formStatus) {
            formStatus.textContent = '';
            formStatus.className = 'form-feedback';
        }
        syncEstimatorPreview();
        contactForm?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            const nameInput = document.getElementById('senderName');
            if (nameInput) nameInput.focus();
        }, 500);
        if (window.lucide) lucide.createIcons();
    });
}

// ==========================================================================
// 14. SCROLL REVEAL & COUNTERS OBSERVER
// ==========================================================================
const revealElements = document.querySelectorAll('.reveal');
let countersTriggered = false;

const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');

            if (!countersTriggered && entry.target.classList.contains('bento-stats-section')) {
                startCounterAnimation();
                countersTriggered = true;
            }
        }
    });
}, observerOptions);

revealElements.forEach(el => revealObserver.observe(el));

function startCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1800;
        const startTime = performance.now();

        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(ease * target);

            counter.innerText = current;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.innerText = target;
            }
        }
        requestAnimationFrame(update);
    });
}

// ==========================================================================
// 15. ACTIVE NAV LINK HIGHLIGHTER ON SCROLL
// ==========================================================================
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');
const mainHeader = document.getElementById('mainHeader');

window.addEventListener('scroll', () => {
    if (mainHeader) {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    }

    let currentSection = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
            currentSection = sec.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
});
