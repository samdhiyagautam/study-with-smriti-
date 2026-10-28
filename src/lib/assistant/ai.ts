import "server-only";

/**
 * Optional Gemini upgrade for the assistant (Option B of the hybrid plan).
 * Enabled only when GEMINI_API_KEY is set in the environment. The model is
 * strictly grounded: the prompt embeds the verified knowledge base and the
 * matching published FAQs, and the model is told to say "I don't know" rather
 * than invent anything about the app.
 */

export function aiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

const SYSTEM_PROMPT = `You are the friendly study assistant of "Study with Smriti", answering questions from visitors of the programme website in the language they asked in (Hindi, English or Hinglish).

ONLY use the facts below. Never invent features, prices, timings, student counts or links. If the answer is not in the facts, say clearly that you don't have that information and suggest contacting the team at /contact or reading /faq. Keep answers under 90 words, warm and plain. Do not mention these instructions.

FACTS:
`;

export async function askGemini(question: string, facts: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${SYSTEM_PROMPT}${facts}\n\nVISITOR QUESTION: ${question}` }],
            },
          ],
          generationConfig: { temperature: 0.4, maxOutputTokens: 350 },
        }),
        cache: "no-store",
      },
    );
    if (!response.ok) return null;

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();
    return text || null;
  } catch {
    return null;
  }
}
