const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

interface CreateTransactionPayload {
  title: string;
  content?: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

export interface Transaction {
  id: string;
  title: string;
  content: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

export interface Summary {
  income: number;
  expenses: number;
  balance: number;
  transaction_count: number;
}

export async function listPosts(): Promise<Transaction[]> {
  const response = await fetch(`${BASE_URL}/api/posts/`, {
    headers: { "Accept": "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}

export async function createPost(payload: CreateTransactionPayload): Promise<Transaction> {
  const response = await fetch(`${BASE_URL}/api/posts/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error ?? "Failed to create transaction");
  }

  return response.json();
}

export async function getSummary(): Promise<Summary> {
  const response = await fetch(`${BASE_URL}/api/posts/summary`, {
    headers: { "Accept": "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }

  return response.json();
}
