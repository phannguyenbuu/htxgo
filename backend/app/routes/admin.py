from datetime import datetime

from flask import Blueprint, current_app, jsonify, redirect, render_template, request, session, url_for
from flask_jwt_extended import create_access_token, create_refresh_token, decode_token
from requests import RequestException
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError

from .. import db
from ..models import Document, Driver, DriverGroup, Notification, Unit, User, Vehicle
from ..services.fines_lookup import lookup_fines


api_bp = Blueprint("admin_api", __name__)
ui_bp = Blueprint("admin_ui", __name__)


LOGIN_SESSION_KEY = "admin_token"
REFRESH_SESSION_KEY = "admin_refresh_token"


def _admin_claims_from_token(token):
    if not token:
        return None
    try:
        payload = decode_token(token)
    except Exception:
        return None

    role = payload.get("role")
    if role != "admin":
        return None
    return {
        "id": payload.get("user_id"),
        "role": role,
        "sub": payload.get("sub"),
    }


def _serialize_units(units):
    return [
        {
            "id": u.id,
            "name": u.name,
            "is_virtual": u.is_virtual,
            "driver_count": len(u.drivers),
            "vehicle_count": len(u.vehicles),
        }
        for u in units
    ]


def _serialize_drivers(drivers):
    group_map = {g.id: g.name for g in DriverGroup.query.all()}
    return [
        {
            "id": d.id,
            "full_name": d.full_name,
            "phone": d.phone,
            "license_number": d.license_number,
            "cccd": d.cccd,
            "address": d.address,
            "email": d.email,
            "bank_account": d.bank_account,
            "group_id": d.group_id,
            "group_name": group_map.get(d.group_id),
            "unit_id": d.unit_id,
            "unit_name": d.unit.name if d.unit else None,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "user": d.user.username if d.user else None,
        }
        for d in drivers
    ]


def _serialize_vehicles(vehicles):
    return [
        {
            "id": v.id,
            "plate_number": v.plate_number,
            "type": v.type,
            "capacity": v.capacity,
            "owner_name": v.owner_name,
            "owner_cccd": v.owner_cccd,
            "owner_phone": v.owner_phone,
            "owner_address": v.owner_address,
            "owner_email": v.owner_email,
            "owner_bank_account": v.owner_bank_account,
            "unit_id": v.unit_id,
            "unit_name": v.unit.name if v.unit else None,
            "driver_id": v.driver_id,
            "driver_name": v.driver.full_name if v.driver else None,
            "created_at": v.created_at.isoformat() if v.created_at else None,
        }
        for v in vehicles
    ]


def _serialize_documents(documents):
    return [
        {
            "id": d.id,
            "title": d.title,
            "doc_type": d.doc_type,
            "number": d.number,
            "issued_date": d.issued_date.isoformat() if d.issued_date else None,
            "expiry_date": d.expiry_date.isoformat() if d.expiry_date else None,
            "driver_id": d.driver_id,
            "driver_name": d.driver.full_name if d.driver else None,
            "vehicle_id": d.vehicle_id,
            "vehicle_plate": d.vehicle.plate_number if d.vehicle else None,
            "image_count": len(d.images),
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in documents
    ]


def _serialize_groups(groups):
    return [
        {
            "id": g.id,
            "name": g.name,
            "description": g.description,
            "driver_count": Driver.query.filter_by(group_id=g.id).count(),
            "created_at": g.created_at.isoformat() if g.created_at else None,
        }
        for g in groups
    ]


def _serialize_users(users):
    return [
        {
            "id": u.id,
            "username": u.username,
            "role": u.role,
            "driver_id": u.driver_id,
            "driver_name": u.driver.full_name if u.driver else None,
            "auth_provider": u.auth_provider,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


def _serialize_notifications(notifications):
    group_map = {g.id: g.name for g in DriverGroup.query.all()}
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "target_type": n.target_type,
            "unit_id": n.unit_id,
            "unit_name": n.unit.name if n.unit else None,
            "driver_id": n.driver_id,
            "driver_name": n.driver.full_name if n.driver else None,
            "driver_group_id": n.driver_group_id,
            "driver_group_name": group_map.get(n.driver_group_id),
            "created_by_user_id": n.created_by_user_id,
            "created_by_username": n.created_by_user.username if n.created_by_user else None,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]


def _admin_identity_from_session():
    token = session.get(LOGIN_SESSION_KEY)
    claims = _admin_claims_from_token(token)
    if claims is not None:
        return claims

    refresh_token = session.get(REFRESH_SESSION_KEY)
    refresh_claims = _admin_claims_from_token(refresh_token)
    if refresh_claims is None:
        return None

    user_id = refresh_claims.get("id")
    sub = refresh_claims.get("sub")
    if not user_id or not sub:
        return None

    new_access_token = create_access_token(
        identity=str(sub),
        additional_claims={"role": "admin", "user_id": user_id},
    )
    new_refresh_token = create_refresh_token(
        identity=str(sub),
        additional_claims={"role": "admin", "user_id": user_id},
    )

    session[LOGIN_SESSION_KEY] = new_access_token
    session[REFRESH_SESSION_KEY] = new_refresh_token
    return _admin_claims_from_token(new_access_token)


def _extract_admin_claims_from_bearer():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.removeprefix("Bearer ").strip()
    if not token:
        return None

    return _admin_claims_from_token(token)


def _require_admin_api():
    claims = _extract_admin_claims_from_bearer()
    if claims is None:
        return None, (jsonify({"error": "Admin token required"}), 401)
    return claims, None


def _parse_int(value):
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _safe_list_notifications():
    try:
        return Notification.query.order_by(Notification.created_at.desc()).all()
    except SQLAlchemyError:
        db.session.rollback()
        return []


@api_bp.get("/overview")
def admin_overview():
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    role_rows = User.query.with_entities(User.role, func.count(User.id)).group_by(User.role).all()

    return jsonify(
        {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "totals": {
                "users": User.query.count(),
                "drivers": Driver.query.count(),
                "vehicles": Vehicle.query.count(),
                "documents": Document.query.count(),
                "units": Unit.query.count(),
            },
            "users_by_role": {role: count for role, count in role_rows},
            "latest": {
                "drivers": _serialize_drivers(
                    Driver.query.order_by(Driver.created_at.desc()).limit(5).all()
                ),
                "vehicles": _serialize_vehicles(
                    Vehicle.query.order_by(Vehicle.created_at.desc()).limit(5).all()
                ),
                "documents": _serialize_documents(
                    Document.query.order_by(Document.created_at.desc()).limit(5).all()
                ),
            },
        }
    )


@api_bp.get("/dataset")
def admin_dataset():
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    units = Unit.query.order_by(Unit.id.asc()).all()
    drivers = Driver.query.order_by(Driver.id.asc()).all()
    vehicles = Vehicle.query.order_by(Vehicle.id.asc()).all()
    documents = Document.query.order_by(Document.id.asc()).all()
    users = User.query.order_by(User.id.asc()).all()
    groups = DriverGroup.query.order_by(DriverGroup.id.asc()).all()

    notifications = _safe_list_notifications()

    return jsonify(
        {
            "units": _serialize_units(units),
            "drivers": _serialize_drivers(drivers),
            "vehicles": _serialize_vehicles(vehicles),
            "documents": _serialize_documents(documents),
            "users": _serialize_users(users),
            "groups": _serialize_groups(groups),
            "notifications": _serialize_notifications(notifications),
        }
    )


@api_bp.get("/fines/lookup")
def admin_fines_lookup():
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    license_plate = (request.args.get("licensePlate") or "").strip().upper()
    if not license_plate:
        return jsonify({"error": "licensePlate is required"}), 400

    try:
        result = lookup_fines(license_plate)
        return jsonify(
            {
                "licensePlate": result.license_plate,
                "violations": result.violations,
            }
        )
    except RequestException:
        return jsonify({"error": "Không kết nối được trang tra cứu CSGT"}), 502
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api_bp.get("/notifications")
def list_notifications():
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    notifications = _safe_list_notifications()
    return jsonify(_serialize_notifications(notifications))


@api_bp.post("/notifications")
def create_notification():
    claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    message = (data.get("message") or "").strip()
    target_type = (data.get("target_type") or "all").strip().lower()
    unit_id = _parse_int(data.get("unit_id"))
    driver_id = _parse_int(data.get("driver_id"))
    driver_group_id = _parse_int(data.get("driver_group_id"))

    if not title or not message:
        return jsonify({"error": "Missing title or message"}), 400
    if target_type not in {"all", "htx", "group", "driver"}:
        return jsonify({"error": "Invalid target_type"}), 400

    if target_type == "htx":
        if not unit_id or not Unit.query.get(unit_id):
            return jsonify({"error": "Unit not found"}), 404
        driver_id = None
        driver_group_id = None
    elif target_type == "group":
        if not driver_group_id or not DriverGroup.query.get(driver_group_id):
            return jsonify({"error": "Driver group not found"}), 404
        unit_id = None
        driver_id = None
    elif target_type == "driver":
        if not driver_id or not Driver.query.get(driver_id):
            return jsonify({"error": "Driver not found"}), 404
        unit_id = None
        driver_group_id = None
    else:
        unit_id = None
        driver_id = None
        driver_group_id = None

    notification = Notification(
        title=title,
        message=message,
        target_type=target_type,
        unit_id=unit_id,
        driver_id=driver_id,
        driver_group_id=driver_group_id,
        created_by_user_id=(claims or {}).get("id"),
    )
    try:
        db.session.add(notification)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Notifications table is not ready"}), 503
    return jsonify({"id": notification.id}), 201


@api_bp.delete("/notifications/<int:notification_id>")
def delete_notification(notification_id):
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    try:
        notification = Notification.query.get_or_404(notification_id)
        db.session.delete(notification)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Notifications table is not ready"}), 503
    return jsonify({"ok": True})


@api_bp.post("/groups")
def create_group():
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    if not name:
        return jsonify({"error": "Missing name"}), 400
    if DriverGroup.query.filter_by(name=name).first():
        return jsonify({"error": "Group name exists"}), 409

    group = DriverGroup(name=name, description=description or None)
    db.session.add(group)
    db.session.commit()
    return jsonify({"id": group.id}), 201


@api_bp.put("/groups/<int:group_id>")
def update_group(group_id):
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    group = DriverGroup.query.get_or_404(group_id)
    data = request.get_json() or {}
    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "Name cannot be empty"}), 400
        exists = DriverGroup.query.filter(DriverGroup.name == name, DriverGroup.id != group.id).first()
        if exists:
            return jsonify({"error": "Group name exists"}), 409
        group.name = name
    if "description" in data:
        group.description = (data.get("description") or "").strip() or None

    db.session.commit()
    return jsonify({"id": group.id})


@api_bp.delete("/groups/<int:group_id>")
def delete_group(group_id):
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    group = DriverGroup.query.get_or_404(group_id)
    Driver.query.filter_by(group_id=group.id).update({"group_id": None})
    db.session.delete(group)
    db.session.commit()
    return jsonify({"ok": True})


@api_bp.post("/users")
def create_user():
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    role = (data.get("role") or "driver").strip()
    driver_id = _parse_int(data.get("driver_id"))

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400
    if role not in {"admin", "driver"}:
        return jsonify({"error": "Invalid role"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username exists"}), 409
    if driver_id and not Driver.query.get(driver_id):
        return jsonify({"error": "Driver not found"}), 404

    user = User(username=username, role=role, driver_id=driver_id)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id}), 201


@api_bp.put("/users/<int:user_id>")
def update_user(user_id):
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    if "username" in data:
        username = (data.get("username") or "").strip()
        if not username:
            return jsonify({"error": "Username cannot be empty"}), 400
        exists = User.query.filter(User.username == username, User.id != user.id).first()
        if exists:
            return jsonify({"error": "Username exists"}), 409
        user.username = username

    if "role" in data:
        role = (data.get("role") or "").strip()
        if role not in {"admin", "driver"}:
            return jsonify({"error": "Invalid role"}), 400
        user.role = role

    if "driver_id" in data:
        driver_id = _parse_int(data.get("driver_id"))
        if driver_id and not Driver.query.get(driver_id):
            return jsonify({"error": "Driver not found"}), 404
        user.driver_id = driver_id

    if "password" in data and data.get("password"):
        user.set_password(data.get("password"))

    db.session.commit()
    return jsonify({"id": user.id})


@api_bp.delete("/users/<int:user_id>")
def delete_user(user_id):
    _claims, error_response = _require_admin_api()
    if error_response:
        return error_response

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"ok": True})


@ui_bp.route("/login", methods=["GET", "POST"])
def admin_login():
    if request.method == "GET":
        if _admin_identity_from_session() is not None:
            return redirect(url_for("admin_ui.admin_dashboard"))
        return render_template("admin/login.html")

    username = (request.form.get("username") or "").strip()
    password = request.form.get("password") or ""

    user = User.query.filter_by(username=username).first()
    if not user or user.role != "admin" or not user.check_password(password):
        return render_template("admin/login.html", error="Sai tài khoản hoặc mật khẩu"), 401

    claims = {"role": user.role, "user_id": user.id}
    token = create_access_token(
        identity=str(user.id),
        additional_claims=claims,
    )
    refresh_token = create_refresh_token(
        identity=str(user.id),
        additional_claims=claims,
    )

    session.permanent = True
    session[LOGIN_SESSION_KEY] = token
    session[REFRESH_SESSION_KEY] = refresh_token
    session["admin_username"] = user.username

    return redirect(url_for("admin_ui.admin_dashboard"))


@ui_bp.get("/logout")
def admin_logout():
    session.pop(LOGIN_SESSION_KEY, None)
    session.pop(REFRESH_SESSION_KEY, None)
    session.pop("admin_username", None)
    return redirect(url_for("admin_ui.admin_login"))


@ui_bp.get("")
def admin_dashboard():
    claims = _admin_identity_from_session()
    if claims is None:
        return redirect(url_for("admin_ui.admin_login"))

    token = session.get(LOGIN_SESSION_KEY)
    api_base = current_app.config.get("ADMIN_API_BASE") or f"{request.host_url.rstrip('/')}/api"
    return render_template(
        "admin/dashboard.html",
        jwt_token=token,
        admin_api_base=api_base,
        admin_username=session.get("admin_username", "admin"),
    )


@ui_bp.get("/token")
def admin_token():
    claims = _admin_identity_from_session()
    if claims is None:
        return jsonify({"error": "Session expired"}), 401
    return jsonify({"token": session.get(LOGIN_SESSION_KEY)})
