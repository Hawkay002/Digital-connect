import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { profileId, petName, petImageUrl } = req.body;

  try {
    const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
    const CLASS_ID = `${ISSUER_ID}.kintag_id`; 
    
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    // 🌟 THE CACHE KILLER: We attach a random 6-character string to the ID.
    // Google's servers will now treat every single click as a brand new pass
    // and will be forced to download the image fresh.
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniquePassId = `${ISSUER_ID}.${profileId}-${randomString}`;

    const passObject = {
      id: uniquePassId,
      classId: CLASS_ID,
      genericType: "GENERIC_TYPE_UNSPECIFIED",
      hexBackgroundColor: "#18181b", 
      logo: {
        sourceUri: { uri: "https://kintag.vercel.app/kintag-logo.png" }
      },
      cardTitle: {
        defaultValue: { language: "en", value: "KinTag Digital ID" }
      },
      header: {
        defaultValue: { language: "en", value: petName || "Emergency Profile" }
      },
      // EXACT CODE YOU PROVED WORKED FOR THE KID
      heroImage: {
        sourceUri: { 
          uri: petImageUrl || "https://kintag.vercel.app/placeholder-hero.png" 
        }
      },
      barcode: {
        type: "QR_CODE",
        value: `https://kintag.vercel.app/#/id/${profileId}`,
        alternateText: "Scan to view emergency profile"
      }
    };

    const claims = {
      iss: credentials.client_email,
      aud: "google",
      origins: ["https://kintag.vercel.app"],
      typ: "savetowallet",
      payload: { genericObjects: [passObject] }
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });

    return res.status(200).json({ success: true, token });

  } catch (error) {
    console.error("Wallet Generation Error:", error);
    return res.status(500).json({ error: "Failed to generate pass. Check server logs." });
  }
}
