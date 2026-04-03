// File: api/log.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { messages, reason } = req.body;
  const botToken = process.env.TELEGRAM_BOT_TOKEN_AI;
  const chatId = process.env.TELEGRAM_CHAT_ID_AI;

  if (!messages || messages.length <= 1 || !botToken || !chatId) {
    return res.status(200).json({ success: false, reason: 'Skipped' });
  }

  // 🌟 FIX: Bulletproof HTML Escaper
  // This prevents special characters from breaking the Telegram log formatting
  const escapeHtml = (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  // 🌟 FIX: Switch to HTML Formatting instead of Markdown
  let formattedText = `🚨 <b>New KinBot Chat Log</b>\n<i>Trigger: ${escapeHtml(reason)}</i>\n\n`;
  
  messages.forEach(msg => {
    const role = msg.role === 'ai' ? '🤖 KinBot' : '👤 User';
    // Now it safely wraps the raw text without eating underscores
    formattedText += `<b>${role}:</b> ${escapeHtml(msg.content)}\n\n`;
  });

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedText,
        parse_mode: 'HTML' // <--- Changed from 'Markdown' to 'HTML'
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Telegram API Error:", errData);
      throw new Error('Telegram API failed');
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Log error:", error);
    return res.status(500).json({ error: 'Failed to log' });
  }
}
