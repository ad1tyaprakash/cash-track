"""Dashboard aggregate routes."""
from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify, request

from services.data_store import (
    add_stock,
    add_transaction,
    available_stocks,
    dashboard_overview,
    enrich_stock,
)

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/overview")
def get_overview():
    """Return the aggregated dashboard payload."""
    return jsonify(dashboard_overview())


@dashboard_bp.post("/income")
def add_income():
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

    transaction = add_transaction(
        title=str(source),
        amount=abs(float(amount)),
        transaction_type="income",
        category=str(data.get("category") or "Other"),
        content=str(data.get("content") or ""),
        date=parsed_date,
    )
    return transaction, 201


@dashboard_bp.post("/expense")
def add_expense():
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

    transaction = add_transaction(
        title=str(title or category),
        amount=-abs(float(amount)),
        transaction_type="expense",
        category=str(category),
        content=str(data.get("content") or ""),
        date=parsed_date,
    )
    return transaction, 201


@dashboard_bp.post("/stock")
def add_stock_position():
    data = request.get_json(force=True, silent=True) or {}
    ticker = data.get("ticker")
    quantity = data.get("quantity")
    purchase_price = data.get("purchase_price")
    current_price = data.get("current_price")

    if not ticker or quantity is None or purchase_price is None:
        return {"error": "ticker, quantity and purchase_price are required"}, 400

    stock = add_stock(
        ticker=str(ticker),
        quantity=float(quantity),
        purchase_price=float(purchase_price),
        current_price=float(current_price) if current_price is not None else None,
    )
    return enrich_stock(stock), 201


@dashboard_bp.get("/stocks/options")
def get_stock_options():
    return jsonify(list(available_stocks()))