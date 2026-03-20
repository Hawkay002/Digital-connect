import admin from 'firebase-admin';

// --- SECURITY UTILITIES ---
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS_PER_WINDOW = 3; 

const sanitizeInput = (input, maxLength = 255) => {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/[<>{}()$]/g, '').trim().substring(0, maxLength);
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
    console.log('Firebase admin init error:', error.stack);
  }
}

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

  const title = sanitizeInput(req.body.title, 100);
  const body = sanitizeInput(req.body.body, 500);

  if (!title || !body) return res.status(400).json({ error: "Missing required fields" });

  try {
    const db = admin.firestore();
    const usersSnap = await db.collection('users').get();
    const tokens = [];
    
    usersSnap.forEach(doc => {
      if (doc.data().fcmToken) tokens.push(doc.data().fcmToken);
    });

    if (tokens.length === 0) return res.status(200).json({ success: true, message: "No tokens found." });

    const message = {
      notification: { title, body },
      webpush: {
        notification: {
          icon: "https://kintag.vercel.app/kintag-logo.png",
          data: { url: "https://kintag.vercel.app/#/?view=notifications" }
        },
        fcmOptions: {
          link: "https://kintag.vercel.app/#/?view=notifications"
        }
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    res.status(200).json({ success: true, sentCount: response.successCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
