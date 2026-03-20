import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

// --- SECURITY UTILITIES ---
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS_PER_WINDOW = 3; 

const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.replace(/[<>{}()$\s]/g, '').toLowerCase().substring(0, 255);
};
// --------------------------

if (!admin.apps.length) {
  try {
    const cleanPrivateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/^"|"$/g, '')
      : '';

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: cleanPrivateKey,
      }),
    });
  } catch (error) {
    console.log('Firebase admin initialization error:', error.stack);
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,     
    pass: process.env.SMTP_PASSWORD,  
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  // --- RATE LIMITER ---
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown-ip';
  const currentTime = Date.now();
  if (rateLimitMap.has(ip)) {
    const clientData = rateLimitMap.get(ip);
    if (currentTime < clientData.resetTime) {
      if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
      }
      clientData.count += 1;
    } else {
      rateLimitMap.set(ip, { count: 1, resetTime: currentTime + RATE_LIMIT_WINDOW_MS });
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: currentTime + RATE_LIMIT_WINDOW_MS });
  }
  // --------------------

  const email = sanitizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    const customHtmlTemplate = `
      <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 30px; background: #fafafa; border-radius: 16px; border: 1px solid #e4e4e7; text-align: center;">
        <img src="https://kintag.vercel.app/kintag-logo.png" width="60" style="border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
        <h2 style="color: #18181b; font-size: 24px; margin-bottom: 10px; font-weight: 800;">Reset Your Password</h2>
        <p style="color: #52525b; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          We received a request to reset the password for your KinTag account. Click the button below to choose a new password.
        </p>
        <a href="${resetLink}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
          Reset Password
        </a>
        <p style="color: #a1a1aa; font-size: 12px; margin-top: 40px;">
          If you didn't request this, you can safely ignore this email. Your password will not change until you create a new one.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"KinTag Security" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: '🔒 Reset your KinTag Password',
      html: customHtmlTemplate,
    });

    res.status(200).json({ success: true, message: "Custom reset email sent via Google SMTP!" });
  } catch (error) {
    console.error("Reset Email Error:", error);
    
    if (error.code === 'auth/user-not-found') {
        return res.status(404).json({ error: "No account found with this email address." });
    }
    
    res.status(500).json({ error: error.message });
  }
}
