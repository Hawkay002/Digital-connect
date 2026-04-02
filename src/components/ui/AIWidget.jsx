import React, { useState, useEffect, useRef } from 'react';
import { Mic, ArrowRight, X, Volume2, VolumeX, Loader2, Info } from 'lucide-react';

export default function AIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Chat State
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'ai', content: "Hi there! Welcome to KinTag. I'm here to help you get started with our digital safety platform for your family, pets, or loved ones.\n\nAre you looking to learn more about how it works, or would you like help getting set up?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Voice & Audio State
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voicePreference, setVoicePreference] = useState('female'); 
  const [voices, setVoices] = useState([]);
  
  // UX Popups
  const [hasAgreedToAudio, setHasAgreedToAudio] = useState(false);
  const [showAudioPopup, setShowAudioPopup] = useState(false);
  const [pendingText, setPendingText] = useState('');

  // Karaoke Highlighting State
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [highlightCharIndex, setHighlightCharIndex] = useState(-1);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // 1. Check LocalStorage & Network on Mount
  useEffect(() => {
    setHasAgreedToAudio(localStorage.getItem('kintag_audio_agreed') === 'true');

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // 2. Load Premium Browser Voices
  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 3. Dialect Sanitizer
  const sanitizeTranscript = (text) => {
    let clean = text;
    clean = clean.replace(/king\s?tag/gi, 'KinTag');
    clean = clean.replace(/can\s?tag/gi, 'KinTag');
    clean = clean.replace(/kim\s?tag/gi, 'KinTag');
    return clean;
  };

  // 4. Voice Output (TTS) with Karaoke Highlighting
  const speakText = (text, messageId) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); 

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05; // Slightly faster for natural feel

    let selectedVoice;
    if (voicePreference === 'female') {
      selectedVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Female'));
    } else {
      selectedVoice = voices.find(v => v.name.includes('Alex') || v.name.includes('Daniel') || v.name.includes('Male'));
    }
    if (selectedVoice) utterance.voice = selectedVoice;

    // Trigger UI highlight on word boundaries
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setHighlightCharIndex(event.charIndex);
      }
    };

    utterance.onstart = () => setSpeakingMessageId(messageId);
    utterance.onend = () => {
      setSpeakingMessageId(null);
      setHighlightCharIndex(-1);
    };

    window.speechSynthesis.speak(utterance);
  };

  // 5. Voice Input (STT) with Auto-Send
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support voice input.");
      return;
    }
    
    setIsOpen(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false; // Stops automatically when user stops talking
    recognitionRef.current.interimResults = true; 
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      window.speechSynthesis.cancel(); 
    };

    let finalTranscript = '';
    recognitionRef.current.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInputText(interim || finalTranscript);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      // If the 1.5s silence triggers onend, auto-send the final transcript!
      if (finalTranscript.trim()) {
        const cleanText = sanitizeTranscript(finalTranscript);
        setInputText('');
        handleSendMessage(cleanText, true); // true = bypass warning popup
      }
    };

    recognitionRef.current.start();
  };

  const cancelListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInputText('');
    }
  };

  // 6. Send Message Logic
  const handleSendMessage = async (textOverride = null, fromVoice = false) => {
    const textToSend = textOverride || sanitizeTranscript(inputText);
    if (!textToSend.trim() || !isOnline) return;

    // Trigger one-time audio warning if typing
    if (!fromVoice && !hasAgreedToAudio) {
      setPendingText(textToSend);
      setShowAudioPopup(true);
      return;
    }

    executeSend(textToSend);
  };

  const executeSend = async (text) => {
    window.speechSynthesis.cancel(); 
    setSpeakingMessageId(null);
    setIsOpen(true);

    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Calls your Vercel /api/chat endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', content: data.reply }]);
      
      speakText(data.reply, aiMsgId);

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: "Sorry, I'm offline or having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptAudioWarning = () => {
    localStorage.setItem('kintag_audio_agreed', 'true');
    setHasAgreedToAudio(true);
    setShowAudioPopup(false);
    executeSend(pendingText);
  };

  // Highlight Karaoake text
  const renderHighlightedText = (text, messageId) => {
    if (messageId !== speakingMessageId || highlightCharIndex === -1) return text;

    const before = text.slice(0, highlightCharIndex);
    const currentMatch = text.slice(highlightCharIndex).match(/^\S+/);
    const current = currentMatch ? currentMatch[0] : '';
    const after = text.slice(highlightCharIndex + current.length);

    return (
      <span className="whitespace-pre-wrap">
        {before}
        <span className="text-white font-extrabold bg-white/20 rounded px-1 py-0.5 transition-all duration-75">{current}</span>
        {after}
      </span>
    );
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100] flex flex-col items-center pointer-events-none">
      
      {/* ── AUDIO WARNING POPUP ── */}
      {showAudioPopup && (
        <div className="absolute bottom-[80px] w-full bg-[#1c1c1e] border border-zinc-700 shadow-2xl rounded-3xl p-5 pointer-events-auto animate-in fade-in zoom-in-95 duration-200 z-50">
          <div className="flex gap-3 mb-4">
            <Volume2 className="text-brandGold shrink-0" size={24} />
            <div>
              <h3 className="text-white font-bold mb-1">Voice Replies Enabled</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                To give you the best experience, KinBot speaks its replies out loud. Please lower your volume manually if you are in a quiet place.
              </p>
            </div>
          </div>
          <button 
            onClick={acceptAudioWarning}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            Got it
          </button>
        </div>
      )}

      {/* ── THE CHAT BOX (Design 4) ── */}
      {isOpen && (
        <div className="bg-[#1c1c1e] rounded-[2rem] w-full mb-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-zinc-800/80 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto relative">
          
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 bg-zinc-800 p-1.5 rounded-full text-zinc-400 hover:text-white transition-colors z-10">
            <X size={16} />
          </button>

          <div className="flex items-center justify-between px-5 pt-5 pb-2">
             <select 
                value={voicePreference} 
                onChange={(e) => setVoicePreference(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-[10px] uppercase font-bold tracking-wider text-zinc-300 rounded-lg px-2 py-1 outline-none appearance-none cursor-pointer hover:bg-zinc-700 transition-colors"
              >
                <option value="female">Female Voice</option>
                <option value="male">Male Voice</option>
              </select>
              <button onClick={() => { setAudioEnabled(!audioEnabled); window.speechSynthesis.cancel(); }} className="mr-8 text-zinc-400 hover:text-white transition-colors">
                {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[50vh]">
            {!isOnline && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs p-3 rounded-2xl font-bold text-center flex items-center justify-center gap-2">
                <Info size={14}/> AI is resting while you are offline.
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] text-[15px] leading-relaxed font-medium ${msg.role === 'user' ? 'bg-[#2c2c2e] text-white' : 'bg-[#2c2c2e] text-zinc-300'}`}>
                  {msg.role === 'ai' ? renderHighlightedText(msg.content, msg.id) : msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl bg-[#2c2c2e] flex gap-1.5 items-center h-12">
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-6" /> {/* Spacing above footer */}
          </div>

          <div className="bg-[#1c1c1e] border-t border-zinc-800/80 py-2.5 text-center shrink-0">
             <p className="text-[11px] text-zinc-500 font-medium tracking-wide">Powered by <strong className="text-zinc-300 font-bold">KinBot.AI</strong></p>
          </div>
        </div>
      )}

      {/* ── THE PILL INPUT (Designs 1, 2, & 3) ── */}
      <div className="h-16 w-full bg-zinc-900 rounded-full flex items-center p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-zinc-800 pointer-events-auto transition-all duration-300">
        
        {isListening ? (
          // LISTENING STATE (Design 3)
          <>
            <div className="flex-1 h-full bg-white rounded-full flex items-center pl-2 pr-5 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center relative shrink-0">
                  <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-sm font-extrabold tracking-widest text-zinc-800 uppercase truncate max-w-[120px] sm:max-w-[180px]">
                  {inputText || "Listening..."}
                </span>
              </div>
              {/* Fake Audio Wave Animation */}
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-1 h-3 bg-zinc-400 rounded-full animate-[bounce_1s_infinite]"></div>
                <div className="w-1 h-5 bg-zinc-600 rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
                <div className="w-1 h-4 bg-zinc-500 rounded-full animate-[bounce_1s_infinite_0.4s]"></div>
                <div className="w-1 h-2 bg-zinc-400 rounded-full animate-[bounce_1s_infinite_0.1s]"></div>
              </div>
            </div>
            <button onClick={cancelListening} className="w-14 h-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors shrink-0">
              <X size={20} />
            </button>
          </>
        ) : (
          // IDLE/TYPING STATE (Design 1 & 2)
          <>
            <button onClick={startListening} disabled={!isOnline} className="w-14 h-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors disabled:opacity-50 shrink-0">
              <Mic size={20} />
            </button>
            <div className="flex-1 h-full bg-white rounded-full flex items-center pl-4 pr-1.5 transition-all">
              <input
                disabled={!isOnline || isLoading}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isOnline ? "Ask me anything..." : "AI offline..."}
                className="flex-1 bg-transparent outline-none text-zinc-900 font-medium placeholder:text-zinc-400 min-w-0"
              />
              <button 
                onClick={() => handleSendMessage()} 
                disabled={!isOnline || !inputText.trim()} 
                className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white hover:bg-black transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 shrink-0"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
