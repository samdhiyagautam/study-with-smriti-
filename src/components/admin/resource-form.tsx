"use client";

import { useActionState, useState } from "react";
import {
  CARD_CLASS,
  ERROR_CLASS,
  HINT_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PRIMARY_BUTTON,
  SELECT_CLASS,
  TEXTAREA_CLASS,
} from "@/components/admin/field-styles";
import { RichEditor } from "@/components/admin/rich-editor";
import { saveResourceAction, type ActionState } from "@/server/actions/content";
import type { FormOption } from "@/components/admin/post-form";

export interface ResourceFormValues {
  originalSlug: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  categoryId: string;
  subject: string;
  classLevel: "8" | "9" | "10" | "8-10" | "";
  fileUrl: string;
  status: "draft" | "published" | "unpublished";
  seoTitle: string;
  seoDescription: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const STATUS_OPTIONS: Array<{ value: ResourceFormValues["status"]; label: string }> = [
  { value: "draft", label: "Draft (hidden)" },
  { value: "published", label: "Published (live)" },
  { value: "unpublished", label: "Unpublished (was live)" },
];

const CLASS_OPTIONS = [
  { value: "", label: "— All classes —" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" },
  { value: "8-10", label: "Classes 8–10" },
];

export function ResourceForm({
  resource,
  categories,
  submitLabel,
}: {
  resource: ResourceFormValues | null;
  categories: FormOption[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveResourceAction,
    { status: "idle" },
  );

  const [title, setTitle] = useState(resource?.title ?? "");
  const [slug, setSlug] = useState(resource?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(resource));
  const [content, setContent] = useState(resource?.content ?? "");

  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-6" encType="multipart/form-data">
      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-lg border border-error/40 bg-error-soft px-4 py-3 text-sm font-medium text-error"
        >
          {state.message}
        </p>
      ) : null}

      {resource ? <input type="hidden" name="originalSlug" value={resource.originalSlug} /> : null}
      <input type="hidden" name="content" value={content} />

      <section className={CARD_CLASS} aria-labelledby="res-main">
        <h2 id="res-main" className="text-base font-bold">
          Resource
        </h2>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="res-title">
            Title *
          </label>
          <input
            id="res-title"
            name="title"
            required
            maxLength={200}
            className={INPUT_CLASS}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
          />
          {errors.title ? <p className={ERROR_CLASS}>{errors.title}</p> : null}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="res-slug">
            Slug (URL)
          </label>
          <input
            id="res-slug"
            name="slug"
            maxLength={100}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={INPUT_CLASS}
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value.toLowerCase());
            }}
          />
          <p className={HINT_CLASS}>Address: /resources/{slug || "your-slug"}</p>
          {errors.slug ? <p className={ERROR_CLASS}>{errors.slug}</p> : null}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="res-description">
            Description
          </label>
          <textarea
            id="res-description"
            name="description"
            rows={2}
            maxLength={500}
            className={TEXTAREA_CLASS}
            defaultValue={resource?.description ?? ""}
          />
          {errors.description ? <p className={ERROR_CLASS}>{errors.description}</p> : null}
        </div>

        <div className="mt-6">
          <span className={LABEL_CLASS}>Content</span>
          <div className="mt-1.5">
            <RichEditor initialHtml={content} onChange={setContent} label="Resource content" />
          </div>
          {errors.content ? <p className={ERROR_CLASS}>{errors.content}</p> : null}
        </div>
      </section>

      <section className={CARD_CLASS} aria-labelledby="res-meta">
        <h2 id="res-meta" className="text-base font-bold">
          Classification
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="res-category">
              Category
            </label>
            <select
              id="res-category"
              name="categoryId"
              className={SELECT_CLASS}
              defaultValue={resource?.categoryId ?? ""}
            >
              <option value="">— No category —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="res-subject">
              Subject
            </label>
            <input
              id="res-subject"
              name="subject"
              maxLength={80}
              className={INPUT_CLASS}
              defaultValue={resource?.subject ?? ""}
              placeholder="Maths, Science…"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="res-class">
              Class level
            </label>
            <select
              id="res-class"
              name="classLevel"
              className={SELECT_CLASS}
              defaultValue={resource?.classLevel ?? ""}
            >
              {CLASS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className={CARD_CLASS} aria-labelledby="res-file">
        <h2 id="res-file" className="text-base font-bold">
          Attachment (PDF)
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="res-file">
              Upload PDF
            </label>
            <input
              id="res-file"
              name="file"
              type="file"
              accept="application/pdf"
              className={`${INPUT_CLASS} file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold`}
            />
            <p className={HINT_CLASS}>Max 5 MB. Replaces the attached file URL on save.</p>
            {errors.file ? <p className={ERROR_CLASS}>{errors.file}</p> : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="res-file-url">
              …or file URL
            </label>
            <input
              id="res-file-url"
              name="fileUrl"
              maxLength={500}
              className={INPUT_CLASS}
              defaultValue={resource?.fileUrl ?? ""}
              placeholder="resource-files/… or https://…"
            />
            {errors.fileUrl ? <p className={ERROR_CLASS}>{errors.fileUrl}</p> : null}
          </div>
        </div>
      </section>

      <section className={CARD_CLASS} aria-labelledby="res-publish">
        <h2 id="res-publish" className="text-base font-bold">
          Publishing
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="res-status">
              Status
            </label>
            <select
              id="res-status"
              name="status"
              className={SELECT_CLASS}
              defaultValue={resource?.status ?? "draft"}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="self-end">
            <p className={HINT_CLASS + " sm:pb-2.5"}>
              Only <strong>published</strong> items appear on the public site.
            </p>
          </div>
        </div>
      </section>

      <section className={CARD_CLASS} aria-labelledby="res-seo">
        <h2 id="res-seo" className="text-base font-bold">
          SEO
        </h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="res-seo-title">
            SEO title (up to 70 characters)
          </label>
          <input
            id="res-seo-title"
            name="seoTitle"
            maxLength={70}
            className={INPUT_CLASS}
            defaultValue={resource?.seoTitle ?? ""}
          />
          {errors.seoTitle ? <p className={ERROR_CLASS}>{errors.seoTitle}</p> : null}
        </div>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="res-seo-description">
            SEO description (up to 170 characters)
          </label>
          <textarea
            id="res-seo-description"
            name="seoDescription"
            rows={2}
            maxLength={170}
            className={TEXTAREA_CLASS}
            defaultValue={resource?.seoDescription ?? ""}
          />
          {errors.seoDescription ? <p className={ERROR_CLASS}>{errors.seoDescription}</p> : null}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
