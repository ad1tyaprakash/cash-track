const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

interface CreateTransactionPayload {
  title: string;
  content?: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

export interface StockEntry {
  ticker: string;
  quantity: number;
  purchase_price: number;
  current_price: number;
  current_value: number;
  profit: number;
}

export interface StockOption {
  symbol: string;
  name: string;
  price: number;
}

export interface DashboardOverview {
  net_worth: number;
  total_savings: number;
  total_net_worth: number;
  deficit: number;
  expense_breakdown: {
    labels: string[];
    data: number[];
  };
  net_worth_breakdown: {
    labels: string[];
    data: number[];
  };
  stock_data: StockEntry[];
  available_stocks: StockOption[];
}

export interface CreateIncomePayload {
  source: string;
  amount: number;
  date?: string;
  category?: string;
  content?: string;
}

export interface CreateExpensePayload {
  category: string;
  amount: number;
  title?: string;
  date?: string;
  content?: string;
}

export interface CreateStockPayload {
  ticker: string;
  quantity: number;
  purchase_price: number;
  current_price?: number;
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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Request failed");
  }
  return response.json() as Promise<T>;
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

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response = await fetch(`${BASE_URL}/api/dashboard/overview`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  return handleResponse<DashboardOverview>(response);
}

export async function createIncome(payload: CreateIncomePayload): Promise<Transaction> {
  const response = await fetch(`${BASE_URL}/api/dashboard/income`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Transaction>(response);
}

export async function createExpense(payload: CreateExpensePayload): Promise<Transaction> {
  const response = await fetch(`${BASE_URL}/api/dashboard/expense`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<Transaction>(response);
}

export async function createStock(payload: CreateStockPayload): Promise<StockEntry> {
  const response = await fetch(`${BASE_URL}/api/dashboard/stock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<StockEntry>(response);
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
