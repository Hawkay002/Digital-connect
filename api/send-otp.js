import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

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
  
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const db = admin.firestore();
    
    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to Firestore (Expires in 15 minutes)
    await db.collection('otps').doc(email.toLowerCase()).set({
      code: otp,
      expiresAt: Date.now() + 15 * 60 * 1000 
    });

    const htmlTemplate = `
      <div style="font-family: sans-serif; max-w-md; margin: auto; padding: 30px; text-align: center; background: #fafafa; border-radius: 16px; border: 1px solid #e4e4e7;">
        <img src="https://kintag.vercel.app/kintag-logo.png" width="60" style="border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
        <h2 style="color: #18181b; font-size: 24px; margin-bottom: 10px;">Verify your Email</h2>
        <p style="color: #52525b; font-size: 16px; line-height: 1.5;">Here is your secure verification code for KinTag:</p>
        <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #18181b; margin: 30px 0; padding: 20px; background: #ffffff; border-radius: 12px; border: 2px dashed #e4e4e7;">
          ${otp}
        </div>
        <p style="color: #a1a1aa; font-size: 12px;">This code expires in 15 minutes. Do not share it with anyone.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"KinTag Security" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: '🔒 Your KinTag Verification Code',
      html: htmlTemplate,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ error: error.message });
  }
}
