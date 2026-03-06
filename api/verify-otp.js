import admin from 'firebase-admin';

if (!admin.apps.length) {
  // ... Initialize Firebase Admin identical to Step 1
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  const { email, otp, uid } = req.body;

  try {
    const db = admin.firestore();
    const otpDoc = await db.collection('otps').doc(email.toLowerCase()).get();

    if (!otpDoc.exists) return res.status(400).json({ error: "No OTP found or expired." });

    const data = otpDoc.data();

    // Check if expired
    if (Date.now() > data.expiresAt) {
      await db.collection('otps').doc(email.toLowerCase()).delete();
      return res.status(400).json({ error: "OTP has expired. Please request a new one." });
    }

    // Check if code matches
    if (data.code !== otp) {
      return res.status(400).json({ error: "Invalid OTP code." });
    }

    // SUCCESS! Mark user as verified in Firebase Auth
    await admin.auth().updateUser(uid, {
      emailVerified: true
    });

    // Delete the used OTP
    await db.collection('otps').doc(email.toLowerCase()).delete();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
