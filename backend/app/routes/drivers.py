from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from .. import db
from ..models import Driver
from ..utils import require_admin


bp = Blueprint("drivers", __name__)


@bp.get("")
@jwt_required()
def list_drivers():
    drivers = Driver.query.order_by(Driver.id.asc()).all()
    return jsonify([
        {
            "id": d.id,
            "full_name": d.full_name,
            "phone": d.phone,
            "license_number": d.license_number,
            "unit_id": d.unit_id,
        }
        for d in drivers
    ])


@bp.get("/<int:driver_id>")
@jwt_required()
def get_driver(driver_id):
    d = Driver.query.get_or_404(driver_id)
    return jsonify({
        "id": d.id,
        "full_name": d.full_name,
        "phone": d.phone,
        "license_number": d.license_number,
        "unit_id": d.unit_id,
    })


@bp.post("")
@require_admin
def create_driver():
    data = request.get_json() or {}
    full_name = data.get("full_name")
    unit_id = data.get("unit_id")
    if not full_name or not unit_id:
        return jsonify({"error": "Missing full_name or unit_id"}), 400

    driver = Driver(
        full_name=full_name,
        phone=data.get("phone"),
        license_number=data.get("license_number"),
        unit_id=unit_id,
    )
    db.session.add(driver)
    db.session.commit()
    return jsonify({"id": driver.id}), 201


@bp.put("/<int:driver_id>")
@require_admin
def update_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    data = request.get_json() or {}
    if "full_name" in data:
        driver.full_name = data["full_name"]
    if "phone" in data:
        driver.phone = data["phone"]
    if "license_number" in data:
        driver.license_number = data["license_number"]
    if "unit_id" in data:
        driver.unit_id = data["unit_id"]

    db.session.commit()
    return jsonify({"id": driver.id})


@bp.delete("/<int:driver_id>")
@require_admin
def delete_driver(driver_id):
    driver = Driver.query.get_or_404(driver_id)
    db.session.delete(driver)
    db.session.commit()
    return jsonify({"ok": True})
