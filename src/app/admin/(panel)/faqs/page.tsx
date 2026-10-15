import { ConfirmForm } from "@/components/admin/confirm-form";
import {
  CARD_CLASS,
  DANGER_BUTTON,
  HINT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON,
  TEXTAREA_CLASS,
} from "@/components/admin/field-styles";
import { NotConfigured, StatusNotice } from "@/components/admin/status-notice";
import { createServerSupabase, requireAdminOrRedirect } from "@/lib/supabase/server";
import { deleteFaqAction, saveFaqAction } from "@/server/actions/content";

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_published: boolean;
}

function FaqCard({ faq }: { faq: FaqRow }) {
  const fieldId = (name: string) => `faq-${faq.id}-${name}`;

  return (
    <li className={CARD_CLASS}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold">
          {faq.question}
          {!faq.is_published ? (
            <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-muted">
              hidden
            </span>
          ) : null}
        </p>
        <ConfirmForm
          action={deleteFaqAction}
          message="Delete this FAQ permanently?"
          className="shrink-0"
        >
          <input type="hidden" name="id" value={faq.id} />
          <button type="submit" className={DANGER_BUTTON}>
            Delete
          </button>
        </ConfirmForm>
      </div>

      <form action={saveFaqAction} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={faq.id} />

        <div>
          <label className={LABEL_CLASS} htmlFor={fieldId("question")}>
            Question *
          </label>
          <input
            id={fieldId("question")}
            name="question"
            required
            maxLength={300}
            defaultValue={faq.question}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor={fieldId("answer")}>
            Answer *
          </label>
          <textarea
            id={fieldId("answer")}
            name="answer"
            required
            rows={3}
            maxLength={5000}
            defaultValue={faq.answer}
            className={TEXTAREA_CLASS}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor={fieldId("category")}>
              Group
            </label>
            <input
              id={fieldId("category")}
              name="category"
              maxLength={80}
              defaultValue={faq.category ?? ""}
              placeholder="Admissions, Classes…"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor={fieldId("sort")}>
              Sort order
            </label>
            <input
              id={fieldId("sort")}
              name="sortOrder"
              type="number"
              min={0}
              max={9999}
              defaultValue={faq.sort_order}
              className={INPUT_CLASS}
            />
          </div>
          <label className="mt-6 flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={faq.is_published}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Visible on site
          </label>
        </div>

        <button type="submit" className={PRIMARY_BUTTON}>
          Save FAQ
        </button>
      </form>
    </li>
  );
}

export default async function AdminFaqsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; msg?: string }>;
}) {
  const { status, msg } = await searchParams;
  await requireAdminOrRedirect();
  const supabase = await createServerSupabase();

  if (!supabase) return <NotConfigured what="FAQs" />;

  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, category, sort_order, is_published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(300);

  if (error) console.warn("[admin/faqs] list failed:", error.message);
  const faqs = (data ?? []) as unknown as FaqRow[];
  const published = faqs.filter((faq) => faq.is_published).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">FAQs</h1>
        <p className="text-sm text-muted">
          {published} visible · {faqs.length - published} hidden — order follows sort order.
        </p>
      </div>

      <StatusNotice status={status} msg={msg} />

      <section aria-labelledby="faq-add" className={CARD_CLASS}>
        <h2 id="faq-add" className="text-base font-bold">
          Add a question
        </h2>
        <form action={saveFaqAction} className="mt-4 space-y-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="faq-new-question">
              Question *
            </label>
            <input
              id="faq-new-question"
              name="question"
              required
              maxLength={300}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="faq-new-answer">
              Answer *
            </label>
            <textarea
              id="faq-new-answer"
              name="answer"
              required
              rows={3}
              maxLength={5000}
              className={TEXTAREA_CLASS}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS} htmlFor="faq-new-category">
                Group
              </label>
              <input
                id="faq-new-category"
                name="category"
                maxLength={80}
                placeholder="Admissions, Classes…"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="faq-new-sort">
                Sort order
              </label>
              <input
                id="faq-new-sort"
                name="sortOrder"
                type="number"
                min={0}
                max={9999}
                defaultValue={faqs.length}
                className={INPUT_CLASS}
              />
            </div>
            <label className="mt-6 flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Visible on site
            </label>
          </div>
          <button type="submit" className={PRIMARY_BUTTON}>
            Add FAQ
          </button>
          <p className={HINT_CLASS}>New questions start hidden if you uncheck “Visible on site”.</p>
        </form>
      </section>

      {faqs.length === 0 ? (
        <p className="text-sm text-muted">No FAQs yet — add the first one above.</p>
      ) : (
        <ul className="space-y-4">
          {faqs.map((faq) => (
            <FaqCard key={faq.id} faq={faq} />
          ))}
        </ul>
      )}
    </div>
  );
}
