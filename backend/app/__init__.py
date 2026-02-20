from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from sqlalchemy import inspect, text

from .config import Config


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def _apply_schema_extensions():
    create_table_statements = {
        "document_images": (
            "documents",
            """
            CREATE TABLE IF NOT EXISTS document_images (
                id SERIAL PRIMARY KEY,
                document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                file_path VARCHAR(255) NOT NULL,
                original_name VARCHAR(255),
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
            """,
        ),
        "driver_groups": (
            None,
            """
            CREATE TABLE IF NOT EXISTS driver_groups (
                id SERIAL PRIMARY KEY,
                name VARCHAR(120) UNIQUE NOT NULL,
                description VARCHAR(255),
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
            """,
        ),
    }
    ddl_statements = {
        "drivers": [
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS cccd VARCHAR(32)",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS address VARCHAR(255)",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS email VARCHAR(120)",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS bank_account VARCHAR(64)",
            "ALTER TABLE drivers ADD COLUMN IF NOT EXISTS group_id INTEGER",
        ],
        "vehicles": [
            "ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_name VARCHAR(120)",
            "ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_cccd VARCHAR(32)",
            "ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_phone VARCHAR(32)",
            "ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_address VARCHAR(255)",
            "ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_email VARCHAR(120)",
            "ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_bank_account VARCHAR(64)",
        ],
        "notifications": [
            "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS driver_group_id INTEGER",
        ],
    }
    inspector = inspect(db.engine)
    with db.engine.begin() as conn:
        for _name, (dependency_table, ddl) in create_table_statements.items():
            if dependency_table and not inspector.has_table(dependency_table):
                continue
            conn.execute(text(ddl))
        for table_name, statements in ddl_statements.items():
            if not inspector.has_table(table_name):
                continue
            for ddl in statements:
                conn.execute(text(ddl))


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Blueprints
    from .routes.auth import bp as auth_bp
    from .routes.units import bp as units_bp
    from .routes.drivers import bp as drivers_bp
    from .routes.vehicles import bp as vehicles_bp
    from .routes.documents import bp as documents_bp
    from .routes.fines import bp as fines_bp
    from .routes.notifications import bp as notifications_bp
    from .routes.admin import api_bp as admin_api_bp, ui_bp as admin_ui_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(units_bp, url_prefix="/api/units")
    app.register_blueprint(drivers_bp, url_prefix="/api/drivers")
    app.register_blueprint(vehicles_bp, url_prefix="/api/vehicles")
    app.register_blueprint(documents_bp, url_prefix="/api/documents")
    app.register_blueprint(fines_bp, url_prefix="/api/fines")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")
    app.register_blueprint(admin_api_bp, url_prefix="/api/admin")
    app.register_blueprint(admin_ui_bp, url_prefix="/admin")

    with app.app_context():
        _apply_schema_extensions()

    return app
