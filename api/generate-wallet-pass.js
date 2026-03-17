import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { profileId, petName, petImageUrl } = req.body;

  try {
    const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
    
    // 🌟 1. UPDATE THIS to match the new Class ID you created in the console
    const CLASS_ID = `${ISSUER_ID}.kintag_v2`; 
    
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    // 🌟 2. NEW ID FORMAT: Using "_v2" bypasses the broken cache completely
    const uniquePassId = `${ISSUER_ID}.${profileId}_v2`;

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
      barcode: {
        type: "QR_CODE",
        value: `https://kintag.vercel.app/#/id/${profileId}`,
        alternateText: "Scan to view emergency profile"
      }
    };

    // 🌟 3. The exact image code that worked for the kid
    // IMPORTANT: Make sure the uploaded pet image is UNDER 1 Megabyte!
    if (petImageUrl) {
      passObject.heroImage = {
        sourceUri: { uri: petImageUrl }
      };
    }

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
