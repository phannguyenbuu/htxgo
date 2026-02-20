import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-too")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        minutes=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_MINUTES", "60"))
    )
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(
        days=int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", "30"))
    )
    PERMANENT_SESSION_LIFETIME = timedelta(
        days=int(os.getenv("ADMIN_SESSION_LIFETIME_DAYS", "30"))
    )
    SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL") or (
        f"postgresql+psycopg://{os.getenv('DB_USER', 'postgres')}"
        f":{os.getenv('DB_PASSWORD', 'myPass')}"
        f"@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '5432')}"
        f"/{os.getenv('DB_NAME', 'htxgo')}"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ADMIN_API_BASE = os.getenv("ADMIN_API_BASE", "").rstrip("/")
