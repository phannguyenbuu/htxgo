from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token

from .. import db
from ..models import User, Driver


bp = Blueprint("auth", __name__)


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

    token = create_access_token(identity={"id": user.id, "role": user.role})
    return jsonify({"access_token": token, "role": user.role, "user_id": user.id})


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
