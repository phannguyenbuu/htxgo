from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from .. import db
from ..models import Vehicle
from ..utils import require_admin


bp = Blueprint("vehicles", __name__)


@bp.get("")
@jwt_required()
def list_vehicles():
    vehicles = Vehicle.query.order_by(Vehicle.id.asc()).all()
    return jsonify([
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
            "driver_id": v.driver_id,
        }
        for v in vehicles
    ])


@bp.get("/<int:vehicle_id>")
@jwt_required()
def get_vehicle(vehicle_id):
    v = Vehicle.query.get_or_404(vehicle_id)
    return jsonify({
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
        "driver_id": v.driver_id,
    })


@bp.post("")
@require_admin
def create_vehicle():
    data = request.get_json() or {}
    plate_number = data.get("plate_number")
    unit_id = data.get("unit_id")
    if not plate_number or not unit_id:
        return jsonify({"error": "Missing plate_number or unit_id"}), 400

    vehicle = Vehicle(
        plate_number=plate_number,
        type=data.get("type"),
        capacity=data.get("capacity"),
        owner_name=data.get("owner_name"),
        owner_cccd=data.get("owner_cccd"),
        owner_phone=data.get("owner_phone"),
        owner_address=data.get("owner_address"),
        owner_email=data.get("owner_email"),
        owner_bank_account=data.get("owner_bank_account"),
        unit_id=unit_id,
        driver_id=data.get("driver_id"),
    )
    db.session.add(vehicle)
    db.session.commit()
    return jsonify({"id": vehicle.id}), 201


@bp.put("/<int:vehicle_id>")
@require_admin
def update_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json() or {}
    if "plate_number" in data:
        vehicle.plate_number = data["plate_number"]
    if "type" in data:
        vehicle.type = data["type"]
    if "capacity" in data:
        vehicle.capacity = data["capacity"]
    if "owner_name" in data:
        vehicle.owner_name = data["owner_name"]
    if "owner_cccd" in data:
        vehicle.owner_cccd = data["owner_cccd"]
    if "owner_phone" in data:
        vehicle.owner_phone = data["owner_phone"]
    if "owner_address" in data:
        vehicle.owner_address = data["owner_address"]
    if "owner_email" in data:
        vehicle.owner_email = data["owner_email"]
    if "owner_bank_account" in data:
        vehicle.owner_bank_account = data["owner_bank_account"]
    if "unit_id" in data:
        vehicle.unit_id = data["unit_id"]
    if "driver_id" in data:
        vehicle.driver_id = data["driver_id"]

    db.session.commit()
    return jsonify({"id": vehicle.id})


@bp.delete("/<int:vehicle_id>")
@require_admin
def delete_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({"ok": True})
