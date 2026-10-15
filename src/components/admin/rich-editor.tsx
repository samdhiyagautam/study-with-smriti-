"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

/**
 * Rich-text editor for blog posts / resources.
 *
 * - The toolbar only offers formatting the server-side sanitizer keeps
 *   (h2/h3/h4 — no h1; see src/lib/sanitize.ts), so nothing is silently lost.
 * - Output is HTML; the server action re-sanitizes and stores it as JSONB.
 * - `immediatelyRender: false` keeps SSR/hydration consistent in Next.js.
 */

interface RichEditorProps {
  initialHtml: string;
  onChange: (html: string) => void;
  label?: string;
}

interface ToolbarItem {
  label: string;
  run: () => void;
  active?: boolean;
  disabled?: boolean;
}

export function RichEditor({ initialHtml, onChange, label = "Content" }: RichEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      Image,
      Placeholder.configure({
        placeholder: "Start writing… use H2/H3 for headings.",
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: `prose-sws sws-editor-content min-h-72`,
        "aria-label": label,
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  if (!editor) {
    return (
      <div
        aria-busy="true"
        className="min-h-72 rounded-lg border border-border bg-bg px-4 py-3 text-sm text-muted"
      >
        Loading editor…
      </div>
    );
  }

  function setLink(): void {
    if (editor!.isActive("link")) {
      editor!.chain().focus().unsetLink().run();
      return;
    }
    const previous = (editor!.getAttributes("link").href as string | undefined) ?? "";
    const input = window.prompt("Link URL (https://…, mailto:… or /page):", previous);
    if (input === null) return;
    const href = input.trim();
    if (href === "") {
      editor!.chain().focus().unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:|\/)/i.test(href)) {
      window.alert("Links must start with https://, http://, mailto: or /");
      return;
    }
    editor!.chain().focus().setLink({ href }).run();
  }

  function insertImage(): void {
    const src = window.prompt("Image URL (copy it from Admin → Media):");
    if (src === null || src.trim() === "") return;
    if (!/^https?:\/\//i.test(src.trim())) {
      window.alert("Image URLs must start with https:// or http://");
      return;
    }
    const alt = window.prompt("Alt text (describe the image, or leave empty):") ?? "";
    editor!.chain().focus().setImage({ src: src.trim(), alt: alt.trim() }).run();
  }

  const items: ToolbarItem[] = [
    {
      label: "Bold",
      run: () => editor!.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "Italic",
      run: () => editor!.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "Underline",
      run: () => editor!.chain().focus().toggleUnderline().run(),
      active: editor.isActive("underline"),
    },
    {
      label: "Strikethrough",
      run: () => editor!.chain().focus().toggleStrike().run(),
      active: editor.isActive("strike"),
    },
    { label: "Separator", run: () => editor!.chain().focus().setHorizontalRule().run() },
    {
      label: "Heading 2",
      run: () => editor!.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "Heading 3",
      run: () => editor!.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      label: "Heading 4",
      run: () => editor!.chain().focus().toggleHeading({ level: 4 }).run(),
      active: editor.isActive("heading", { level: 4 }),
    },
    {
      label: "Bullet list",
      run: () => editor!.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "Numbered list",
      run: () => editor!.chain().focus().toggleOrderedList().run(),
      active: editor.isActive("orderedList"),
    },
    {
      label: "Quote",
      run: () => editor!.chain().focus().toggleBlockquote().run(),
      active: editor.isActive("blockquote"),
    },
    {
      label: "Code block",
      run: () => editor!.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
    },
    { label: "Link", run: setLink, active: editor.isActive("link") },
    { label: "Image", run: insertImage },
    {
      label: "Undo",
      run: () => editor!.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      label: "Redo",
      run: () => editor!.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
    },
  ];

  return (
    <div className="rounded-lg border border-border-strong bg-bg">
      <div
        role="group"
        aria-label="Formatting options"
        className="flex flex-wrap gap-1 border-b border-border bg-surface px-2 py-1.5"
      >
        {items.map((item, index) => (
          <span key={item.label} className="flex items-center">
            {index === 4 || index === 14 ? (
              <span aria-hidden="true" className="mx-1 h-5 w-px bg-border-strong" />
            ) : null}
            <button
              type="button"
              aria-label={item.label}
              aria-pressed={item.active}
              disabled={item.disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={item.run}
              className={`rounded px-2 py-1 text-xs font-medium transition-colors disabled:opacity-40 ${
                item.active
                  ? "bg-primary-soft text-primary"
                  : "text-muted hover:bg-surface hover:text-text"
              }`}
            >
              {item.label}
            </button>
          </span>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

/** Exposed for reuse/testing — the active editor instance type. */
export type { Editor };
