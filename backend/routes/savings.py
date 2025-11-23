"""Savings goal routes."""
from __future__ import annotations

from flask import Blueprint, jsonify, request

from services.auth import require_auth
from services.data_store import (
    add_savings_goal,
    delete_savings_goal,
    get_savings_goals,
    update_savings_goal,
)

savings_bp = Blueprint("savings", __name__)


@savings_bp.get("/")
@require_auth
def list_savings_goals():
    """Return all savings goals for current user."""
    return jsonify(get_savings_goals())


@savings_bp.post("/")
@require_auth
def create_savings_goal():
    data = request.get_json(force=True, silent=True) or {}
    required_fields = ["name", "target_amount", "deadline"]
    missing = [field for field in required_fields if field not in data]
    if missing:
        return {"error": f"Missing required fields: {', '.join(missing)}"}, 400

    try:
        goal = add_savings_goal(data)
        return goal, 201
    except (ValueError, KeyError, TypeError) as exc:
        return {"error": str(exc)}, 400


@savings_bp.put("/<goal_id>")
@require_auth
def modify_savings_goal(goal_id: str):
    updates = request.get_json(force=True, silent=True) or {}
    try:
        goal = update_savings_goal(goal_id, updates)
        if goal:
            return goal, 200
        return {"error": "Savings goal not found"}, 404
    except (ValueError, TypeError) as exc:
        return {"error": str(exc)}, 400


@savings_bp.delete("/<goal_id>")
@require_auth
def remove_savings_goal(goal_id: str):
    success = delete_savings_goal(goal_id)
    if success:
        return {"message": "Savings goal deleted"}, 200
    return {"error": "Savings goal not found"}, 404