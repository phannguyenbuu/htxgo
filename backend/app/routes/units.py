from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from .. import db
from ..models import Unit
from ..utils import require_admin


bp = Blueprint("units", __name__)


@bp.get("")
@jwt_required()
def list_units():
    units = Unit.query.order_by(Unit.id.asc()).all()
    return jsonify([{"id": u.id, "name": u.name, "is_virtual": u.is_virtual} for u in units])


@bp.post("")
@require_admin
def create_unit():
    data = request.get_json() or {}
    name = data.get("name")
    is_virtual = bool(data.get("is_virtual", False))
    if not name:
        return jsonify({"error": "Missing name"}), 400

    unit = Unit(name=name, is_virtual=is_virtual)
    db.session.add(unit)
    db.session.commit()
    return jsonify({"id": unit.id, "name": unit.name, "is_virtual": unit.is_virtual}), 201


@bp.put("/<int:unit_id>")
@require_admin
def update_unit(unit_id):
    unit = Unit.query.get_or_404(unit_id)
    data = request.get_json() or {}
    if "name" in data:
        unit.name = data["name"]
    if "is_virtual" in data:
        unit.is_virtual = bool(data["is_virtual"])

    db.session.commit()
    return jsonify({"id": unit.id, "name": unit.name, "is_virtual": unit.is_virtual})


@bp.delete("/<int:unit_id>")
@require_admin
def delete_unit(unit_id):
    unit = Unit.query.get_or_404(unit_id)
    db.session.delete(unit)
    db.session.commit()
    return jsonify({"ok": True})
