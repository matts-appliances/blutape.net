from os import environ
from dotenv import load_dotenv
from datetime import timedelta
import redis

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = environ.get("SECRET_KEY", "dev_secret")  # fallback for dev
    SQLALCHEMY_DATABASE_URI = environ.get("DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FLASK_ENV = environ.get("FLASK_ENV", "development")
    DEBUG = FLASK_ENV == "development"

    # Sessions
    SESSION_TYPE = "redis"
    SESSION_REDIS = redis.from_url(environ.get("REDIS_URL", "redis://localhost:6379"))
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_PERMANENT = True
    SESSION_COOKIE_SECURE = FLASK_ENV == "production"   # only secure cookies in prod
    SESSION_COOKIE_HTTPONLY = True
    SESSION_USE_SIGNER = True
    SESSION_KEY_PREFIX = "blu:"
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # CORS
    if FLASK_ENV == "production":
        CORS_ORIGINS = ["https://blutape.net"]
    else:
        CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]  # vite dev server
    CORS_SUPPORTS_CREDENTIALS = True

    # Mail
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USERNAME = "cameron@mattsappliancesla.net"
    MAIL_PASSWORD = environ.get("APP_PASSWORD")
    MAIL_USE_TLS = True
    MAIL_DEFAULT_SENDER = "cameron@mattsappliancesla.net"
    ADMIN_EMAIL = environ.get("ADMIN_EMAIL", "cameron@mattsappliancesla.net")

    MANIFEST_DESTINY_INTEGRATION_KEY = environ.get("MANIFEST_DESTINY_INTEGRATION_KEY")
