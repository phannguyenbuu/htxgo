from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

from . import db


class Unit(db.Model):
    __tablename__ = "units"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    is_virtual = db.Column(db.Boolean, default=False, nullable=False)

    drivers = db.relationship("Driver", back_populates="unit", cascade="all, delete")
    vehicles = db.relationship("Vehicle", back_populates="unit", cascade="all, delete")


class Driver(db.Model):
    __tablename__ = "drivers"
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(32), nullable=True)
    license_number = db.Column(db.String(64), nullable=True)
    cccd = db.Column(db.String(32), nullable=True)
    address = db.Column(db.String(255), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    bank_account = db.Column(db.String(64), nullable=True)
    group_id = db.Column(db.Integer, nullable=True)
    unit_id = db.Column(db.Integer, db.ForeignKey("units.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    unit = db.relationship("Unit", back_populates="drivers")
    documents = db.relationship("Document", back_populates="driver", cascade="all, delete")
    user = db.relationship("User", back_populates="driver", uselist=False)


class Vehicle(db.Model):
    __tablename__ = "vehicles"
    id = db.Column(db.Integer, primary_key=True)
    plate_number = db.Column(db.String(32), unique=True, nullable=False)
    type = db.Column(db.String(64), nullable=True)
    capacity = db.Column(db.String(64), nullable=True)
    owner_name = db.Column(db.String(120), nullable=True)
    owner_cccd = db.Column(db.String(32), nullable=True)
    owner_phone = db.Column(db.String(32), nullable=True)
    owner_address = db.Column(db.String(255), nullable=True)
    owner_email = db.Column(db.String(120), nullable=True)
    owner_bank_account = db.Column(db.String(64), nullable=True)
    unit_id = db.Column(db.Integer, db.ForeignKey("units.id"), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey("drivers.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    unit = db.relationship("Unit", back_populates="vehicles")
    driver = db.relationship("Driver")
    documents = db.relationship("Document", back_populates="vehicle", cascade="all, delete")


class Document(db.Model):
    __tablename__ = "documents"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    doc_type = db.Column(db.String(64), nullable=True)
    number = db.Column(db.String(64), nullable=True)
    issued_date = db.Column(db.Date, nullable=True)
    expiry_date = db.Column(db.Date, nullable=True)
    driver_id = db.Column(db.Integer, db.ForeignKey("drivers.id"), nullable=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey("vehicles.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    driver = db.relationship("Driver", back_populates="documents")
    vehicle = db.relationship("Vehicle", back_populates="documents")
    images = db.relationship("DocumentImage", back_populates="document", cascade="all, delete")


class DocumentImage(db.Model):
    __tablename__ = "document_images"
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey("documents.id"), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    original_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    document = db.relationship("Document", back_populates="images")


class DriverGroup(db.Model):
    __tablename__ = "driver_groups"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    message = db.Column(db.Text, nullable=False)
    target_type = db.Column(db.String(16), nullable=False, default="all")  # all|group|driver
    unit_id = db.Column(db.Integer, db.ForeignKey("units.id"), nullable=True)
    driver_id = db.Column(db.Integer, db.ForeignKey("drivers.id"), nullable=True)
    driver_group_id = db.Column(db.Integer, nullable=True)
    created_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    unit = db.relationship("Unit")
    driver = db.relationship("Driver")
    created_by_user = db.relationship("User")


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(16), nullable=False, default="driver")
    driver_id = db.Column(db.Integer, db.ForeignKey("drivers.id"), nullable=True)
    auth_provider = db.Column(db.String(32), nullable=False, default="local")
    google_sub = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    driver = db.relationship("Driver", back_populates="user")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
