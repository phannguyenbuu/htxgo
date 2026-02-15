from flask import Blueprint, jsonify, request
from requests import RequestException

from ..services.fines_lookup import lookup_fines


bp = Blueprint("fines", __name__)


@bp.get("/lookup")
def fines_lookup():
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
