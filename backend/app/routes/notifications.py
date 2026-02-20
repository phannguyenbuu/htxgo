from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import and_, or_

from ..models import Driver, Notification, User


bp = Blueprint("notifications", __name__)


@bp.get("/my")
@jwt_required()
def list_my_notifications():
    identity = get_jwt_identity()
    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid token subject"}), 401
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Admin can inspect all notifications in app if needed.
    if user.role == "admin":
        notifications = Notification.query.order_by(Notification.created_at.desc()).all()
    else:
        driver = Driver.query.get(user.driver_id) if user.driver_id else None
        if not driver:
            return jsonify([])

        filters = [
            Notification.target_type == "all",
            and_(Notification.target_type == "driver", Notification.driver_id == driver.id),
            and_(Notification.target_type == "htx", Notification.unit_id == driver.unit_id),
        ]
        if driver.group_id:
            filters.append(
                and_(
                    Notification.target_type == "group",
                    Notification.driver_group_id == driver.group_id,
                )
            )
        notifications = (
            Notification.query.filter(or_(*filters))
            .order_by(Notification.created_at.desc())
            .all()
        )

    return jsonify(
        [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "target_type": n.target_type,
                "unit_id": n.unit_id,
                "driver_id": n.driver_id,
                "driver_group_id": n.driver_group_id,
                "created_at": n.created_at.isoformat() + "Z" if n.created_at else None,
            }
            for n in notifications
        ]
    )
