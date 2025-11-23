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

_SEED_INVESTMENTS: List[Dict[str, Any]] = [
    {
        "id": "inv1",
        "type": "property",
        "name": "Downtown Apartment",
        "description": "2BR/2BA apartment in downtown area",
        "purchase_value": 250000.00,
        "current_value": 280000.00,
        "purchase_date": "2023-01-15T00:00:00Z",
        "last_updated": "2025-09-25T00:00:00Z",
        "location": "New York, NY"
    },
    {
        "id": "inv2", 
        "type": "mutual_fund",
        "name": "Vanguard Total Stock Market",
        "description": "Diversified equity fund",
        "purchase_value": 10000.00,
        "current_value": 11500.00,
        "purchase_date": "2024-03-10T00:00:00Z",
        "last_updated": "2025-09-25T00:00:00Z",
        "quantity": 112.5
    }
]

_SEED_SAVINGS_GOALS: List[Dict[str, Any]] = [
    {
        "id": "goal1",
        "name": "Emergency Fund",
        "target_amount": 10000.0,
        "current_amount": 4500.0,
        "deadline": "2025-12-31T00:00:00Z",
        "category": "Emergency",
        "priority": "high",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-09-25T00:00:00Z",
    },
    {
        "id": "goal2",
        "name": "Summer Vacation",
        "target_amount": 5000.0,
        "current_amount": 2200.0,
        "deadline": "2025-07-01T00:00:00Z",
        "category": "Travel",
        "priority": "medium",
        "created_at": "2025-02-01T00:00:00Z",
        "updated_at": "2025-09-20T00:00:00Z",
    },
]


def _next_savings_goal_id() -> str:
    """Generate the next savings goal ID for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return f"goal{len(_SEED_SAVINGS_GOALS) + 1}"

    if firebase_store.firebase_available:
        goals = firebase_store.get_savings_goals(user_id)
        if goals:
            try:
                max_id = max(
                    int(goal.get("id", "goal0")[4:])
                    for goal in goals
                    if isinstance(goal.get("id"), str) and goal.get("id").startswith("goal")
                )
                return f"goal{max_id + 1}"
            except (ValueError, TypeError):
                return f"goal{len(goals) + 1}"
        return "goal1"
    return f"goal{len(_SEED_SAVINGS_GOALS) + 1}"


def get_savings_goals() -> List[Dict[str, Any]]:
    """Return savings goals for the current user."""
    user_id = get_current_user_id()
    if not user_id:
        return []

    if firebase_store.firebase_available:
        goals = firebase_store.get_savings_goals(user_id)
        return goals if goals else []
    return [goal.copy() for goal in _SEED_SAVINGS_GOALS]


def add_savings_goal(goal: Dict[str, Any]) -> Dict[str, Any]:
    """Create a savings goal for current user."""
    user_id = get_current_user_id()
    if not user_id:
        raise ValueError("User must be authenticated to create savings goals")

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

    if firebase_store.firebase_available:
        firebase_store.save_savings_goal(user_id, saved_goal)
    else:
        _SEED_SAVINGS_GOALS.append(saved_goal)
    return saved_goal


def update_savings_goal(goal_id: str, updates: Dict[str, Any]) -> Dict[str, Any] | None:
    """Update an existing savings goal."""
    user_id = get_current_user_id()
    if not user_id:
        raise ValueError("User must be authenticated to update savings goals")

    if firebase_store.firebase_available:
        goals = firebase_store.get_savings_goals(user_id)
        goal = next((g for g in goals if g.get("id") == goal_id), None)
        if not goal:
            return None
        goal.update(updates)
        goal["updated_at"] = datetime.utcnow().isoformat() + "Z"
        firebase_store.save_savings_goal(user_id, goal)
        return goal
    else:
        for idx, goal in enumerate(_SEED_SAVINGS_GOALS):
            if goal["id"] == goal_id:
                _SEED_SAVINGS_GOALS[idx].update(updates)
                _SEED_SAVINGS_GOALS[idx]["updated_at"] = datetime.utcnow().isoformat() + "Z"
                return _SEED_SAVINGS_GOALS[idx]
    return None


def delete_savings_goal(goal_id: str) -> bool:
    """Delete a savings goal for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return False

    if firebase_store.firebase_available:
        return firebase_store.delete_savings_goal(user_id, goal_id)
    else:
        global _SEED_SAVINGS_GOALS
        before = len(_SEED_SAVINGS_GOALS)
        _SEED_SAVINGS_GOALS = [goal for goal in _SEED_SAVINGS_GOALS if goal["id"] != goal_id]
        return len(_SEED_SAVINGS_GOALS) < before


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


def _next_investment_id() -> str:
    """Generate the next investment ID based on existing Firebase data for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return "inv1"
        
    if firebase_store.firebase_available:
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
    else:
        # Fallback for development without Firebase
        return f"inv{len(_SEED_INVESTMENTS) + 1}"


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


def get_investments() -> List[Dict[str, Any]]:
    """Return investments from Firebase for current user or empty list for new users."""
    user_id = get_current_user_id()
    if not user_id:
        return []
        
    if firebase_store.firebase_available:
        investments = firebase_store.get_investments(user_id)
        return investments if investments else []
    else:
        # Fallback to seed data for development only
        return [investment.copy() for investment in _SEED_INVESTMENTS]


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
    if firebase_store.firebase_available:
        return firebase_store.save_investment(user_id, investment)
    else:
        # For development without Firebase, add to seed data
        _SEED_INVESTMENTS.append(investment)
        return investment


def update_investment(
    investment_id: str,
    **updates
) -> Dict[str, Any] | None:
    """Update an investment in Firebase for current user."""
    user_id = get_current_user_id()
    if not user_id:
        raise ValueError("User must be authenticated to update investments")
        
    if firebase_store.firebase_available:
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
    else:
        # For development without Firebase, update seed data
        for i, investment in enumerate(_SEED_INVESTMENTS):
            if investment["id"] == investment_id:
                _SEED_INVESTMENTS[i].update(updates)
                _SEED_INVESTMENTS[i]["last_updated"] = datetime.utcnow().isoformat() + "Z"
                return _SEED_INVESTMENTS[i]
        return None


def delete_investment(investment_id: str) -> bool:
    """Remove an investment from Firebase for current user."""
    user_id = get_current_user_id()
    if not user_id:
        return False
        
    if firebase_store.firebase_available:
        # Delete from Firebase
        return firebase_store.delete_investment(user_id, investment_id)
    else:
        # For development without Firebase, remove from seed data
        global _SEED_INVESTMENTS
        before = len(_SEED_INVESTMENTS)
        _SEED_INVESTMENTS = [inv for inv in _SEED_INVESTMENTS if inv["id"] != investment_id]
        return len(_SEED_INVESTMENTS) < before
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