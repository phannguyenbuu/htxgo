from app import create_app, db
from app.models import Unit


app = create_app()


with app.app_context():
    units = [
        ("HTX1", False),
        ("HTX2", False),
        ("HTX3", False),
        ("HTX4", False),
        ("HTX5", False),
        ("HTX-virtual", True),
    ]

    for name, is_virtual in units:
        if not Unit.query.filter_by(name=name).first():
            db.session.add(Unit(name=name, is_virtual=is_virtual))

    db.session.commit()
    print("Seeded units")
