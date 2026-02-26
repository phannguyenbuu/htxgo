from app import create_app, db
from app.models import Unit


app = create_app()


with app.app_context():
    units_to_seed = [
        ("HTX1", False),
        ("HTX2", False),
        ("HTX3", False),
        ("HTX4", False),
        ("HTX5", False),
        ("HTX-virtual", True),
    ]

    # Get all existing unit names in a single query for efficiency
    existing_unit_names = {unit.name for unit in Unit.query.with_entities(Unit.name).all()}

    new_units = [
        Unit(name=name, is_virtual=is_virtual)
        for name, is_virtual in units_to_seed
        if name not in existing_unit_names
    ]

    if new_units:
        db.session.add_all(new_units)
        db.session.commit()
        print(f"Seeded {len(new_units)} new units.")
    else:
        print("All units already exist in the database.")
