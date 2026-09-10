const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ==============================================================================
// 1. ENVIRONMENT VARIABLES LOADER (Zero-dependency .env reader)
// ==============================================================================
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) return;
    try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx !== -1) {
                const key = trimmed.slice(0, eqIdx).trim();
                let val = trimmed.slice(eqIdx + 1).trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                if (!process.env[key]) {
                    process.env[key] = val;
                }
            }
        });
    } catch (e) {
        console.error('Warning: Could not load .env file:', e.message);
    }
}
loadEnv();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'ditowebdesign@gmail.com';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Dito Web Design <onboarding@resend.dev>';

// ==============================================================================
// 2. RATE LIMITING ENGINE (In-Memory IP Bucket)
// ==============================================================================
const rateLimitMap = new Map();
function isRateLimited(ip) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes
    const maxRequests = 5;
    const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < windowMs);
    if (timestamps.length >= maxRequests) {
        return true;
    }
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);
    return false;
}

// ==============================================================================
// 3. SECURE RESEND EMAIL DISPATCHER
// ==============================================================================
function sendResendEmail({ to, from, subject, text, html, replyTo }) {
    return new Promise((resolve, reject) => {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey || !apiKey.trim()) {
            return reject(new Error('RESEND_API_KEY is not configured'));
        }

        const payload = JSON.stringify({
            from: from || EMAIL_FROM,
            to: Array.isArray(to) ? to : [to],
            reply_to: replyTo,
            subject,
            text,
            html
        });

        const options = {
            hostname: 'api.resend.com',
            port: 443,
            path: '/emails',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey.trim()}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve({ success: true });
                    }
                } else {
                    reject(new Error(`Resend API error (${res.statusCode}): ${data}`));
                }
            });
        });

        req.on('error', err => reject(err));
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Resend request timed out after 10s'));
        });

        req.write(payload);
        req.end();
    });
}

function formatInquiryEmail(inquiry) {
    const name = (inquiry.name || '').trim();
    const email = (inquiry.email || '').trim();
    const phone = (inquiry.phone || '').trim() || 'Not provided';
    const company = (inquiry.company || '').trim() || 'Not provided';
    const projectType = (inquiry.projectType || 'Custom Solution').trim();
    const pages = (inquiry.pages || '1–3 Pages').trim();
    const addons = (inquiry.addons || 'None').trim();
    const investment = (inquiry.estimatedPrice || '₹5,000 INR').trim();
    const timeline = (inquiry.estimatedTime || '3 – 5 Days').trim();
    const arch = (inquiry.arch || 'Next.js / React').trim();
    const message = (inquiry.message || '').trim();

    const subject = `New Project Inquiry — ${projectType} — ${name}`;

    const text = 
`NEW PROJECT INQUIRY

Client Information
------------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company}

Project Details
---------------
Project Type: ${projectType}
Pages: ${pages}
Add-ons: ${addons}

Estimated Investment: ${investment}
Estimated Timeline: ${timeline}
Architecture: ${arch}

Client Requirements
-------------------
Message:
${message}

Submitted From:
Website Project Estimator`;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0d0e; color: #f3f4f6; margin: 0; padding: 24px; }
  .container { max-width: 620px; margin: 0 auto; background: #14161b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .header { border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 24px; }
  .badge { display: inline-block; background: rgba(249, 115, 22, 0.15); color: #f97316; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; margin-bottom: 8px; }
  h1 { font-size: 22px; color: #ffffff; margin: 0 0 4px; }
  .sub { font-size: 13px; color: #9ca3af; margin: 0; }
  .section-title { font-size: 13px; font-weight: 700; color: #22d3ee; text-transform: uppercase; letter-spacing: 0.08em; margin: 24px 0 10px; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  td { padding: 7px 0; font-size: 14px; vertical-align: top; }
  .label { color: #9ca3af; width: 155px; }
  .value { color: #ffffff; font-weight: 500; }
  .price-val { color: #f97316; font-size: 16px; font-weight: 800; font-family: monospace; }
  .message-box { background: rgba(255, 255, 255, 0.03); border-left: 3px solid #f97316; padding: 16px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #e5e7eb; white-space: pre-wrap; word-break: break-word; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #27272a; font-size: 12px; color: #6b7280; text-align: center; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Inquiry Dispatch</span>
      <h1>New Project Inquiry: ${projectType}</h1>
      <p class="sub">Submitted directly from the interactive estimator.</p>
    </div>

    <div class="section-title">Client Information</div>
    <table>
      <tr><td class="label">Client Name:</td><td class="value">${name}</td></tr>
      <tr><td class="label">Email Address:</td><td class="value"><a href="mailto:${email}" style="color:#22d3ee; text-decoration:none;">${email}</a></td></tr>
      <tr><td class="label">Phone / WhatsApp:</td><td class="value">${phone}</td></tr>
      <tr><td class="label">Company / Brand:</td><td class="value">${company}</td></tr>
    </table>

    <div class="section-title">Configured Project Specs</div>
    <table>
      <tr><td class="label">Project Vertical:</td><td class="value">${projectType}</td></tr>
      <tr><td class="label">Scope & Volume:</td><td class="value">${pages}</td></tr>
      <tr><td class="label">Premium Add-ons:</td><td class="value">${addons}</td></tr>
      <tr><td class="label">Est. Investment:</td><td class="value price-val">${investment}</td></tr>
      <tr><td class="label">Est. Timeline:</td><td class="value">${timeline}</td></tr>
      <tr><td class="label">Architecture:</td><td class="value">${arch}</td></tr>
    </table>

    <div class="section-title">Client Requirements & Message</div>
    <div class="message-box">${message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

    <div class="footer">
      Transmitted via Dito Web Portfolio API Engine • ${new Date().toUTCString()}
    </div>
  </div>
</body>
</html>`;

    return { subject, text, html };
}

// ==============================================================================
// 4. API INQUIRY HANDLER
// ==============================================================================
function handleInquiryAPI(req, res) {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    // Basic Rate Limiting
    if (isRateLimited(clientIP)) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Too many requests. Please wait a few minutes before submitting again.'
        }));
        return;
    }

    let body = '';
    req.on('data', chunk => {
        body += chunk;
        // Cap payload at 50KB to protect against overflow attacks
        if (body.length > 50 * 1024) {
            res.writeHead(413, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Payload size exceeds allowable limit.' }));
            req.destroy();
        }
    });

    req.on('end', async () => {
        try {
            const data = JSON.parse(body || '{}');

            // Honeypot check: If the hidden honeypot field is filled, silently discard bot
            if (data.website_hp && data.website_hp.trim() !== '') {
                console.log(`[SPAM BLOCKED] Honeypot triggered from ${clientIP}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Message Sent Successfully' }));
                return;
            }

            // Server-Side Field Validation
            const name = (data.name || '').trim();
            const email = (data.email || '').trim();
            const projectType = (data.projectType || '').trim();
            const message = (data.message || '').trim();

            if (!name || name.length < 2) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Please enter a valid full name (minimum 2 characters).' }));
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailPattern.test(email)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Please enter a valid email address.' }));
                return;
            }

            if (!projectType) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Please select a project type.' }));
                return;
            }

            if (!message || message.length < 5) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Please enter a message regarding your project goals.' }));
                return;
            }

            if (message.length > 2000) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Message exceeds the maximum limit of 2,000 characters.' }));
                return;
            }

            const emailPayload = formatInquiryEmail(data);

            // Dispatch via Resend API if API Key is configured
            if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== '') {
                try {
                    await sendResendEmail({
                        to: CONTACT_EMAIL,
                        replyTo: email,
                        subject: emailPayload.subject,
                        text: emailPayload.text,
                        html: emailPayload.html
                    });

                    console.log(`[INQUIRY SENT] Email successfully dispatched to ${CONTACT_EMAIL} for client ${name}`);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: 'Message Sent Successfully',
                        details: {
                            name,
                            projectType,
                            estimatedPrice: data.estimatedPrice || '₹5,000 INR',
                            estimatedTime: data.estimatedTime || '3 – 5 Days'
                        }
                    }));
                } catch (sendErr) {
                    // Log the technical error on the server only. Never leak secrets to client.
                    console.error('[Resend Error - Server Log Only]:', sendErr.message);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Your message could not be sent right now. Please try again or contact me directly.'
                    }));
                }
            } else {
                // Development fallback: Log inquiry securely to console and file when API key is not yet set
                console.log('\n======================================================');
                console.log('  [DEV LOG] NEW CLIENT INQUIRY RECEIVED');
                console.log('  (Configure RESEND_API_KEY in .env for live email delivery)');
                console.log('------------------------------------------------------');
                console.log(`  Name:        ${name}`);
                console.log(`  Email:       ${email}`);
                console.log(`  Phone:       ${data.phone || 'Not provided'}`);
                console.log(`  Company:     ${data.company || 'Not provided'}`);
                console.log(`  Project:     ${projectType}`);
                console.log(`  Pages:       ${data.pages || '1–3 Pages'}`);
                console.log(`  Add-ons:     ${data.addons || 'None'}`);
                console.log(`  Estimate:    ${data.estimatedPrice || '₹5,000 INR'}`);
                console.log(`  Timeline:    ${data.estimatedTime || '3 – 5 Days'}`);
                console.log(`  Message:     ${message.substring(0, 100)}...`);
                console.log('======================================================\n');

                try {
                    const logDir = path.join(__dirname, 'logs');
                    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
                    const entry = `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`;
                    fs.appendFileSync(path.join(logDir, 'inquiries.log'), entry);
                } catch (logErr) {
                    // Ignore disk logging error in read-only environments
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Message Sent Successfully',
                    isDev: true,
                    details: {
                        name,
                        projectType,
                        estimatedPrice: data.estimatedPrice || '₹5,000 INR',
                        estimatedTime: data.estimatedTime || '3 – 5 Days'
                    }
                }));
            }
        } catch (err) {
            console.error('[API Parse Error]:', err.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload received.' }));
        }
    });
}

// ==============================================================================
// 5. STATIC ASSET HTTP SERVER & ROUTING
// ==============================================================================
const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0]);

    // Handle Client Inquiry API route
    if (req.method === 'POST' && (reqPath === '/api/inquiry' || reqPath === '/api/contact')) {
        handleInquiryAPI(req, res);
        return;
    }

    // Default to index.html
    if (reqPath === '/' || reqPath === '') {
        reqPath = '/index.html';
    }

    let filePath = path.join(PUBLIC_DIR, reqPath);

    // Support clean URLs without .html extension
    if (!path.extname(filePath) && fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
    }

    // Prevent directory traversal
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  Dito Web Design Portfolio is running locally!`);
    console.log(`  Local URL:        http://localhost:${PORT}`);
    console.log(`  Inquiry API:      http://localhost:${PORT}/api/inquiry`);
    console.log(`  Target Email:     ${CONTACT_EMAIL}`);
    console.log(`  WhatsApp Reach:   +91 6363561751`);
    console.log(`  Resend Key:       ${process.env.RESEND_API_KEY ? 'Configured ✓' : 'Not Set (Dev Logging Active)'}`);
    console.log(`======================================================\n`);
});
