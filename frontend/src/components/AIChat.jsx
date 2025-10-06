import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import Input from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { apiPost } from "../lib/api";

/**
 * AIChat - shared chat component for Customer and Technician assistants.
 * Props:
 * - persona: 'customer' | 'technician'
 * - suggestions?: string[]
 * - context?: object (bookingId, role, locale, etc.)
 * Backend endpoint expected: POST /api/ai/chat { message, persona, context }
 * Returns: { reply, citations?, actions? }
 */
export default function AIChat({ persona = 'customer', suggestions = [], context = {} }) {
  const [messages, setMessages] = useState([]); // { role: 'user' | 'ai', content }
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const defaultSuggestions = useMemo(() => (
    suggestions.length ? suggestions : (
      persona === 'technician' ? [
        "Summarize my pending jobs today",
        "Draft a job completion note for AC servicing",
        "Suggest optimal route for my accepted jobs",
      ] : [
        "Find an electrician near me under ₹600/hr",
        "Estimate cost to install a ceiling fan",
        "Rebook my last AC service",
      ]
    )
  ), [persona, suggestions]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content }]);
    setLoading(true);

    // Optimistic AI typing placeholder
    const tempId = Date.now();
    setMessages(prev => [...prev, { role: 'ai', content: '…', tempId, typing: true }]);

    try {
      // Try streaming endpoint first
      const ctrl = new AbortController();
      const res = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ message: content, persona, context }),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error('AI request failed');

      // If server streams text/plain or text/event-stream
      const reader = res.body?.getReader?.();
      if (reader) {
        let full = '';
        setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, content: '' } : m));
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          full += chunk;
          setMessages(prev => prev.map(m => m.tempId === tempId ? { ...m, content: (m.content || '') + chunk } : m));
        }
        setMessages(prev => prev.map(m => m.tempId === tempId ? { role: 'ai', content: full } : m));
      } else {
        // Non-stream JSON fallback
        const data = await res.json().catch(() => ({}));
        const reply = data.reply || data.text || "I'm here to help with bookings, estimates, and more.";
        setMessages(prev => prev.map(m => m.tempId === tempId ? { role: 'ai', content: reply } : m));
      }
    } catch (e) {
      // Local heuristic fallback
      setMessages(prev => prev.map(m => m.tempId === tempId ? { role: 'ai', content: heuristicReply(persona, content) } : m));
      toast.error(e?.message || 'AI request failed, used fallback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[70vh] flex flex-col">
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div ref={listRef} className="h-full overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Ask me anything. I can help you {persona === 'technician' ? 'optimize your schedule, draft job notes, and answer product questions.' : 'find pros, estimate costs, and manage bookings.'}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-lg ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div className="border-t p-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          {defaultSuggestions.map((s, idx) => (
            <button key={idx} className="text-xs px-2 py-1 rounded border hover:bg-muted" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <Button disabled={loading || !input.trim()} onClick={() => send()}>Send</Button>
        </div>
      </div>
    </Card>
  );
}

function heuristicReply(persona, text) {
  const t = text.toLowerCase();
  if (persona === 'technician') {
    if (t.includes('route') || t.includes('optimize')) return 'I can optimize your route based on accepted jobs and traffic. Would you like me to list your jobs by ETA and distance?';
    if (t.includes('draft') || t.includes('note')) return 'Here is a draft completion note: Replaced tap cartridge, tested for leaks, cleaned workspace. Parts used: 1x cartridge. Labor: 1.2 hrs.';
    if (t.includes('earnings')) return 'You earned ₹12,450 this week across 14 jobs. Payout pending: ₹3,200.';
    return 'I can help you with job drafts, schedule optimization, and quick answers to product questions.';
  }
  if (t.includes('electric') || t.includes('fan')) return 'Nearby electricians include Meera Patel (4.8⭐). Typical fan installation ranges ₹500–₹700. Shall I book a slot for tomorrow morning?';
  if (t.includes('plumb') || t.includes('leak')) return 'Rajesh Kumar (4.9⭐) is available now for plumbing. Estimated ₹400–₹600/hr. Want to see slots today?';
  if (t.includes('cost') || t.includes('estimate')) return 'Approximate costs: Plumbing ₹400–₹600/hr, Electrical ₹500–₹700/hr, AC Repair ₹600–₹800/hr. Which service do you need?';
  return "I can help find pros, estimate costs, rebook, and answer questions about your jobs. What would you like to do?";
}
