import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }

    // 1. Read the KinTag Brain dynamically
    let kintagKnowledge = "You are a helpful assistant for KinTag.";
    try {
      const brainPath = path.join(process.cwd(), 'kintag-brain.md');
      kintagKnowledge = fs.readFileSync(brainPath, 'utf8');
    } catch (err) {
      console.warn("Could not find kintag-brain.md, using fallback knowledge.");
    }

    // 2. Initialize Gemini 1.5 Flash with the System Prompt
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: kintagKnowledge 
    });

    // 3. Format the chat history for Gemini
    // Gemini expects { role: "user" | "model", parts: [{ text: "..." }] }
    const formattedHistory = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const latestMessage = messages[messages.length - 1].content;

    // 4. Start chat and send message
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(latestMessage);
    const aiReply = result.response.text();

    return res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: 'Failed to generate response.' });
  }
}
