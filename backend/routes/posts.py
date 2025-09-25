"""Posts API routes."""
from __future__ import annotations

from flask import Blueprint, jsonify, request

posts_bp = Blueprint("posts", __name__)

# In-memory store for prototyping. Replace with a real database later.
_POSTS: list[dict[str, str]] = []


@posts_bp.get("/")
def list_posts():
    """Return all posts."""
    return jsonify(_POSTS)


@posts_bp.post("/")
def create_post():
    """Create a new post from JSON payload."""
    data = request.get_json(force=True, silent=True) or {}
    title = data.get("title")
    content = data.get("content")

    if not title or not content:
        return {"error": "title and content are required"}, 400

    post = {"id": str(len(_POSTS) + 1), "title": title, "content": content}
    _POSTS.append(post)
    return post, 201


@posts_bp.delete("/<post_id>")
def delete_post(post_id: str):
    """Delete a post by its ID."""
    global _POSTS
    before = len(_POSTS)
    _POSTS = [post for post in _POSTS if post["id"] != post_id]
    if len(_POSTS) == before:
        return {"error": "post not found"}, 404
    return {"status": "deleted"}, 200
