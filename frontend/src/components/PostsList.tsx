"use client";

import { useEffect, useState } from "react";

import { listPosts } from "../lib/api";

interface Post {
  id: string;
  title: string;
  content: string;
}

export function TransactionsList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await listPosts();
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-xl font-semibold">Recent posts</h2>
      {isLoading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No posts yet.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li key={post.id} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{post.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export { TransactionsList as PostsList } from "./TransactionsList";
