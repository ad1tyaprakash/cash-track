"""Firebase Realtime Database data store for the cash-track backend with user isolation."""
from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Any, Dict, Iterable, List, Tuple
from services.firebase_db import get_firebase_store
from services.auth import get_current_user_id

# Get Firebase store instance
firebase_store = get_firebase_store()

# Seed transaction data - only used if Firebase is not available
_SEED_TRANSACTIONS: List[Dict[str, Any]] = [
    {
        "id": "1",
        "title": "Grocery Shopping",
        "content": "Weekly groceries at Whole Foods",
        "amount": -85.50,
        "type": "expense",
        "category": "Food",
        "date": "2025-09-25T10:30:00Z",
    },
    {
        "id": "2",
        "title": "Freelance Payment",
        "content": "Payment from client for web design project",
        "amount": 500.00,
        "type": "income",
        "category": "Work",
        "date": "2025-09-24T14:20:00Z",
    },
    {
        "id": "3",
        "title": "Gas Station",
        "content": "Fuel for car",
        "amount": -45.25,
        "type": "expense",
        "category": "Transportation",
        "date": "2025-09-23T08:15:00Z",
    },
]

_AVAILABLE_STOCKS: Tuple[Dict[str, Any], ...] = (
    {"symbol": "AAPL", "name": "Apple Inc.", "price": 191.32},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 415.12},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 165.76},
    {"symbol": "AMZN", "name": "Amazon.com, Inc.", "price": 180.45},
    {"symbol": "TSLA", "name": "Tesla, Inc.", "price": 245.93},
)

_SEED_STOCKS: List[Dict[str, Any]] = [
    {
        "ticker": "AAPL",
        "quantity": 12,
        "purchase_price": 150.10,
        "current_price": 191.32,
    },
    {
        "ticker": "MSFT",
        "quantity": 5,
        "purchase_price": 320.50,
        "current_price": 415.12,
    },
    {
        "ticker": "TSLA",
        "quantity": 3,
        "purchase_price": 280.00,
        "current_price": 245.93,
    },
]


def _next_transaction_id() -> str:
    """Generate the next transaction ID based on existing Firebase data for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return "1"
        
    if firebase_store.firebase_available:
        transactions = firebase_store.get_transactions(user_id)
        if transactions:
            # Get the highest ID and increment
            try:
                max_id = max(int(t.get("id", "0")) for t in transactions if t.get("id", "0").isdigit())
                return str(max_id + 1)
            except (ValueError, TypeError):
                # If there's an issue with ID parsing, use length + 1
                return str(len(transactions) + 1)
        # No transactions exist, start with 1
        return "1"
    else:
        # Fallback for development without Firebase
        return str(len(_SEED_TRANSACTIONS) + 1)


def get_transactions() -> List[Dict[str, Any]]:
    """Return transactions from Firebase for current user or empty list for new users."""
    user_id = get_current_user_id()
    if not user_id:
        return []
        
    if firebase_store.firebase_available:
        transactions = firebase_store.get_transactions(user_id)
        return transactions if transactions else []
    else:
        # Fallback to seed data for development only
        return [transaction.copy() for transaction in _SEED_TRANSACTIONS]


def add_transaction(
    title: str,
    content: str,
    amount: float,
    transaction_type: str,
    category: str,
    date: datetime | None = None,
) -> Dict[str, Any]:
    """Add a transaction to Firebase for current user."""
    user_id = get_current_user_id()
    if not user_id:
        raise ValueError("User must be authenticated to add transactions")
        
    transaction = {
        "id": _next_transaction_id(),
        "title": title,
        "content": content,
        "amount": float(amount),
        "type": transaction_type,
        "category": category,
        "date": (date or datetime.utcnow()).isoformat() + "Z",
    }
    
    # Save to Firebase
    if firebase_store.firebase_available:
        return firebase_store.save_transaction(user_id, transaction)
    else:
        # For development without Firebase, add to seed data
        _SEED_TRANSACTIONS.append(transaction)
        return transaction


def delete_transaction(transaction_id: str) -> bool:
    """Remove a transaction from Firebase for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return False
        
    if firebase_store.firebase_available:
        # Delete from Firebase
        return firebase_store.delete_transaction(user_id, transaction_id)
    else:
        # For development without Firebase, remove from seed data
        global _SEED_TRANSACTIONS
        before = len(_SEED_TRANSACTIONS)
        _SEED_TRANSACTIONS = [t for t in _SEED_TRANSACTIONS if t["id"] != transaction_id]
        return len(_SEED_TRANSACTIONS) < before


def transaction_summary() -> Dict[str, Any]:
    """Compute totals for income, expenses, and balance from Firebase data."""
    transactions = get_transactions()
    income = sum(t["amount"] for t in transactions if t["type"] == "income")
    expenses = sum(abs(t["amount"]) for t in transactions if t["type"] == "expense")
    balance = income - expenses
    return {
        "income": income,
        "expenses": expenses,
        "balance": balance,
        "transaction_count": len(transactions),
    }


def expense_breakdown() -> Dict[str, float]:
    """Return a category => total spent mapping for expenses from Firebase data."""
    transactions = get_transactions()
    counter: Counter[str] = Counter()
    for transaction in transactions:
        if transaction["type"] == "expense":
            counter[transaction["category"]] += abs(transaction["amount"])
    # Preserve insertion order for deterministic output.
    return dict(counter)


def get_stocks() -> List[Dict[str, Any]]:
    """Return stocks from Firebase for current user or empty list for new users."""
    user_id = get_current_user_id()
    if not user_id:
        return []
        
    if firebase_store.firebase_available:
        stocks = firebase_store.get_stocks(user_id)
        return stocks if stocks else []
    else:
        # Fallback to seed data for development only
        return [stock.copy() for stock in _SEED_STOCKS]


def add_stock(
    *,
    ticker: str,
    quantity: float,
    purchase_price: float,
    current_price: float | None = None,
) -> Dict[str, Any]:
    """Persist a stock position to Firebase for current user. Default to reference price when current price is missing."""
    user_id = get_current_user_id()
    if not user_id:
        raise ValueError("User must be authenticated to add stocks")
        
    reference = next(
        (item for item in _AVAILABLE_STOCKS if item["symbol"] == ticker),
        None,
    )
    resolved_current_price = (
        float(current_price)
        if current_price is not None
        else float(reference["price"]) if reference else float(purchase_price)
    )
    stock = {
        "ticker": ticker,
        "quantity": float(quantity),
        "purchase_price": float(purchase_price),
        "current_price": resolved_current_price,
    }
    
    # Save to Firebase (or add to seed data if Firebase unavailable)
    if firebase_store.firebase_available:
        firebase_store.save_stock(user_id, stock)
    else:
        # For development without Firebase, add to seed data
        _SEED_STOCKS.append(stock)
    
    return stock.copy()


def delete_stock(ticker: str) -> bool:
    """Remove a stock position from Firebase for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return False
        
    if firebase_store.firebase_available:
        # Delete from Firebase
        return firebase_store.delete_stock(user_id, ticker)
    else:
        # For development without Firebase, remove from seed data
        global _SEED_STOCKS
        original_length = len(_SEED_STOCKS)
        _SEED_STOCKS = [s for s in _SEED_STOCKS if s["ticker"] != ticker]
        return len(_SEED_STOCKS) < original_length


def available_stocks() -> Tuple[Dict[str, Any], ...]:
    return _AVAILABLE_STOCKS


def _stocks_with_derived_values(
    stocks: Iterable[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    enriched: List[Dict[str, Any]] = []
    for stock in stocks:
        quantity = float(stock["quantity"])
        purchase_price = float(stock["purchase_price"])
        current_price = float(stock["current_price"])
        current_value = quantity * current_price
        cost_basis = quantity * purchase_price
        profit = current_value - cost_basis
        enriched.append(
            {
                "ticker": stock["ticker"],
                "quantity": quantity,
                "purchase_price": purchase_price,
                "current_price": current_price,
                "current_value": current_value,
                "profit": profit,
            }
        )
    return enriched


def stock_positions() -> List[Dict[str, Any]]:
    """Return stock entries with calculated value and profit."""
    return _stocks_with_derived_values(get_stocks())


def enrich_stock(stock: Dict[str, Any]) -> Dict[str, Any]:
    """Return a single stock entry with derived values."""
    return _stocks_with_derived_values([stock])[0]


def dashboard_overview() -> Dict[str, Any]:
    """Return the aggregated dashboard payload expected by the frontend."""
    summary = transaction_summary()
    stocks = stock_positions()

    total_stock_value = sum(item["current_value"] for item in stocks)
    total_savings = max(summary["income"] - summary["expenses"], 0.0)
    deficit = summary["income"] - summary["expenses"]

    expense_data = expense_breakdown()
    expense_labels = list(expense_data.keys())
    expense_values = [expense_data[label] for label in expense_labels]

    assets = total_stock_value + total_savings
    liabilities = max(summary["expenses"] - summary["income"], 0.0)

    return {
        "net_worth": round(total_stock_value, 2),
        "total_savings": round(total_savings, 2),
        "total_net_worth": round(total_stock_value + total_savings, 2),
        "deficit": round(deficit, 2),
        "expense_breakdown": {
            "labels": expense_labels,
            "data": [round(value, 2) for value in expense_values],
        },
        "net_worth_breakdown": {
            "labels": ["Assets", "Liabilities"],
            "data": [round(assets, 2), round(liabilities, 2)],
        },
        "stock_data": stocks,
        "available_stocks": [
            {
                "symbol": item["symbol"],
                "name": item["name"],
                "price": float(item["price"]),
            }
            for item in _AVAILABLE_STOCKS
        ],
    }


# Removed seeding - users should start with empty data
# _firebase_seeded = False

def initialize_firebase_data():
    """Initialize Firebase connection - no seeding for production."""
    if not firebase_store.firebase_available:
        return
    
    # Just verify Firebase connection, don't seed any data
    try:
        # Use a dummy user ID for connection test
        firebase_store.get_transactions("connection_test")
    except Exception:
        pass


# Initialize Firebase connection on module import
initialize_firebase_data()