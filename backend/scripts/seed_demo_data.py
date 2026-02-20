#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import random
import re
from datetime import date, timedelta
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ModuleNotFoundError as exc:
    raise SystemExit(
        "Missing dependency Pillow. Install with: pip install Pillow (or pip install -r requirements.txt)"
    ) from exc

from app import create_app, db
from app.models import Document, Driver, Unit, User, Vehicle


DRIVER_DOC_TYPES = [
    ("CCCD", "Can cuoc cong dan", 15),
    ("GPLX", "Giay phep lai xe", 5),
    ("Giay kham suc khoe", "Giay kham suc khoe", 2),
]

VEHICLE_DOC_TYPES = [
    ("Giay dang ky xe", "Giay dang ky xe", 10),
    ("Dang kiem", "Giay chung nhan dang kiem", 1),
    ("Bao hiem TNDS", "Bao hiem TNDS", 1),
]

VEHICLE_TYPES = ["Xe tai", "Xe van", "Xe hop dong", "Xe 7 cho"]
VEHICLE_CAPACITY = ["750kg", "1 tan", "1.5 tan", "2 tan"]
LAST_NAMES = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Phan", "Vu", "Vo", "Dang", "Bui", "Do", "Ho"]
MIDDLE_NAMES = ["Van", "Thi", "Minh", "Quoc", "Duc", "Ngoc", "Gia", "Thanh", "Anh", "Hong"]
FIRST_NAMES = [
    "An", "Binh", "Cuong", "Dung", "Duy", "Dat", "Giang", "Ha", "Hai", "Hieu", "Hoa", "Hung", "Khanh", "Lam",
    "Lien", "Long", "Mai", "Nam", "Nga", "Ngoc", "Nhi", "Phuc", "Phuong", "Quan", "Quang", "Son", "Tai", "Tam",
    "Thao", "Thu", "Trang", "Trung", "Tuan", "Vy", "Yen",
]
PHONE_PREFIXES = [
    "032", "033", "034", "035", "036", "037", "038", "039", "070", "076", "077", "078", "079", "081", "082",
    "083", "084", "085", "086", "088", "089", "090", "091", "092", "093", "094", "096", "097", "098", "099",
]
PROVINCES = ["TP.HCM", "Ha Noi", "Da Nang", "Can Tho", "Binh Duong", "Dong Nai", "Hai Phong", "Khanh Hoa", "Quang Ninh", "Ba Ria - Vung Tau"]
DISTRICTS = ["Quan 1", "Quan 3", "Quan 7", "Quan 10", "Quan Binh Thanh", "Quan Go Vap", "Quan Thu Duc", "Quan Tan Binh", "Quan Tan Phu", "Quan Phu Nhuan"]
STREETS = ["Nguyen Van Linh", "Le Loi", "Tran Hung Dao", "Pham Van Dong", "Dien Bien Phu", "Vo Van Kiet", "Nguyen Huu Canh", "Hai Ba Trung", "Pham Ngu Lao", "Hoang Van Thu"]
BANKS = [
    "Vietcombank",
    "BIDV",
    "VietinBank",
    "Agribank",
    "Techcombank",
    "MB Bank",
    "ACB",
    "Sacombank",
    "TPBank",
    "VPBank",
]


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def seeded_rng(i: int) -> random.Random:
    return random.Random(20260220 + (i * 7919))


def vietnamese_full_name(i: int) -> str:
    rng = seeded_rng(i)
    return f"{rng.choice(LAST_NAMES)} {rng.choice(MIDDLE_NAMES)} {rng.choice(FIRST_NAMES)}"


def vietnamese_phone(i: int) -> str:
    rng = seeded_rng(i * 13)
    return f"{rng.choice(PHONE_PREFIXES)}{rng.randint(0, 9999999):07d}"


def vietnamese_cccd(i: int) -> str:
    rng = seeded_rng(i * 17)
    return f"{rng.choice(['001', '002', '004', '025', '031', '048', '051', '079', '083', '096'])}{rng.randint(0, 999):03d}{rng.randint(0, 999999):06d}"


def vietnamese_address(i: int) -> str:
    rng = seeded_rng(i * 19)
    return f"{rng.randint(1, 399)} {rng.choice(STREETS)}, {rng.choice(DISTRICTS)}, {rng.choice(PROVINCES)}"


def bank_account_with_bank(i: int) -> str:
    rng = seeded_rng(i * 23)
    bank = rng.choice(BANKS)
    account = f"{rng.randint(10**11, (10**12) - 1)}"
    return f"{bank} - {account}"


def ensure_units() -> list[Unit]:
    units = Unit.query.order_by(Unit.id.asc()).all()
    if units:
        return units

    created = []
    for idx in range(1, 6):
        unit = Unit(name=f"HTX{idx}", is_virtual=False)
        db.session.add(unit)
        created.append(unit)
    db.session.commit()
    return created


def generate_driver(i: int, unit: Unit) -> Driver:
    license_number = f"B2-{i:06d}"
    full_name = vietnamese_full_name(i)
    phone = vietnamese_phone(i)
    cccd = vietnamese_cccd(i)
    email = f"driver{i:03d}.{slugify(full_name)}@demo.local"
    address = vietnamese_address(i)
    bank_account = bank_account_with_bank(i)

    driver = Driver.query.filter_by(license_number=license_number).first()
    if driver:
        driver.full_name = full_name
        driver.phone = phone
        driver.cccd = cccd
        driver.email = email
        driver.address = address
        driver.bank_account = bank_account
        driver.unit_id = unit.id
        return driver

    driver = Driver(
        full_name=full_name,
        phone=phone,
        license_number=license_number,
        cccd=cccd,
        email=email,
        address=address,
        bank_account=bank_account,
        unit_id=unit.id,
    )
    db.session.add(driver)
    return driver


def ensure_driver_user(driver: Driver, i: int) -> None:
    username = f"driver{i:03d}"
    user = User.query.filter_by(username=username).first()
    if user:
        user.role = "driver"
        user.driver_id = driver.id
        return

    user = User(username=username, role="driver", driver_id=driver.id)
    user.set_password("driver123")
    db.session.add(user)


def generate_vehicle(i: int, unit: Unit, driver: Driver) -> Vehicle:
    plate_number = f"51H-{i:05d}"
    vehicle = Vehicle.query.filter_by(plate_number=plate_number).first()
    vtype = VEHICLE_TYPES[(i - 1) % len(VEHICLE_TYPES)]
    capacity = VEHICLE_CAPACITY[(i - 1) % len(VEHICLE_CAPACITY)]
    if vehicle:
        vehicle.type = vtype
        vehicle.capacity = capacity
        vehicle.owner_name = driver.full_name
        vehicle.owner_cccd = driver.cccd
        vehicle.owner_phone = driver.phone
        vehicle.owner_address = driver.address
        vehicle.owner_email = driver.email
        vehicle.owner_bank_account = driver.bank_account
        vehicle.unit_id = unit.id
        vehicle.driver_id = driver.id
        return vehicle

    vehicle = Vehicle(
        plate_number=plate_number,
        type=vtype,
        capacity=capacity,
        owner_name=driver.full_name,
        owner_cccd=driver.cccd,
        owner_phone=driver.phone,
        owner_address=driver.address,
        owner_email=driver.email,
        owner_bank_account=driver.bank_account,
        unit_id=unit.id,
        driver_id=driver.id,
    )
    db.session.add(vehicle)
    return vehicle


def upsert_driver_document(driver: Driver, i: int, doc_idx: int) -> Document:
    doc_type, title_prefix, valid_years = DRIVER_DOC_TYPES[doc_idx]
    number = f"DRV-{i:03d}-{doc_idx + 1:02d}"
    issued = date.today() - timedelta(days=(i * 3) + (doc_idx * 30))
    expiry = issued + timedelta(days=365 * valid_years)

    document = (
        Document.query.filter_by(driver_id=driver.id, vehicle_id=None, doc_type=doc_type, number=number)
        .order_by(Document.id.asc())
        .first()
    )
    if not document:
        document = Document(driver_id=driver.id, vehicle_id=None)
        db.session.add(document)

    document.title = f"{title_prefix} - Driver {i:03d}"
    document.doc_type = doc_type
    document.number = number
    document.issued_date = issued
    document.expiry_date = expiry
    return document


def upsert_vehicle_document(vehicle: Vehicle, i: int, doc_idx: int) -> Document:
    doc_type, title_prefix, valid_years = VEHICLE_DOC_TYPES[doc_idx]
    number = f"VEH-{i:03d}-{doc_idx + 1:02d}"
    issued = date.today() - timedelta(days=(i * 2) + (doc_idx * 20))
    expiry = issued + timedelta(days=365 * valid_years)

    document = (
        Document.query.filter_by(vehicle_id=vehicle.id, driver_id=None, doc_type=doc_type, number=number)
        .order_by(Document.id.asc())
        .first()
    )
    if not document:
        document = Document(vehicle_id=vehicle.id, driver_id=None)
        db.session.add(document)

    document.title = f"{title_prefix} - Vehicle {i:03d}"
    document.doc_type = doc_type
    document.number = number
    document.issued_date = issued
    document.expiry_date = expiry
    return document


def draw_document_image(output_path: Path, title: str, lines: list[str]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image = Image.new("RGB", (1200, 850), color=(250, 252, 255))
    draw = ImageDraw.Draw(image)

    draw.rectangle((30, 30, 1170, 820), outline=(80, 110, 180), width=4)
    draw.rectangle((30, 30, 1170, 145), fill=(225, 236, 255))
    draw.text((60, 70), title, fill=(18, 39, 84))

    y = 190
    for line in lines:
        draw.text((70, y), line, fill=(30, 40, 62))
        y += 58

    draw.text((70, 760), "Demo document generated by seed_demo_data.py", fill=(90, 95, 110))
    image.save(output_path, format="PNG")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Seed demo data: drivers, vehicles, documents and sample document images."
    )
    parser.add_argument("--count", type=int, default=99, help="Number of drivers and vehicles (default: 99)")
    parser.add_argument(
        "--output-dir",
        default="sample_docs",
        help="Directory to store generated document images and manifest (default: sample_docs)",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete existing drivers/vehicles/documents/users(role=driver) before seeding",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    app = create_app()
    output_dir = Path(args.output_dir).resolve()

    with app.app_context():
        if args.reset:
            Document.query.delete()
            Vehicle.query.delete()
            Driver.query.delete()
            User.query.filter_by(role="driver").delete()
            db.session.commit()

        units = ensure_units()
        manifest = []

        for i in range(1, args.count + 1):
            unit = units[(i - 1) % len(units)]
            driver = generate_driver(i, unit)
            db.session.flush()
            ensure_driver_user(driver, i)
            vehicle = generate_vehicle(i, unit, driver)
            db.session.flush()

            for doc_idx in range(len(DRIVER_DOC_TYPES)):
                doc = upsert_driver_document(driver, i, doc_idx)
                db.session.flush()
                rel_path = Path("drivers") / f"driver_{i:03d}_{slugify(doc.doc_type)}.png"
                full_path = output_dir / rel_path
                draw_document_image(
                    full_path,
                    f"DRIVER DOCUMENT: {doc.doc_type}",
                    [
                        f"Driver ID: {driver.id}",
                        f"Driver Name: {driver.full_name}",
                        f"License Number: {driver.license_number}",
                        f"Document Number: {doc.number}",
                        f"Issued Date: {doc.issued_date}",
                        f"Expiry Date: {doc.expiry_date}",
                    ],
                )
                manifest.append(
                    {
                        "document_id": doc.id,
                        "entity": "driver",
                        "entity_id": driver.id,
                        "doc_type": doc.doc_type,
                        "image": str(rel_path).replace("\\", "/"),
                    }
                )

            for doc_idx in range(len(VEHICLE_DOC_TYPES)):
                doc = upsert_vehicle_document(vehicle, i, doc_idx)
                db.session.flush()
                rel_path = Path("vehicles") / f"vehicle_{i:03d}_{slugify(doc.doc_type)}.png"
                full_path = output_dir / rel_path
                draw_document_image(
                    full_path,
                    f"VEHICLE DOCUMENT: {doc.doc_type}",
                    [
                        f"Vehicle ID: {vehicle.id}",
                        f"Plate Number: {vehicle.plate_number}",
                        f"Vehicle Type: {vehicle.type}",
                        f"Capacity: {vehicle.capacity}",
                        f"Document Number: {doc.number}",
                        f"Issued Date: {doc.issued_date}",
                        f"Expiry Date: {doc.expiry_date}",
                    ],
                )
                manifest.append(
                    {
                        "document_id": doc.id,
                        "entity": "vehicle",
                        "entity_id": vehicle.id,
                        "doc_type": doc.doc_type,
                        "image": str(rel_path).replace("\\", "/"),
                    }
                )

        db.session.commit()

        output_dir.mkdir(parents=True, exist_ok=True)
        manifest_path = output_dir / "manifest.json"
        with manifest_path.open("w", encoding="utf-8") as f:
            json.dump(
                {
                    "count": args.count,
                    "generated_at": date.today().isoformat(),
                    "total_images": len(manifest),
                    "items": manifest,
                },
                f,
                ensure_ascii=False,
                indent=2,
            )

        print(f"Seed complete: {args.count} drivers, {args.count} vehicles")
        print(f"Generated images: {len(manifest)}")
        print(f"Output folder: {output_dir}")
        print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
