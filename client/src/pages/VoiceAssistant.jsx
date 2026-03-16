import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Send, Volume2, User, Bot, AudioLines } from "lucide-react";

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([
    { role: "bot", text: "Namaste! 🙏 I'm your Lingo-Bridge Voice Assistant. Ask me anything about government schemes, documents, or rights — in your own language." },
  ]);
  const [inputText, setInputText] = useState("");
  const [lang, setLang] = useState("en-IN");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Web Speech API ─────────────────────────────────────
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech Recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        final += event.results[i][0].transcript;
      }
      setTranscript(final);
      if (event.results[0].isFinal) {
        handleSend(final);
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech error:", e);
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  // ── Chat Send ──────────────────────────────────────────
  const handleSend = (text) => {
    const msg = (text || inputText).trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setInputText("");
    setTranscript("");
    setIsTyping(true);

    // Simulated bot response
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `Thank you for asking: "${msg}"\n\nIn production, this connects to the Gemini API through Bhashini translation for real-time multilingual responses.\n\n💡 Tip: Use Document Scanner for full AI-powered document analysis, or Scheme Finder for personalized scheme matching.`,
        },
      ]);
    }, 1500);
  };

  const speakText = (text) => {
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  const LANGUAGES = [
    { code: "en-IN", label: "🇬🇧 English" },
    { code: "hi-IN", label: "🇮🇳 हिन्दी" },
    { code: "kn-IN", label: "🇮🇳 ಕನ್ನಡ" },
  ];

  return (
    <div className="page-container flex flex-col max-w-3xl" style={{ height: "calc(100vh - 72px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="gradient-text">Voice Assistant</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Speak or type — I'll help in your language
          </p>
        </div>
        <div className="flex gap-1 p-0.5 glass-subtle rounded-lg">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all border-none
                ${lang === l.code
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] bg-transparent"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto glass-subtle rounded-2xl p-4 mb-4 space-y-3 min-h-0">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "bot" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-purple-500/20">
                <Bot size={15} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-purple-500/15 text-purple-100 rounded-2xl rounded-br-md border border-purple-500/10"
                  : "glass rounded-2xl rounded-bl-md"
              }`}
            >
              {m.text}
              {m.role === "bot" && (
                <button
                  onClick={() => speakText(m.text)}
                  className="mt-2 flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-cyan-400 bg-transparent border-none cursor-pointer transition-colors"
                >
                  <Volume2 size={12} /> Listen
                </button>
              )}
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-cyan-500/20">
                <User size={15} className="text-white" />
              </div>
            )}
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0">
              <Bot size={15} className="text-white" />
            </div>
            <div className="glass rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-2 h-2 rounded-full bg-purple-400" />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 rounded-full bg-purple-400" />
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Live Transcript */}
      {listening && transcript && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2"
        >
          <span className="px-4 py-1.5 glass-subtle rounded-full text-sm text-cyan-300 inline-flex items-center gap-2">
            <AudioLines size={14} className="animate-pulse" />
            &ldquo;{transcript}&rdquo;
          </span>
        </motion.div>
      )}

      {/* Input Bar */}
      <div className="flex gap-2 items-end shrink-0">
        {/* Mic Button */}
        <motion.button
          id="mic-button"
          onClick={listening ? stopListening : startListening}
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center cursor-pointer border-none relative ${
            listening
              ? "bg-red-500 shadow-lg shadow-red-500/30"
              : "bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-purple-500/25"
          }`}
          whileTap={{ scale: 0.9 }}
          animate={listening ? { scale: [1, 1.08, 1] } : {}}
          transition={listening ? { repeat: Infinity, duration: 1 } : {}}
        >
          {listening && (
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-red-400/40"
              animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
          )}
          {listening ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
        </motion.button>

        <input
          id="voice-text-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your question here…"
          className="flex-1"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="btn-primary px-4 py-3 rounded-xl"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
