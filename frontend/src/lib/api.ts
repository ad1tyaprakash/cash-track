const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface CreatePostPayload {
  title: string;
  content: string;
}

export async function listPosts() {
  const response = await fetch(`${BASE_URL}/api/posts/`, {
    headers: { "Accept": "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  return response.json();
}

export async function createPost(payload: CreatePostPayload) {
  const response = await fetch(`${BASE_URL}/api/posts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error ?? "Failed to create post");
  }

  return response.json();
}
