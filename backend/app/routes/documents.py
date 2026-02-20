from datetime import datetime
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request, send_file
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from .. import db
from ..models import Document, DocumentImage
from ..utils import require_admin


bp = Blueprint("documents", __name__)


def parse_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def _serialize_image(image: DocumentImage):
    return {
        "id": image.id,
        "document_id": image.document_id,
        "original_name": image.original_name,
        "file_path": image.file_path,
        "url": f"/api/documents/images/{image.id}",
        "created_at": image.created_at.isoformat() if image.created_at else None,
    }


def _upload_root() -> Path:
    configured = current_app.config.get("DOCUMENT_UPLOAD_DIR")
    if configured:
        return Path(configured)
    return Path(current_app.root_path).parent / "uploads" / "documents"


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
            "image_count": len(d.images),
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
        "images": [_serialize_image(img) for img in d.images],
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


@bp.get("/<int:doc_id>/images")
@jwt_required()
def list_document_images(doc_id):
    document = Document.query.get_or_404(doc_id)
    return jsonify([_serialize_image(img) for img in document.images])


@bp.post("/<int:doc_id>/images")
@require_admin
def upload_document_images(doc_id):
    document = Document.query.get_or_404(doc_id)
    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    upload_dir = _upload_root() / str(document.id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    created = []
    for incoming in files:
        filename = secure_filename(incoming.filename or "")
        if not filename:
            continue
        ext = Path(filename).suffix.lower() or ".bin"
        stored_name = f"{uuid4().hex}{ext}"
        absolute_path = upload_dir / stored_name
        incoming.save(absolute_path)

        image = DocumentImage(
            document_id=document.id,
            file_path=str(absolute_path),
            original_name=filename,
        )
        db.session.add(image)
        db.session.flush()
        created.append(_serialize_image(image))

    if not created:
        return jsonify({"error": "No valid files uploaded"}), 400

    db.session.commit()
    return jsonify({"uploaded": created}), 201


@bp.get("/images/<int:image_id>")
@jwt_required()
def get_document_image(image_id):
    image = DocumentImage.query.get_or_404(image_id)
    file_path = Path(image.file_path)
    if not file_path.exists():
        return jsonify({"error": "Image file not found"}), 404
    return send_file(file_path)
