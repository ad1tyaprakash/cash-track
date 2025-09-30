import { auth } from "./firebase";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Failed to get auth token:", error);
  }

  return headers;
}

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

export interface Investment {
  id: string;
  type: 'property' | 'mutual_fund' | 'bond' | 'commodity' | 'crypto' | 'other';
  name: string;
  description?: string;
  purchase_value: number;
  current_value: number;
  purchase_date: string;
  last_updated: string;
  quantity?: number;
  location?: string;
  custom_type?: string;
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
  investment_data: Investment[];
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
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/overview`, {
    headers,
    cache: "no-store",
  });
  return handleResponse<DashboardOverview>(response);
}

export async function createIncome(payload: CreateIncomePayload): Promise<Transaction> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/income`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<Transaction>(response);
}

export async function createExpense(payload: CreateExpensePayload): Promise<Transaction> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/expense`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<Transaction>(response);
}

export async function createStock(payload: CreateStockPayload): Promise<StockEntry> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/stock`, {
    method: "POST",
    headers,
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

export async function getTransactions(): Promise<Transaction[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/transactions`, {
    headers,
    cache: "no-store",
  });
  return handleResponse<Transaction[]>(response);
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/transaction/${transactionId}`, {
    method: "DELETE",
    headers,
  });
  await handleResponse<{ message: string }>(response);
}

export async function deleteStock(ticker: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/stock/${ticker}`, {
    method: "DELETE",
    headers,
  });
  await handleResponse<{ message: string }>(response);
}

// Investment API functions
export interface CreateInvestmentPayload {
  type: string;
  name: string;
  description?: string;
  purchase_value: number;
  current_value: number;
  purchase_date: string;
  quantity?: number;
  location?: string;
  custom_type?: string;
}

export async function getInvestments(): Promise<Investment[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/investments`, {
    headers,
    cache: "no-store",
  });
  return handleResponse<Investment[]>(response);
}

export async function addInvestment(payload: CreateInvestmentPayload): Promise<Investment> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/investment`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<Investment>(response);
}

export async function updateInvestment(investmentId: string, payload: Partial<CreateInvestmentPayload>): Promise<Investment> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/investment/${investmentId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<Investment>(response);
}

export async function deleteInvestment(investmentId: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/dashboard/investment/${investmentId}`, {
    method: "DELETE",
    headers,
  });
  await handleResponse<{ message: string }>(response);
}
