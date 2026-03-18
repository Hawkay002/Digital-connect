import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { profileId, petName, petImageUrl } = req.body;

  try {
    const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
    
    // 🌟 1. Target the brand new Loyalty Class you just created
    const CLASS_ID = `${ISSUER_ID}.kintag_loyalty`; 
    
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    // 🌟 2. The Cache Killer: Ensures a brand new pass is generated every time
    // so Google doesn't accidentally load an old ghost pass without Lex's photo.
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniquePassId = `${ISSUER_ID}.${profileId}-${randomString}`;

    // 🌟 3. Build a Loyalty Object (instead of Generic)
    const passObject = {
      id: uniquePassId,
      classId: CLASS_ID,
      state: "ACTIVE",
      accountId: profileId.substring(0, 15) || "KINTAG", // Required for Loyalty passes
      accountName: petName || "Family Member", // Required for Loyalty passes
      hexBackgroundColor: "#18181b", 
      logo: {
        sourceUri: { uri: "https://kintag.vercel.app/kintag-logo.png" }
      },
      barcode: {
        type: "QR_CODE",
        value: `https://kintag.vercel.app/#/id/${profileId}`,
        alternateText: "Scan to view emergency profile"
      }
    };

    // 🌟 4. The EXACT image code that you proved worked for the kid's pass
    if (petImageUrl) {
      passObject.heroImage = {
        sourceUri: { 
          uri: petImageUrl
        }
      };
    }

    const claims = {
      iss: credentials.client_email,
      aud: "google",
      origins: ["https://kintag.vercel.app"],
      typ: "savetowallet",
      payload: { 
        // 🌟 5. CRITICAL: Tell Google this is a Loyalty pass!
        loyaltyObjects: [passObject] 
      }
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });

    return res.status(200).json({ success: true, token });

  } catch (error) {
    console.error("Wallet Generation Error:", error);
    return res.status(500).json({ error: "Failed to generate pass. Check server logs." });
  }
}
