import { ASSISTANT_FALLBACK, ASSISTANT_TOPICS, type AssistantSource, type AssistantTopic } from "./knowledge";

export interface AssistantReply {
  reply: string;
  topicId: string | null;
  sources: AssistantSource[];
  mode: "smart" | "ai";
}

/** Lowercase, strip punctuation, collapse whitespace. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Keyword-and-phrase scorer over the verified topics. Phrase hits (multi-word
 * keywords) count more than single-token hits.
 */
export function findTopic(message: string): { topic: AssistantTopic | null; score: number } {
  const haystack = normalize(message);
  const tokens = new Set(haystack.split(" ").filter((token) => token.length > 1));

  let best: AssistantTopic | null = null;
  let bestScore = 0;

  for (const topic of ASSISTANT_TOPICS) {
    let score = 0;
    for (const keyword of topic.keywords) {
      const normalizedKeyword = normalize(keyword);
      if (!normalizedKeyword) continue;
      if (normalizedKeyword.includes(" ")) {
        if (haystack.includes(normalizedKeyword)) score += 3;
      } else if (tokens.has(normalizedKeyword)) {
        score += 1.2;
      }
    }
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }

  return { topic: bestScore >= 1.2 ? best : null, score: bestScore };
}

export function formatTopicAnswer(topic: AssistantTopic): string {
  const lines = [topic.answer];
  if (topic.sources?.length) {
    lines.push(
      `Pages that help: ${topic.sources.map((source) => source.label).join(" · ")}`,
    );
  }
  return lines.join("\n\n");
}

/** Plain-text answer used when no topic matched (no invention, just honesty). */
export function fallbackReply(): AssistantReply {
  return {
    reply: `${ASSISTANT_FALLBACK.answer}\n\n• Message the team — /contact\n• Read the FAQs — /faq`,
    topicId: null,
    sources: [
      { label: "Contact & support", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
    mode: "smart",
  };
}

/** Best matching published FAQ by token overlap (admin FAQs feed the assistant). */
export function findFaq(
  message: string,
  faqs: Array<{ question: string; answer: string }>,
): { question: string; answer: string } | null {
  const tokens = normalize(message)
    .split(" ")
    .filter((token) => token.length > 2);
  if (tokens.length === 0) return null;

  let best: { question: string; answer: string } | null = null;
  let bestHits = 0;

  for (const faq of faqs) {
    const hay = normalize(`${faq.question} ${faq.answer}`);
    let hits = 0;
    for (const token of tokens) {
      if (hay.includes(token)) hits += 1;
    }
    if (hits > bestHits) {
      best = faq;
      bestHits = hits;
    }
  }

  return bestHits >= 2 ? best : null;
}
