import { NextResponse } from "next/server";
import { z } from "zod";
import { findFaq, findTopic, fallbackReply, formatTopicAnswer, type AssistantReply } from "@/lib/assistant/engine";
import { aiConfigured, askGemini } from "@/lib/assistant/ai";
import { getFaqs } from "@/lib/content/queries";
import { ASSISTANT_TOPICS } from "@/lib/assistant/knowledge";
import { hashIp } from "@/server/rate-limit";

export const dynamic = "force-dynamic";

const questionSchema = z.string().trim().min(2).max(500);

/** Per-process message throttle: 15 questions / 10 minutes per client. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 15;
const hits = new Map<string, number[]>();

function throttled(ipHash: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ipHash) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ipHash, recent);
  // keep the map from growing without bound
  if (hits.size > 5000) hits.clear();
  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function buildFacts(faqMatch: { question: string; answer: string } | null): string {
  const topicFacts = ASSISTANT_TOPICS.map((topic) => `- ${topic.title}: ${topic.answer}`).join("\n");
  const faqFact = faqMatch ? `\n- Published FAQ "${faqMatch.question}": ${faqMatch.answer}` : "";
  return topicFacts + faqFact;
}

export async function POST(request: Request): Promise<NextResponse> {
  const ipHash = hashIp(clientIp(request));
  if (throttled(ipHash)) {
    return NextResponse.json(
      { error: "Too many questions in a row — please wait a bit." },
      { status: 429 },
    );
  }

  let rawMessage: unknown;
  try {
    rawMessage = ((await request.json()) as { message?: unknown }).message;
  } catch {
    rawMessage = undefined;
  }
  const parsed = questionSchema.safeParse(rawMessage);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please write a short question (2–500 characters)." }, { status: 400 });
  }

  const message = parsed.data;

  // FAQ retrieval happens once; admin-managed FAQs feed both AI and smart modes.
  let faqMatch: { question: string; answer: string } | null = null;
  try {
    const faqs = await getFaqs();
    faqMatch = findFaq(message, faqs.map((faq) => ({ question: faq.question, answer: faq.answer })));
  } catch {
    faqMatch = null;
  }

  let reply: AssistantReply;

  if (aiConfigured()) {
    const aiText = await askGemini(message, buildFacts(faqMatch));
    if (aiText) {
      const topic = findTopic(message).topic;
      reply = { reply: aiText, topicId: topic?.id ?? null, sources: topic?.sources ?? [], mode: "ai" };
    } else {
      reply = smartReply(message, faqMatch);
    }
  } else {
    reply = smartReply(message, faqMatch);
  }

  return NextResponse.json(reply);
}

function smartReply(
  message: string,
  faqMatch: { question: string; answer: string } | null,
): AssistantReply {
  const { topic } = findTopic(message);

  if (faqMatch) {
    return {
      reply: `${faqMatch.question}\n\n${faqMatch.answer.replace(/<[^>]*>/g, "").trim()}`,
      topicId: topic?.id ?? "faq",
      sources: topic?.sources ?? [{ label: "Read all FAQs", href: "/faq" }],
      mode: "smart",
    };
  }

  if (topic) {
    return {
      reply: formatTopicAnswer(topic),
      topicId: topic.id,
      sources: topic.sources ?? [],
      mode: "smart",
    };
  }

  return fallbackReply();
}
