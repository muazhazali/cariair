"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Droplets, Trash2, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "What's the best water for daily drinking?",
  "Which water has the highest mineral content?",
  "What's a good low-TDS water?",
];

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Hi! I'm your CariAir water expert. Ask me anything about Malaysian mineral water — pH levels, TDS, minerals, health benefits, or which brand suits you best!",
};

// Typing indicator component
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
        />
      ))}
    </div>
  );
}

// Assistant avatar
function AssistantAvatar() {
  return (
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
      <Droplets className="w-3 h-3 text-primary" />
    </div>
  );
}

export function WaterChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // true before first token arrives
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const suggestionsAbortRef = useRef<AbortController | null>(null);
  // Track latest send sequence to ignore stale suggestion results
  const sendCountRef = useRef(0);

  // Only auto-scroll if user is already near the bottom
  const scrollToBottomIfNear = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottomIfNear();
  }, [messages, suggestions, isTyping, scrollToBottomIfNear]);

  // Scroll to bottom when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "instant" }), 50);
    }
  }, [open]);

  const fetchSuggestions = useCallback(async (msgs: Message[], sendCount: number) => {
    // Cancel any in-flight suggestion request
    if (suggestionsAbortRef.current) suggestionsAbortRef.current.abort();
    const controller = new AbortController();
    suggestionsAbortRef.current = controller;

    try {
      const res = await fetch("/api/chat/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs }),
        signal: controller.signal,
      });
      // Ignore if a newer message was sent while we were waiting
      if (sendCount !== sendCountRef.current) return;
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      // Ignore abort errors
    }
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;

    const thisSend = ++sendCountRef.current;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setIsTyping(true);
    setSuggestions([]);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorMsg =
          res.status === 429
            ? "You're sending messages too fast. Please wait a moment and try again."
            : res.status === 503
              ? "The AI service is temporarily unavailable. Please try again later."
              : data.message ?? "Something went wrong. Please try again.";
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: `_${errorMsg}_` };
          return updated;
        });
        setIsTyping(false);
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n\n");
        for (const line of lines) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          let parsed: { text?: string; error?: string };
          try {
            parsed = JSON.parse(line.slice(6));
          } catch {
            continue;
          }
          if (parsed.error === "stream_interrupted") {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              updated[updated.length - 1] = {
                role: "assistant",
                content: last.content
                  ? last.content + "\n\n_Response was cut short. Please try again._"
                  : "_Something went wrong mid-response. Please try again._",
              };
              return updated;
            });
            break;
          }
          if (parsed.text) {
            setIsTyping(false); // first token arrived — hide typing indicator
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: updated[updated.length - 1].content + parsed.text,
              };
              return updated;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "_Network error. Please check your connection and try again._",
        };
        return updated;
      });
    }

    setIsTyping(false);
    setStreaming(false);

    // Fetch follow-up suggestions — pass current send count to detect staleness
    setMessages((prev) => {
      fetchSuggestions(prev, thisSend);
      return prev;
    });
  }

  function clearConversation() {
    setMessages([WELCOME_MESSAGE]);
    setSuggestions([]);
    setInput("");
    setStreaming(false);
    setIsTyping(false);
    sendCountRef.current++;
  }

  const hasUserMessages = messages.some((m) => m.role === "user");

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-[calc(100vw-2rem)] sm:w-80 h-[520px] sm:h-[500px] bg-background border rounded-xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted/30 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Water Expert</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Powered by CariAir</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasUserMessages && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={clearConversation}
                  title="Clear conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && <AssistantAvatar />}
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-1 space-y-0.5">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        h1: ({ children }) => <h1 className="font-bold text-base mb-1">{children}</h1>,
                        h2: ({ children }) => <h2 className="font-bold text-sm mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="font-semibold text-sm mb-1">{children}</h3>,
                        code: ({ children }) => <code className="bg-background/50 px-1 rounded text-xs font-mono">{children}</code>,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator — shown while waiting for first token */}
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <AssistantAvatar />
                <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm">
                  <TypingDots />
                </div>
              </div>
            )}

            {/* Initial suggested questions (shown until user sends first message) */}
            {!hasUserMessages && !streaming && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-muted-foreground px-1">Try asking:</p>
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/50 text-xs transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 text-primary flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Follow-up suggestions after each reply */}
            {!streaming && suggestions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs text-muted-foreground px-1">Continue exploring:</p>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="w-full text-left px-3 py-2 rounded-xl border border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-xs transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 text-primary flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !streaming && input.trim() && sendMessage(input)
              }
              placeholder="Ask about water..."
              className="text-sm rounded-xl"
              disabled={streaming}
            />
            <Button
              size="icon"
              className="rounded-xl flex-shrink-0"
              onClick={() => sendMessage(input)}
              disabled={streaming || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <Button
            onClick={() => setOpen(true)}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          {/* Tooltip on hover */}
          <span className="absolute bottom-14 right-0 bg-popover text-popover-foreground text-xs px-2.5 py-1.5 rounded-lg shadow-md border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Ask Water Expert
          </span>
        </div>
      )}
    </div>
  );
}
