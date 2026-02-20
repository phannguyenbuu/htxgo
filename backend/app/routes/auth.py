from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)

from .. import db
from ..models import Driver, User


bp = Blueprint("auth", __name__)


def _build_user_claims(user: User) -> dict:
    return {"role": user.role, "user_id": user.id}


@bp.post("/login")
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    claims = _build_user_claims(user)
    access_token = create_access_token(identity=str(user.id), additional_claims=claims)
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims=claims)
    return jsonify(
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "role": user.role,
            "user_id": user.id,
        }
    )


@bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    token_claims = get_jwt()
    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid token subject"}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    claims = {
        "role": token_claims.get("role") or user.role,
        "user_id": token_claims.get("user_id") or user.id,
    }
    access_token = create_access_token(identity=str(user.id), additional_claims=claims)
    refresh_token = create_refresh_token(identity=str(user.id), additional_claims=claims)
    return jsonify({"access_token": access_token, "refresh_token": refresh_token})


@bp.post("/register-driver")
def register_driver_user():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")
    driver_id = data.get("driver_id")

    if not username or not password or not driver_id:
        return jsonify({"error": "Missing username, password, or driver_id"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username exists"}), 409

    driver = Driver.query.get(driver_id)
    if not driver:
        return jsonify({"error": "Driver not found"}), 404

    user = User(username=username, role="driver", driver_id=driver_id)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"id": user.id, "username": user.username, "role": user.role}), 201


@bp.post("/register-admin")
def register_admin():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username exists"}), 409

    user = User(username=username, role="admin")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"id": user.id, "username": user.username, "role": user.role}), 201
