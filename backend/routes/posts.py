"""Transaction API routes for cash tracking."""
from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify, request

from services.data_store import (
    add_transaction,
    delete_transaction,
    get_transactions,
    transaction_summary,
)

posts_bp = Blueprint("posts", __name__)


@posts_bp.get("/")
def list_transactions():
    """Return all transactions."""
    return jsonify(get_transactions())


@posts_bp.post("/")
def create_transaction():
    """Create a new transaction from JSON payload."""
    data = request.get_json(force=True, silent=True) or {}
    title = data.get("title")
    content = data.get("content", "")
    amount = data.get("amount")
    transaction_type = data.get("type", "expense")
    category = data.get("category", "Other")
    date_value = data.get("date")

    if not title or amount is None:
        return {"error": "title and amount are required"}, 400

    parsed_date = None
    if date_value:
        try:
            parsed_date = datetime.fromisoformat(date_value.replace("Z", "+00:00"))
        except ValueError:
            parsed_date = None

    transaction = add_transaction(
        title=title,
        content=content,
        amount=float(amount),
        transaction_type=transaction_type,
        category=category,
        date=parsed_date,
    )
    return transaction, 201


@posts_bp.delete("/<transaction_id>")
def delete_transaction_route(transaction_id: str):
    """Delete a transaction by its ID."""
    removed = delete_transaction(transaction_id)
    if not removed:
        return {"error": "transaction not found"}, 404
    return {"status": "deleted"}, 200


@posts_bp.get("/summary")
def get_summary():
    """Get financial summary with total income, expenses, and balance."""
    return jsonify(transaction_summary())
