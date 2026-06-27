"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Bot, User, Loader2 } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

type Message = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "How much should I save each month?",
  "Explain SIP vs lump sum investment",
  "What is the 50/30/20 rule?",
  "How to build an emergency fund?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm FinPilot, your AI financial advisor. I'm trained on Indian personal finance — ask me about SIPs, tax saving, budgeting, or anything money-related! 💰" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const history = newMessages.slice(-8).map(m => ({ role: m.role === "assistant" ? "model" : "user", content: m.content }));
      const res = await axios.post(`${API}/api/chat/`, { message: msg, history });
      setMessages(prev => [...prev, { role: "assistant", content: res.data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't connect. Please check if the backend is running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-3rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">AI Financial Advisor</h1>
        <p className="text-muted text-sm mt-1">RAG-powered advice grounded in Indian personal finance</p>
      </div>

      {/* Starters */}
      {messages.length === 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {STARTERS.map(s => (
            <button key={s} onClick={() => send(s)}
              className="text-left text-sm text-muted border border-border rounded-lg px-3 py-2 hover:border-primary hover:text-white transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center
              ${m.role === "assistant" ? "bg-primary/20 text-primary" : "bg-white/10 text-white"}`}>
              {m.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed
              ${m.role === "assistant" ? "glass text-slate-200" : "bg-primary/20 text-white border border-primary/30"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <Bot size={16} />
            </div>
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-2 text-muted text-sm">
              <Loader2 size={14} className="animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-4 border-t border-border">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about budgeting, investments, tax saving..."
          className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary transition-colors" />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="bg-primary hover:bg-primary/80 disabled:opacity-40 text-white rounded-xl px-4 py-3 transition-colors">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
