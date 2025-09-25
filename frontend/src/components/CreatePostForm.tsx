"use client";

import { useState } from "react";

import { createPost } from "../lib/api";

export function CreatePostForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      await createPost({ title, content });
      setStatus("Post created successfully");
      setTitle("");
      setContent("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h2 className="mb-4 text-xl font-semibold">Create post</h2>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Weekly update"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Content
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="h-28 resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Share your progress update..."
            required
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Posting..." : "Create post"}
        </button>

        {status && <p className="text-sm text-slate-500 dark:text-slate-400">{status}</p>}
      </div>
    </form>
  );
}
