from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from .. import db
from ..models import Document
from ..utils import require_admin


bp = Blueprint("documents", __name__)


def parse_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


@bp.get("")
@jwt_required()
def list_documents():
    documents = Document.query.order_by(Document.id.asc()).all()
    return jsonify([
        {
            "id": d.id,
            "title": d.title,
            "doc_type": d.doc_type,
            "number": d.number,
            "issued_date": d.issued_date.isoformat() if d.issued_date else None,
            "expiry_date": d.expiry_date.isoformat() if d.expiry_date else None,
            "driver_id": d.driver_id,
            "vehicle_id": d.vehicle_id,
        }
        for d in documents
    ])


@bp.get("/<int:doc_id>")
@jwt_required()
def get_document(doc_id):
    d = Document.query.get_or_404(doc_id)
    return jsonify({
        "id": d.id,
        "title": d.title,
        "doc_type": d.doc_type,
        "number": d.number,
        "issued_date": d.issued_date.isoformat() if d.issued_date else None,
        "expiry_date": d.expiry_date.isoformat() if d.expiry_date else None,
        "driver_id": d.driver_id,
        "vehicle_id": d.vehicle_id,
    })


@bp.post("")
@require_admin
def create_document():
    data = request.get_json() or {}
    title = data.get("title")
    if not title:
        return jsonify({"error": "Missing title"}), 400

    document = Document(
        title=title,
        doc_type=data.get("doc_type"),
        number=data.get("number"),
        issued_date=parse_date(data.get("issued_date")),
        expiry_date=parse_date(data.get("expiry_date")),
        driver_id=data.get("driver_id"),
        vehicle_id=data.get("vehicle_id"),
    )
    db.session.add(document)
    db.session.commit()
    return jsonify({"id": document.id}), 201


@bp.put("/<int:doc_id>")
@require_admin
def update_document(doc_id):
    document = Document.query.get_or_404(doc_id)
    data = request.get_json() or {}
    if "title" in data:
        document.title = data["title"]
    if "doc_type" in data:
        document.doc_type = data["doc_type"]
    if "number" in data:
        document.number = data["number"]
    if "issued_date" in data:
        document.issued_date = parse_date(data.get("issued_date"))
    if "expiry_date" in data:
        document.expiry_date = parse_date(data.get("expiry_date"))
    if "driver_id" in data:
        document.driver_id = data.get("driver_id")
    if "vehicle_id" in data:
        document.vehicle_id = data.get("vehicle_id")

    db.session.commit()
    return jsonify({"id": document.id})


@bp.delete("/<int:doc_id>")
@require_admin
def delete_document(doc_id):
    document = Document.query.get_or_404(doc_id)
    db.session.delete(document)
    db.session.commit()
    return jsonify({"ok": True})
