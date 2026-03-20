import nodemailer from 'nodemailer';

// --- SECURITY UTILITIES ---
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS_PER_WINDOW = 5; 

const sanitizeInput = (input, maxLength = 255) => {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[<>{}()$]/g, '').trim().substring(0, maxLength);
};

const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.replace(/[<>{}()$\s]/g, '').toLowerCase().substring(0, 255);
};
// --------------------------

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

  const userEmail = sanitizeEmail(req.body.userEmail);
  const userName = sanitizeInput(req.body.userName, 100);

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL, 
        pass: process.env.SMTP_PASSWORD 
      }
    });

    const greetingName = userName || userEmail;

    const mailOptions = {
      from: `"KinTag Team" <${process.env.SMTP_EMAIL}>`,
      to: userEmail,
      subject: 'Welcome to the KinTag Family!',
      html: `
        <div style="font-family: 'Helvetica Neue', sans-serif; max-width: 600px; margin: auto; padding: 30px; color: #18181b; background-color: #ffffff; border: 1px solid #f4f4f5; border-radius: 24px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);">
          
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://kintag.vercel.app/kintag-logo.png" alt="KinTag Logo" style="width: 72px; height: 72px; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
          </div>

          <h1 style="color: #d97706; text-align: center; font-size: 24px; margin-bottom: 8px;">Hi ${greetingName}!</h1>
          <h2 style="text-align: center; font-size: 18px; color: #18181b; margin-top: 0; margin-bottom: 24px;">Welcome to KinTag.</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #3f3f46;">We are so incredibly glad you are taking the next step in securing the kids and pets you love most.</p>
          <p style="font-size: 16px; line-height: 1.6; color: #3f3f46;">Your account is ready to go. Head over to your dashboard to create your very first digital contact card and download your custom QR code.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://kintag.vercel.app/#/" style="background-color: #18181b; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 14px; font-weight: bold; font-size: 16px; display: inline-block;">Go to Dashboard</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;" />
          
          <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">Stay safe,<br/><strong style="color: #18181b;">The KinTag Team</strong></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, message: "Welcome email sent!" });
  } catch (error) {
    console.error("SMTP Error:", error);
    res.status(500).json({ error: error.message });
  }
}
