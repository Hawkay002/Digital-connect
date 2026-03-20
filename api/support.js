// --- SECURITY UTILITIES ---
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS_PER_WINDOW = 3; 

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

  const supportId = sanitizeInput(req.body.supportId, 50);
  const name = sanitizeInput(req.body.name, 100);
  const email = sanitizeEmail(req.body.email);
  const platform = sanitizeInput(req.body.platform, 50);
  const countryCode = sanitizeInput(req.body.countryCode, 10);
  const contactValue = sanitizeInput(req.body.contactValue, 100);
  const message = sanitizeInput(req.body.message, 1000); // 1000 chars max for support message

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ error: "Telegram Bot is not configured on the server." });
  }

  let contactInfo = "";
  let replyUrl = "";
  let replyText = "";

  const shortUserMessage = message.length > 60 ? message.substring(0, 60) + '...' : message;
  
  const preFilledMessage = `Hello ${name}, we've received your KinTag support request (${supportId}) regarding: "${shortUserMessage}"\n\nCould you please elaborate about this a bit more so we can help you quickly?`;
  const encodedText = encodeURIComponent(preFilledMessage);

  if (platform === 'whatsapp') {
    const cleanPhone = contactValue.replace(/\D/g, ''); 
    const fullPhone = countryCode.replace('+', '') + cleanPhone;
    contactInfo = `WhatsApp: ${countryCode} ${contactValue}`;
    replyUrl = `https://wa.me/${fullPhone}?text=${encodedText}`;
    replyText = "Reply on WhatsApp";
  } else {
    const cleanTg = contactValue.startsWith('@') ? contactValue.substring(1) : contactValue;
    contactInfo = `Telegram: @${cleanTg}`;
    replyUrl = `https://t.me/${cleanTg}?text=${encodedText}`;
    replyText = "Reply on Telegram";
  }

  const tgMessage = `🚨 <b>New Support Request</b>\n\n<b>ID:</b> <code>${supportId}</code>\n<b>Name:</b> ${name}\n<b>Email:</b> ${email}\n<b>Platform:</b> ${contactInfo}\n\n<b>Message:</b>\n${message}`;

  const payload = {
    chat_id: chatId,
    text: tgMessage,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: replyText, url: replyUrl }]
      ]
    }
  };

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Failed to send message to Telegram.");
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Support API Error:", err);
    res.status(500).json({ error: err.message });
  }
}
