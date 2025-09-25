"""Transaction API routes for cash tracking."""
from __future__ import annotations

from datetime import datetime
from flask import Blueprint, jsonify, request
from typing import Dict, Any

posts_bp = Blueprint("posts", __name__)

# In-memory store for prototyping. Replace with a real database later.
_TRANSACTIONS: list[Dict[str, Any]] = [
    {
        "id": "1",
        "title": "Grocery Shopping",
        "content": "Weekly groceries at Whole Foods",
        "amount": -85.50,
        "type": "expense",
        "category": "Food",
        "date": "2025-09-25T10:30:00Z"
    },
    {
        "id": "2", 
        "title": "Freelance Payment",
        "content": "Payment from client for web design project",
        "amount": 500.00,
        "type": "income",
        "category": "Work",
        "date": "2025-09-24T14:20:00Z"
    },
    {
        "id": "3",
        "title": "Gas Station",
        "content": "Fuel for car",
        "amount": -45.25,
        "type": "expense", 
        "category": "Transportation",
        "date": "2025-09-23T08:15:00Z"
    }
]


@posts_bp.get("/")
def list_transactions():
    """Return all transactions."""
    return jsonify(_TRANSACTIONS)


@posts_bp.post("/")
def create_transaction():
    """Create a new transaction from JSON payload."""
    data = request.get_json(force=True, silent=True) or {}
    title = data.get("title")
    content = data.get("content", "")
    amount = data.get("amount")
    transaction_type = data.get("type", "expense")
    category = data.get("category", "Other")

    if not title or amount is None:
        return {"error": "title and amount are required"}, 400

    transaction = {
        "id": str(len(_TRANSACTIONS) + 1),
        "title": title,
        "content": content,
        "amount": float(amount),
        "type": transaction_type,
        "category": category,
        "date": datetime.now().isoformat() + "Z"
    }
    _TRANSACTIONS.append(transaction)
    return transaction, 201


@posts_bp.delete("/<transaction_id>")
def delete_transaction(transaction_id: str):
    """Delete a transaction by its ID."""
    global _TRANSACTIONS
    before = len(_TRANSACTIONS)
    _TRANSACTIONS = [t for t in _TRANSACTIONS if t["id"] != transaction_id]
    if len(_TRANSACTIONS) == before:
        return {"error": "transaction not found"}, 404
    return {"status": "deleted"}, 200


@posts_bp.get("/summary")
def get_summary():
    """Get financial summary with total income, expenses, and balance."""
    income = sum(t["amount"] for t in _TRANSACTIONS if t["type"] == "income")
    expenses = sum(abs(t["amount"]) for t in _TRANSACTIONS if t["type"] == "expense")
    balance = income - expenses
    
    return jsonify({
        "income": income,
        "expenses": expenses,
        "balance": balance,
        "transaction_count": len(_TRANSACTIONS)
    })
