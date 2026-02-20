# AI Chatbot Feature — CariAir

Simple streaming chatbot powered by Claude that answers water-related questions using live PocketBase data.

## Stack

- **Model**: `claude-haiku-4-5` (fast, cheap, good for chat)
- **API**: Anthropic SDK with SSE streaming
- **Data**: PocketBase products injected as system prompt context

## Setup

```bash
npm install @anthropic-ai/sdk
```

Add to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Files to Create

| File | Purpose |
|------|---------|
| `app/api/chat/route.ts` | Streaming API route |
| `components/water-chatbot.tsx` | Floating chat widget |

## How It Works

1. User sends a message from the chat widget
2. API route fetches products from PocketBase (`name`, `ph`, `tds`, `minerals_json`, etc.)
3. Product data is injected into Claude's system prompt as JSON context
4. Claude streams a response back via SSE
5. Widget renders tokens word-by-word as they arrive

## API Route (`app/api/chat/route.ts`)

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { pb } from "@/lib/pocketbase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const products = await pb.collection("products").getList(1, 50, {
    expand: "brand,source",
  });

  const waterContext = products.items.map((p) => ({
    name: p.name,
    brand: p.expand?.brand?.name,
    ph: p.ph,
    tds: p.tds,
    type: p.water_type,
    minerals: p.minerals_json,
    source: p.expand?.source?.location,
  }));

  const stream = client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: `You are CariAir's water expert assistant. Help users find the best Malaysian mineral water based on their needs.

Here is the current product database:
${JSON.stringify(waterContext, null, 2)}

Answer questions about water quality, mineral composition, health benefits, and recommendations. Be concise and helpful.`,
    messages,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
            )
          );
        }
      }
      controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

## Chat Widget (`components/water-chatbot.tsx`)

```typescript
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "What's the best water for daily drinking?",
  "Which water has the highest mineral content?",
  "What's a good low-TDS water?",
];

export function WaterChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);

  async function sendMessage(text: string) {
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMsg]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n\n");
      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          const { text } = JSON.parse(line.slice(6));
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: updated[updated.length - 1].content + text,
            };
            return updated;
          });
        }
      }
    }
    setStreaming(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="w-80 h-[480px] bg-background border rounded-xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-3 border-b">
            <span className="font-semibold text-sm">Water Expert</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  Ask me anything about Malaysian mineral water!
                </p>
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-xs"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !streaming && input && sendMessage(input)
              }
              placeholder="Ask about water..."
              className="text-sm"
              disabled={streaming}
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={streaming || !input}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
```

## Add to Layout

In `app/layout.tsx`, add the widget before `</body>`:

```tsx
import { WaterChatbot } from "@/components/water-chatbot";

// Inside the layout return:
<WaterChatbot />
```

## Optional Enhancements

- **Smarter answers**: Swap `claude-haiku-4-5` for `claude-sonnet-4-6`
- **Tool use**: Let Claude query PocketBase directly for complex filters
- **Message limit**: Trim conversation history to last N turns to avoid token overflow
- **Product caching**: Cache the PocketBase fetch (e.g. 60s revalidation) to reduce DB calls per message
