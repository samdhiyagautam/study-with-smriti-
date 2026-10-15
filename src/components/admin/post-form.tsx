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
import { savePostAction, type ActionState } from "@/server/actions/content";

export interface FormOption {
  id: string;
  name: string;
}

export interface PostFormValues {
  originalSlug: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string;
  status: "draft" | "published" | "unpublished";
  seoTitle: string;
  seoDescription: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
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

const STATUS_OPTIONS: Array<{ value: PostFormValues["status"]; label: string }> = [
  { value: "draft", label: "Draft (hidden)" },
  { value: "published", label: "Published (live)" },
  { value: "unpublished", label: "Unpublished (was live)" },
];

export function PostForm({
  post,
  categories,
  submitLabel,
}: {
  post: PostFormValues | null;
  categories: FormOption[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    savePostAction,
    { status: "idle" },
  );

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [content, setContent] = useState(post?.content ?? "");

  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-lg border border-error/40 bg-error-soft px-4 py-3 text-sm font-medium text-error"
        >
          {state.message}
        </p>
      ) : null}

      {post ? <input type="hidden" name="originalSlug" value={post.originalSlug} /> : null}
      <input type="hidden" name="content" value={content} />

      <section className={CARD_CLASS} aria-labelledby="post-main">
        <h2 id="post-main" className="text-base font-bold">
          Post
        </h2>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="post-title">
            Title *
          </label>
          <input
            id="post-title"
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
          <label className={LABEL_CLASS} htmlFor="post-slug">
            Slug (URL)
          </label>
          <input
            id="post-slug"
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
          <p className={HINT_CLASS}>
            Post address: /blog/{slug || "your-slug"} — lowercase letters, numbers, hyphens.
          </p>
          {errors.slug ? <p className={ERROR_CLASS}>{errors.slug}</p> : null}
        </div>

        <div className="mt-6">
          <span className={LABEL_CLASS}>Content *</span>
          <div className="mt-1.5">
            <RichEditor initialHtml={content} onChange={setContent} label="Post content" />
          </div>
          {errors.content ? <p className={ERROR_CLASS}>{errors.content}</p> : null}
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="post-excerpt">
            Excerpt (short summary for lists & SEO)
          </label>
          <textarea
            id="post-excerpt"
            name="excerpt"
            rows={2}
            maxLength={500}
            className={TEXTAREA_CLASS}
            defaultValue={post?.excerpt ?? ""}
          />
          {errors.excerpt ? <p className={ERROR_CLASS}>{errors.excerpt}</p> : null}
        </div>
      </section>

      <section className={CARD_CLASS} aria-labelledby="post-publish">
        <h2 id="post-publish" className="text-base font-bold">
          Publishing
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="post-status">
              Status
            </label>
            <select
              id="post-status"
              name="status"
              className={SELECT_CLASS}
              defaultValue={post?.status ?? "draft"}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="post-category">
              Category
            </label>
            <select
              id="post-category"
              name="categoryId"
              className={SELECT_CLASS}
              defaultValue={post?.categoryId ?? ""}
            >
              <option value="">— No category —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="post-tags">
            Tags
          </label>
          <input
            id="post-tags"
            name="tagsCsv"
            maxLength={500}
            className={INPUT_CLASS}
            defaultValue={post?.tags ?? ""}
            placeholder="exam tips, class 10, maths"
          />
          <p className={HINT_CLASS}>
            Comma-separated. New tag names are created automatically; existing ones are reused.
          </p>
        </div>
      </section>

      <section className={CARD_CLASS} aria-labelledby="post-image">
        <h2 id="post-image" className="text-base font-bold">
          Featured image
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="post-image-url">
              Image URL
            </label>
            <input
              id="post-image-url"
              name="featuredImageUrl"
              type="url"
              maxLength={500}
              className={INPUT_CLASS}
              defaultValue={post?.featuredImageUrl ?? ""}
              placeholder="https://… (copy from Admin → Media)"
            />
            {errors.featuredImageUrl ? (
              <p className={ERROR_CLASS}>{errors.featuredImageUrl}</p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="post-image-alt">
              Alt text {post?.featuredImageUrl || post?.featuredImageAlt ? "*" : ""}
            </label>
            <input
              id="post-image-alt"
              name="featuredImageAlt"
              maxLength={300}
              className={INPUT_CLASS}
              defaultValue={post?.featuredImageAlt ?? ""}
              placeholder="Describe the image for screen readers"
            />
            {errors.featuredImageAlt ? (
              <p className={ERROR_CLASS}>{errors.featuredImageAlt}</p>
            ) : null}
          </div>
        </div>
        <p className={HINT_CLASS}>Alt text is required whenever an image is set (accessibility).</p>
      </section>

      <section className={CARD_CLASS} aria-labelledby="post-seo">
        <h2 id="post-seo" className="text-base font-bold">
          SEO
        </h2>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="post-seo-title">
            SEO title (up to 70 characters)
          </label>
          <input
            id="post-seo-title"
            name="seoTitle"
            maxLength={70}
            className={INPUT_CLASS}
            defaultValue={post?.seoTitle ?? ""}
          />
          {errors.seoTitle ? <p className={ERROR_CLASS}>{errors.seoTitle}</p> : null}
        </div>
        <div className="mt-4">
          <label className={LABEL_CLASS} htmlFor="post-seo-description">
            SEO description (up to 170 characters)
          </label>
          <textarea
            id="post-seo-description"
            name="seoDescription"
            rows={2}
            maxLength={170}
            className={TEXTAREA_CLASS}
            defaultValue={post?.seoDescription ?? ""}
          />
          {errors.seoDescription ? <p className={ERROR_CLASS}>{errors.seoDescription}</p> : null}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={PRIMARY_BUTTON}>
          {pending ? "Saving…" : submitLabel}
        </button>
        <p className="text-xs text-muted">
          Saved posts are re-sanitized on the server before storing.
        </p>
      </div>
    </form>
  );
}
