import admin from 'firebase-admin';

// --- SECURITY UTILITIES ---
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS_PER_WINDOW = 5; 

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
    console.log('Firebase admin initialization error:', error.stack);
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

  const type = sanitizeInput(req.body.type, 50);
  const ownerId = sanitizeInput(req.body.ownerId, 100);
  const title = sanitizeInput(req.body.title, 100);
  const body = sanitizeInput(req.body.body, 500);

  try {
    const db = admin.firestore();

    if (type === 'broadcast') {
      const usersSnap = await db.collection('users').get();
      const tokens = [];
      
      usersSnap.forEach(doc => {
        if (doc.data().fcmToken) tokens.push(doc.data().fcmToken);
      });

      if (tokens.length === 0) {
        return res.status(200).json({ success: true, message: "No tokens found." });
      }

      const batches = [];
      for (let i = 0; i < tokens.length; i += 500) {
        batches.push(tokens.slice(i, i + 500));
      }

      let sentCount = 0;

      for (const batch of batches) {
        const message = {
          notification: { title, body },
          webpush: {
            notification: {
              icon: "https://kintag.vercel.app/kintag-logo.png"
            },
            fcmOptions: {
              link: "https://kintag.vercel.app/#/?view=notifications"
            }
          },
          tokens: batch, 
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        sentCount += response.successCount;
      }

      return res.status(200).json({ success: true, sentCount });
    }

    if (!ownerId) {
      return res.status(400).json({ error: "Owner ID required for direct notifications" });
    }

    const userDoc = await db.collection('users').doc(ownerId).get();
    if (!userDoc.exists) return res.status(404).json({ error: "Owner not found" });
    
    const fcmToken = userDoc.data().fcmToken;
    if (!fcmToken) return res.status(400).json({ error: "Owner has no FCM token saved" });

    const message = {
      notification: { title, body },
      webpush: {
        notification: {
          icon: "https://kintag.vercel.app/kintag-logo.png"
        },
        fcmOptions: {
          link: "https://kintag.vercel.app/#/?view=notifications"
        }
      },
      token: fcmToken,
    };

    await admin.messaging().send(message);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Push Error Details:", error);
    
    if (error.code === 'messaging/registration-token-not-registered') {
        if (ownerId) {
            const db = admin.firestore();
            await db.collection('users').doc(ownerId).update({
                fcmToken: admin.firestore.FieldValue.delete()
            });
            return res.status(200).json({ success: true, message: "Dead token cleaned up automatically." });
        }
    }

    return res.status(500).json({ error: error.message, code: error.code });
  }
}
