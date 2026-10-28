"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Floating "Ask AI" assistant for public pages. Hidden in /admin.
 * All answers come from the server (verified knowledge base + published FAQs,
 * optionally Gemini when configured) — the widget only renders what the API
 * returns, so it can never invent facts on its own.
 */

interface AssistantSource {
  label: string;
  href: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  mode?: "smart" | "ai";
  sources?: AssistantSource[];
}

interface AssistantApiResponse {
  reply?: string;
  mode?: "smart" | "ai";
  sources?: AssistantSource[];
  error?: string;
}

const SUGGESTIONS = [
  "App kis class ke liye hai?",
  "Notes kahan milenge?",
  "How do I contact the team?",
];

const GREETING: ChatMessage = {
  role: "assistant",
  text: "Namaste! 👋 Main Study with Smriti ka assistant hoon. App, classes, subjects ya contact ke baare me kuch bhi poochho — main sirf verified jaankari dunga.",
  mode: "smart",
  sources: [
    { label: "About", href: "/about" },
    { label: "Features", href: "/features" },
  ],
};

export function AssistantWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const isOpenOnAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, pending]);

  const send = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (!message || pending) return;

      setInput("");
      setMessages((current) => [...current, { role: "user", text: message }]);
      setPending(true);

      try {
        const response = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        const data = (await response.json()) as AssistantApiResponse;
        if (!response.ok || !data.reply) {
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              text:
                data.error ??
                "Something went wrong — please try again, or use the contact page to reach the team.",
              sources: [{ label: "Contact & support", href: "/contact" }],
            },
          ]);
        } else {
          setMessages((current) => [
            ...current,
            { role: "assistant", text: data.reply as string, mode: data.mode, sources: data.sources },
          ]);
        }
      } catch {
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            text: "Network issue — message nahi pahuncha. Thodi der baad try karo.",
          },
        ]);
      } finally {
        setPending(false);
        inputRef.current?.focus();
      }
    },
    [pending],
  );

  if (isOpenOnAdmin) return null;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="assistant-panel"
        aria-label={open ? "Close the AI assistant" : "Ask AI about Study with Smriti"}
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-fg shadow-lg transition-transform hover:scale-105 focus-visible:outline-focus focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        <span aria-hidden="true">{open ? "✕" : "💬"}</span>
      </button>

      {open && (
        <div
          id="assistant-panel"
          role="dialog"
          aria-label="Study with Smriti AI assistant"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          className="assistant-panel glass fixed right-5 z-[70] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col rounded-2xl shadow-xl"
          style={{ bottom: "max(5.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))", maxHeight: "min(30rem, calc(100vh - 8rem))" }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Ask AI</p>
              <p className="text-xs text-muted">Study with Smriti assistant</p>
            </div>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
              verified facts only
            </span>
          </div>

          <div
            ref={listRef}
            data-lenis-prevent
            aria-live="polite"
            className="assistant-msgs flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-fg"
                    : "bg-surface text-[color:inherit]"
                }`}
              >
                <span className="sr-only">{message.role === "user" ? "You asked: " : "Assistant says: "}</span>
                {message.text}
                {message.sources && message.sources.length > 0 && (
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {message.sources.map((source) => (
                      <Link
                        key={source.href}
                        href={source.href}
                        className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium hover:bg-primary hover:text-primary-fg"
                      >
                        {source.label} →
                      </Link>
                    ))}
                  </span>
                )}
                {message.role === "assistant" && index > 0 && message.mode && (
                  <span className="mt-1.5 block text-[10px] uppercase tracking-wide text-muted">
                    {message.mode === "ai" ? "AI answer — verify with the team" : "From verified info"}
                  </span>
                )}
              </div>
            ))}
            {pending && (
              <div className="w-24 rounded-2xl bg-surface px-3.5 py-2.5 text-sm" aria-hidden="true">
                <span className="assistant-typing">● ● ●</span>
                <span className="sr-only">Assistant is typing…</span>
              </div>
            )}
          </div>

          {messages.length <= 1 && !pending && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs font-medium hover:bg-primary hover:text-primary-fg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex items-center gap-2 border-t border-border px-3 py-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <label className="sr-only" htmlFor="assistant-input">
              Ask a question about Study with Smriti
            </label>
            <input
              id="assistant-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={500}
              autoComplete="off"
              placeholder="App ke baare me poochho…"
              className="min-w-0 flex-1 rounded-full border border-border bg-surface px-3.5 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
            />
            <button
              type="submit"
              disabled={pending || input.trim().length === 0}
              className="rounded-full bg-primary px-3.5 py-2 text-sm font-semibold text-primary-fg disabled:opacity-50"
            >
              <span aria-hidden="true">➤</span>
              <span className="sr-only">Send question</span>
            </button>
          </form>

          <p className="px-4 pb-3 text-[11px] leading-snug text-muted">
            Assistant sirf app/website ki verified jaankari deta hai. Confirm ke liye{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-[color:inherit]">
              team se contact
            </Link>{" "}
            karo.
          </p>
        </div>
      )}
    </>
  );
}
