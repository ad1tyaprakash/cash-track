"""Firebase Realtime Database data store for the cash-track backend with user isolation."""
from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Any, Dict, Iterable, List, Tuple
from services.firebase_db import get_firebase_store
from services.auth import get_current_user_id

# Get Firebase store instance
firebase_store = get_firebase_store()

_AVAILABLE_STOCKS: Tuple[Dict[str, Any], ...] = (
    {"symbol": "AAPL", "name": "Apple Inc.", "price": 191.32},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "price": 415.12},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 165.76},
    {"symbol": "AMZN", "name": "Amazon.com, Inc.", "price": 180.45},
    {"symbol": "TSLA", "name": "Tesla, Inc.", "price": 245.93},
)


def _next_savings_goal_id() -> str:
    """Generate the next savings goal ID for current user."""
    user_id = get_current_user_id()
    if not user_id or not firebase_store.firebase_available:
        return "goal1"

    goals = firebase_store.get_savings_goals(user_id) or []
    goal_numbers: List[int] = []
    for goal in goals:
        goal_id = goal.get("id")
        if isinstance(goal_id, str) and goal_id.startswith("goal"):
            suffix = goal_id[4:]
            if suffix.isdigit():
                goal_numbers.append(int(suffix))

    if goal_numbers:
        return f"goal{max(goal_numbers) + 1}"

    return "goal1"


def get_savings_goals() -> List[Dict[str, Any]]:
    """Return savings goals for the current user."""
    user_id = get_current_user_id()
    if not user_id:
        return []

    if not firebase_store.firebase_available:
        return []

    goals = firebase_store.get_savings_goals(user_id)
    return goals if goals else []


def add_savings_goal(goal: Dict[str, Any]) -> Dict[str, Any]:
    """Create a savings goal for current user."""
    user_id = get_current_user_id()
    if not user_id:
        raise ValueError("User must be authenticated to create savings goals")
    if not firebase_store.firebase_available:
        raise RuntimeError("Firebase store is not available")

    saved_goal = {
        "id": _next_savings_goal_id(),
        "name": goal["name"],
        "target_amount": float(goal["target_amount"]),
        "current_amount": float(goal.get("current_amount", 0.0)),
        "deadline": goal["deadline"],
        "category": goal.get("category", "Other"),
        "priority": goal.get("priority", "medium"),
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }

    firebase_store.save_savings_goal(user_id, saved_goal)
    return saved_goal


def update_savings_goal(goal_id: str, updates: Dict[str, Any]) -> Dict[str, Any] | None:
    """Update an existing savings goal."""
    user_id = get_current_user_id()
    if not user_id:
        raise ValueError("User must be authenticated to update savings goals")
    if not firebase_store.firebase_available:
        raise RuntimeError("Firebase store is not available")

    goals = firebase_store.get_savings_goals(user_id)
    goal = next((g for g in goals if g.get("id") == goal_id), None)
    if not goal:
        return None
    goal.update(updates)
    goal["updated_at"] = datetime.utcnow().isoformat() + "Z"
    firebase_store.save_savings_goal(user_id, goal)
    return goal


def delete_savings_goal(goal_id: str) -> bool:
    """Delete a savings goal for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return False
    if not firebase_store.firebase_available:
        raise RuntimeError("Firebase store is not available")

    return firebase_store.delete_savings_goal(user_id, goal_id)


def _next_transaction_id() -> str:
    """Generate the next transaction ID based on existing Firebase data for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return "1"
        
    if not firebase_store.firebase_available:
        return "1"

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


def _next_investment_id() -> str:
    """Generate the next investment ID based on existing Firebase data for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return "inv1"
        
    if not firebase_store.firebase_available:
        return "inv1"

    investments = firebase_store.get_investments(user_id)
    if investments:
        # Get the highest numeric ID and increment
        try:
            max_id = max(int(inv.get("id", "inv0")[3:]) for inv in investments if inv.get("id", "").startswith("inv"))
            return f"inv{max_id + 1}"
        except (ValueError, TypeError):
            # If there's an issue with ID parsing, use length + 1
            return f"inv{len(investments) + 1}"
    # No investments exist, start with inv1
    return "inv1"


def get_transactions() -> List[Dict[str, Any]]:
    """Return transactions from Firebase for current user or empty list for new users."""
    user_id = get_current_user_id()
    if not user_id:
        return []
        
    if not firebase_store.firebase_available:
        return []

    transactions = firebase_store.get_transactions(user_id)
    return transactions if transactions else []


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
    if not firebase_store.firebase_available:
        raise RuntimeError("Firebase store is not available")

    return firebase_store.save_transaction(user_id, transaction)


def delete_transaction(transaction_id: str) -> bool:
    """Remove a transaction from Firebase for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return False
        
    if not firebase_store.firebase_available:
        raise RuntimeError("Firebase store is not available")

    # Delete from Firebase
    return firebase_store.delete_transaction(user_id, transaction_id)


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


def get_investments() -> List[Dict[str, Any]]:
    """Return investments from Firebase for current user or empty list for new users."""
    user_id = get_current_user_id()
    if not user_id:
        return []
        
    if not firebase_store.firebase_available:
        return []

    investments = firebase_store.get_investments(user_id)
    return investments if investments else []


def add_investment(
    investment_type: str,
    name: str,
    purchase_value: float,
    current_value: float,
    purchase_date: datetime,
    description: str = "",
    quantity: float | None = None,
    location: str = "",
    custom_type: str = ""
) -> Dict[str, Any]:
    """Add an investment to Firebase for current user."""
    user_id = get_current_user_id()
    if not user_id:
        raise ValueError("User must be authenticated to add investments")
        
    investment = {
        "id": _next_investment_id(),
        "type": investment_type,
        "name": name,
        "description": description,
        "purchase_value": float(purchase_value),
        "current_value": float(current_value),
        "purchase_date": purchase_date.isoformat() + "Z",
        "last_updated": datetime.utcnow().isoformat() + "Z",
    }
    
    # Add optional fields if provided
    if quantity is not None:
        investment["quantity"] = float(quantity)
    if location:
        investment["location"] = location
    if custom_type:
        investment["custom_type"] = custom_type
    
    # Save to Firebase
    if not firebase_store.firebase_available:
        raise RuntimeError("Firebase store is not available")

    return firebase_store.save_investment(user_id, investment)


def update_investment(
    investment_id: str,
    **updates
) -> Dict[str, Any] | None:
    """Update an investment in Firebase for current user."""
    user_id = get_current_user_id()
    if not user_id:
        raise ValueError("User must be authenticated to update investments")
        
    if not firebase_store.firebase_available:
        raise RuntimeError("Firebase store is not available")

    # Get current investment
    investments = firebase_store.get_investments(user_id)
    investment = next((inv for inv in investments if inv.get("id") == investment_id), None)
    if not investment:
        return None
        
    # Update fields
    investment.update(updates)
    investment["last_updated"] = datetime.utcnow().isoformat() + "Z"
    
    # Save back to Firebase
    return firebase_store.save_investment(user_id, investment)


def delete_investment(investment_id: str) -> bool:
    """Remove an investment from Firebase for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return False
        
    if not firebase_store.firebase_available:
        raise RuntimeError("Firebase store is not available")

    # Delete from Firebase
    return firebase_store.delete_investment(user_id, investment_id)



def get_stocks() -> List[Dict[str, Any]]:
    """Return stocks from Firebase for current user or empty list for new users."""
    user_id = get_current_user_id()
    if not user_id:
        return []
        
    if not firebase_store.firebase_available:
        return []

    stocks = firebase_store.get_stocks(user_id)
    return stocks if stocks else []


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
    
    # Save to Firebase
    if not firebase_store.firebase_available:
        raise RuntimeError("Firebase store is not available")

    firebase_store.save_stock(user_id, stock)
    return stock.copy()


def delete_stock(ticker: str) -> bool:
    """Remove a stock position from Firebase for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return False
        
    if not firebase_store.firebase_available:
        raise RuntimeError("Firebase store is not available")

    # Delete from Firebase
    return firebase_store.delete_stock(user_id, ticker)


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
    investments = get_investments()
    savings_goals = get_savings_goals()

    for goal in savings_goals:
        target = float(goal.get("target_amount", 0))
        current = float(goal.get("current_amount", 0))
        goal["progress"] = round((current / target) * 100, 2) if target > 0 else 0.0
        goal["remaining_amount"] = max(target - current, 0.0)

    total_stock_value = sum(item["current_value"] for item in stocks)
    total_investment_value = sum(item["current_value"] for item in investments)
    total_savings = max(summary["income"] - summary["expenses"], 0.0)
    deficit = summary["income"] - summary["expenses"]

    expense_data = expense_breakdown()
    expense_labels = list(expense_data.keys())
    expense_values = [expense_data[label] for label in expense_labels]

    assets = total_stock_value + total_investment_value + total_savings
    liabilities = max(summary["expenses"] - summary["income"], 0.0)

    return {
        "net_worth": round(total_stock_value + total_investment_value, 2),
        "total_savings": round(total_savings, 2),
        "total_net_worth": round(total_stock_value + total_investment_value + total_savings, 2),
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
        "investment_data": investments,
        "savings_goals": savings_goals,
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