import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      max_tokens: 100,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `Based on the conversation, suggest exactly 2 short follow-up questions the user might want to ask next about mineral water.
Return ONLY a JSON array of 2 strings, nothing else. Each question must be under 60 characters.
Example: ["Which brand has the lowest TDS?", "Is high TDS water safe to drink?"]`,
        },
        ...messages,
        {
          role: "user",
          content: "Give me 2 follow-up question suggestions as a JSON array.",
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "[]";
    // Extract JSON array from the response
    const match = raw.match(/\[.*\]/s);
    const suggestions = match ? JSON.parse(match[0]) : [];
    return Response.json({ suggestions: suggestions.slice(0, 2) });
  } catch {
    return Response.json({ suggestions: [] });
  }
}
