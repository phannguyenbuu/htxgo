import os

from dotenv import load_dotenv

from app import create_app

load_dotenv()

app = create_app()


if __name__ == "__main__":
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "8006"))
    debug = os.getenv("APP_DEBUG", "1").strip().lower() in {"1", "true", "yes", "on"}
    app.run(host=host, port=port, debug=debug)

