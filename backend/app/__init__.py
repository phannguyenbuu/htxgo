from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

from .config import Config


db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


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

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(units_bp, url_prefix="/api/units")
    app.register_blueprint(drivers_bp, url_prefix="/api/drivers")
    app.register_blueprint(vehicles_bp, url_prefix="/api/vehicles")
    app.register_blueprint(documents_bp, url_prefix="/api/documents")
    app.register_blueprint(fines_bp, url_prefix="/api/fines")

    return app
