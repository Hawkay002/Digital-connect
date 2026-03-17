import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { profileId, petName, petImageUrl } = req.body;

  try {
    const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
    
    // Make sure this matches the new Class you created (e.g., kintag_v2)
    const CLASS_ID = `${ISSUER_ID}.kintag_v2`; 
    
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    // Forces a completely new pass generation every time
    const uniquePassId = `${ISSUER_ID}.${profileId}-${Date.now()}`;

    const passObject = {
      id: uniquePassId,
      classId: CLASS_ID,
      genericType: "GENERIC_TYPE_UNSPECIFIED",
      hexBackgroundColor: "#18181b", 
      logo: {
        sourceUri: { uri: "https://kintag.vercel.app/kintag-logo.png" },
        // 🌟 CRITICAL FIX: Google will silently drop images without this tag
        contentDescription: { defaultValue: { language: "en", value: "KinTag Logo" } }
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

    // If an image exists, we force it into the pass in two different ways
    if (petImageUrl) {
      
      // Clean the URL if you are using Cloudinary to ensure it's a valid JPEG
      const safeImageUrl = petImageUrl.includes('cloudinary.com') 
        ? petImageUrl.replace('/upload/', '/upload/q_auto,f_jpg/') 
        : petImageUrl;

      // Method 1: The standard Hero Image Banner at the top
      passObject.heroImage = {
        sourceUri: { uri: safeImageUrl },
        contentDescription: {
          defaultValue: { language: "en", value: `${petName}'s Photo` }
        }
      };

      // Method 2: The Foolproof Body Image (Always renders!)
      // Even if your Console layout hides the top banner, this injects the photo directly into the card body.
      passObject.imageModulesData = [
        {
          mainImage: {
            sourceUri: { uri: safeImageUrl },
            contentDescription: {
              defaultValue: { language: "en", value: `${petName}'s Photo` }
            }
          },
          id: "profile_picture_module"
        }
      ];
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
