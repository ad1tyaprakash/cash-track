"""Dashboard aggregate routes with user authentication."""
from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify, request

from services.auth import require_auth, get_current_user
from services.data_store import (
    add_stock,
    add_transaction,
    available_stocks,
    dashboard_overview,
    delete_stock,
    delete_transaction,
    enrich_stock,
    get_transactions,
)

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/overview")
@require_auth
def get_overview():
    """Return the aggregated dashboard payload for authenticated user."""
    return jsonify(dashboard_overview())


@dashboard_bp.post("/income")
@require_auth
def add_income():
    """Add income transaction for authenticated user."""
    data = request.get_json(force=True, silent=True) or {}
    source = data.get("source") or data.get("title")
    amount = data.get("amount")
    date_value = data.get("date")

    if not source or amount is None:
        return {"error": "source and amount are required"}, 400

    parsed_date = None
    if date_value:
        try:
            parsed_date = datetime.fromisoformat(str(date_value).replace("Z", "+00:00"))
        except ValueError:
            parsed_date = None

    try:
        transaction = add_transaction(
            title=str(source),
            amount=abs(float(amount)),
            transaction_type="income",
            category=str(data.get("category") or "Other"),
            content=str(data.get("content") or ""),
            date=parsed_date,
        )
        return transaction, 201
    except ValueError as e:
        return {"error": str(e)}, 401


@dashboard_bp.post("/expense")
@require_auth
def add_expense():
    """Add expense transaction for authenticated user."""
    data = request.get_json(force=True, silent=True) or {}
    category = data.get("category")
    amount = data.get("amount")
    title = data.get("title") or data.get("source") or category
    date_value = data.get("date")

    if not category or amount is None:
        return {"error": "category and amount are required"}, 400

    parsed_date = None
    if date_value:
        try:
            parsed_date = datetime.fromisoformat(str(date_value).replace("Z", "+00:00"))
        except ValueError:
            parsed_date = None

    try:
        transaction = add_transaction(
            title=str(title or category),
            amount=-abs(float(amount)),
            transaction_type="expense",
            category=str(category),
            content=str(data.get("content") or ""),
            date=parsed_date,
        )
        return transaction, 201
    except ValueError as e:
        return {"error": str(e)}, 401


@dashboard_bp.post("/stock")
@require_auth
def add_stock_position():
    """Add stock position for authenticated user."""
    data = request.get_json(force=True, silent=True) or {}
    ticker = data.get("ticker")
    quantity = data.get("quantity")
    purchase_price = data.get("purchase_price")
    current_price = data.get("current_price")

    if not ticker or quantity is None or purchase_price is None:
        return {"error": "ticker, quantity and purchase_price are required"}, 400

    try:
        stock = add_stock(
            ticker=str(ticker),
            quantity=float(quantity),
            purchase_price=float(purchase_price),
            current_price=float(current_price) if current_price is not None else None,
        )
        return enrich_stock(stock), 201
    except ValueError as e:
        return {"error": str(e)}, 401


@dashboard_bp.get("/stocks/options")
def get_stock_options():
    """Get available stock options (public data, no auth needed)."""
    return jsonify(list(available_stocks()))


@dashboard_bp.get("/transactions")
@require_auth
def get_transactions_endpoint():
    """Get all transactions for authenticated user."""
    return jsonify(get_transactions())


@dashboard_bp.delete("/transaction/<transaction_id>")
@require_auth
def delete_transaction_endpoint(transaction_id):
    """Delete a transaction by ID for authenticated user."""
    success = delete_transaction(transaction_id)
    if success:
        return {"message": "Transaction deleted successfully"}, 200
    else:
        return {"error": "Transaction not found"}, 404


@dashboard_bp.delete("/stock/<ticker>")
@require_auth
def delete_stock_endpoint(ticker):
    """Delete a stock position by ticker for authenticated user."""
    success = delete_stock(ticker.upper())
    if success:
        return {"message": "Stock position deleted successfully"}, 200
    else:
        return {"error": "Stock position not found"}, 404