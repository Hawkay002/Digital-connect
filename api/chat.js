import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const rateLimitMap = new Map();
const LIMIT_WINDOW_MS = 60 * 1000; 
const MAX_REQUESTS = 10; 

// Memory cleanup to prevent Vercel crashes
if (!global.rateLimitInterval) {
  global.rateLimitInterval = setInterval(() => rateLimitMap.clear(), 10 * 60 * 1000);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    // 1. Rate Limiting Logic
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown_ip';
    const currentTime = Date.now();

    if (rateLimitMap.has(ip)) {
      const userRequests = rateLimitMap.get(ip);
      const recentRequests = userRequests.filter(timestamp => currentTime - timestamp < LIMIT_WINDOW_MS);
      if (recentRequests.length >= MAX_REQUESTS) {
        return res.status(429).json({ error: "I'm receiving too many messages right now. Please wait a minute." });
      }
      recentRequests.push(currentTime);
      rateLimitMap.set(ip, recentRequests);
    } else {
      rateLimitMap.set(ip, [currentTime]);
    }

    const { messages, voicePreference, isAudioRequest, textToSpeak } = req.body; 

    // 2. Handle Audio Generation (TTS)
    if (isAudioRequest) {
      const voiceName = voicePreference === 'male' ? 'Puck' : 'Kore';
      const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-002:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      const ttsResponse = await fetch(ttsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: textToSpeak }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } }
          }
        })
      });

      if (!ttsResponse.ok) {
         if (ttsResponse.status === 429) throw new Error('QUOTA_EXCEEDED');
         throw new Error('TTS_FAILED');
      }

      const ttsData = await ttsResponse.json();
      const audioBase64 = ttsData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return res.status(200).json({ audioBase64 });
    }

    // 3. Handle Text Generation (Using Stable 1.5-Flash)
    let kintagKnowledge = "You are a helpful assistant for KinTag. Keep answers under 3 sentences.";
    try {
      const brainPath = path.join(process.cwd(), 'kintag-brain.md');
      kintagKnowledge = fs.readFileSync(brainPath, 'utf8');
    } catch (err) { }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash-002', 
      systemInstruction: kintagKnowledge 
    });

    let formattedHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Ensure history starts with 'user'
    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(messages[messages.length - 1].content);
    
    return res.status(200).json({ reply: result.response.text() });

  } catch (error) {
    if (error.message === 'QUOTA_EXCEEDED' || error.status === 429) {
      return res.status(429).json({ error: "Daily limits reached for this key. Try again in 24 hours or use a different key." });
    }
    return res.status(500).json({ error: 'Internal connection error.' });
  }
}
