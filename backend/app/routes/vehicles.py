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
