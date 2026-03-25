import hashlib
from urllib.parse import quote

from flask import Blueprint, jsonify, request, session, current_app
from app.extensions import db, bcrypt
from app.models import User
from flask_login import login_user, logout_user, current_user, login_required
from datetime import datetime, timezone
from flask_mailman import EmailMessage
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

auth_bp = Blueprint("auth", __name__)


def _manifest_access_serializer():
    secret = current_app.config.get("MANIFEST_DESTINY_ACCESS_SECRET")
    if not secret:
        raise RuntimeError("MANIFEST_DESTINY_ACCESS_SECRET is not configured")
    return URLSafeTimedSerializer(secret_key=secret, salt="manifest-destiny-access")


def _password_reset_serializer():
    return URLSafeTimedSerializer(
        secret_key=current_app.config["SECRET_KEY"],
        salt="password-reset",
    )


def _password_reset_fingerprint(user):
    return hashlib.sha256(user.password_hash.encode("utf-8")).hexdigest()


def _build_password_reset_link(token):
    base_url = (current_app.config.get("APP_BASE_URL") or request.host_url).rstrip("/")
    return f"{base_url}/reset-password?token={quote(token)}"


def _load_password_reset_user(token):
    try:
        payload = _password_reset_serializer().loads(
            token,
            max_age=current_app.config.get("PASSWORD_RESET_TOKEN_MAX_AGE", 3600),
        )
    except SignatureExpired as exc:
        raise ValueError("This reset link has expired. Request a new one.") from exc
    except BadSignature as exc:
        raise ValueError("This reset link is invalid. Request a new one.") from exc

    user_id = payload.get("user_id")
    fingerprint = payload.get("fingerprint")
    if not user_id or not fingerprint:
        raise ValueError("This reset link is invalid. Request a new one.")

    user = db.session.get(User, user_id)
    if not user or not user.is_active:
        raise ValueError("This reset link is no longer valid. Request a new one.")

    if fingerprint != _password_reset_fingerprint(user):
        raise ValueError("This reset link is no longer valid. Request a new one.")

    return user


@auth_bp.post("/register")
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify(success=False, message="No payload in request"), 400
        
        first_name = (data.get("first_name") or "").strip()
        last_name = (data.get("last_name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        role = (data.get("role") or "").strip().lower()
        password1 = data.get("password1") or ""
        password2 = data.get("password2") or ""

        missing = []
        if not first_name:
            missing.append("first_name")
        if not last_name:
            missing.append("last_name")
        if not email:
            missing.append("email")
        if not role:
            missing.append("role")
        if not password1:
            missing.append("password1")
        if not password2:
            missing.append("password2")
        if missing:
            return jsonify(success=False, message=f"Missing required fields: {', '.join(missing)}"), 400
        
        check_email = db.session.query(User).filter_by(email=email).first()
        if check_email:
            return jsonify(success=False, message="User already exists with this email. If you forgot your password please request a reset link."), 400
        
        if password1 != password2:
            return jsonify(success=False, message="Passwords do not match, please chack inputs and try again."), 403
        
        new_user = User(
            first_name=first_name.capitalize(),
            last_name=last_name.capitalize(),
            role=role,
            email=email,
            password_hash=bcrypt.generate_password_hash(password1).decode("utf-8"),
        )
        
        db.session.add(new_user)
        db.session.commit()
        current_app.logger.info(f"[NEW REGISTRATION]: {new_user.first_name} has been added to the database")
        return jsonify(success=True, message=f"{new_user.first_name} has been registered!"), 200
    except Exception as e:
        current_app.logger.error(f"[REGISTRATION ERROR]: Error when adding user: {e}")
        db.session.rollback()
        return jsonify(success=False, message="Error when adding user"), 500
    
    
@auth_bp.post("/login")
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify(success=False, message="No payload in request"), 400

        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        if not email or not password:
            return jsonify(success=False, message="email and password are required"), 400

        user = db.session.query(User).filter_by(email=email).first()
        if not user:
            return jsonify(success=False, message="Invalid credentials, please check inputs and try again."), 400
        if not bcrypt.check_password_hash(user.password_hash, password):
            return jsonify(success=False, message="Invalid credentials, please check your inputs and try again."), 401
        login_user(user)
        session["user"] = f"{user.first_name} {user.last_name[0]}"
        session["device"] = request.headers.get("User-Agent")
        current_app.logger.info(f"[LOGIN]: {user.first_name} {user.last_name} has logged in at {datetime.now(timezone.utc)}")
        return jsonify(success=True, message=f"Logged in as {user.first_name} {user.last_name[0]}.", user=user.serialize()), 200
    except Exception as e:
        current_app.logger.error(f"[LOGIN ERROR]: {e}")
        return jsonify(success=False, message="There was an error when logging in"), 500


@auth_bp.post("/forgot-password")
def forgot_password():
    try:
        data = request.get_json()
        if not data:
            return jsonify(success=False, message="No payload in request"), 400

        email = (data.get("email") or "").strip().lower()
        if not email:
            return jsonify(success=False, message="email is required"), 400

        generic_message = (
            "If an account exists for that email, a reset link has been sent."
        )
        user = db.session.query(User).filter_by(email=email).first()
        if not user or not user.is_active:
            current_app.logger.info(
                f"[PASSWORD RESET REQUEST]: No active user found for {email}"
            )
            return jsonify(success=True, message=generic_message), 200

        token = _password_reset_serializer().dumps(
            {
                "user_id": user.id,
                "fingerprint": _password_reset_fingerprint(user),
            }
        )
        reset_link = _build_password_reset_link(token)

        msg = EmailMessage(
            subject="Reset your bluTape password",
            body=(
                f"Hi {user.first_name},\n\n"
                "We received a request to reset your bluTape password.\n\n"
                f"Use this link to choose a new password:\n{reset_link}\n\n"
                "If you did not request this change, you can ignore this email."
            ),
            to=[user.email],
        )
        msg.send()

        current_app.logger.info(
            f"[PASSWORD RESET REQUEST]: Sent reset link to {user.email}"
        )
        return jsonify(success=True, message=generic_message), 200
    except Exception as e:
        current_app.logger.error(f"[PASSWORD RESET REQUEST ERROR]: {e}")
        return jsonify(success=False, message="Unable to send reset link"), 500


@auth_bp.get("/reset-password/validate")
def validate_reset_password():
    try:
        token = (request.args.get("token") or "").strip()
        if not token:
            return jsonify(success=False, message="token is required"), 400

        _load_password_reset_user(token)
        return jsonify(success=True, message="Reset link is valid."), 200
    except ValueError as e:
        return jsonify(success=False, message=str(e)), 400
    except Exception as e:
        current_app.logger.error(f"[PASSWORD RESET VALIDATION ERROR]: {e}")
        return jsonify(success=False, message="Unable to validate reset link"), 500


@auth_bp.post("/reset-password")
def reset_password():
    try:
        data = request.get_json()
        if not data:
            return jsonify(success=False, message="No payload in request"), 400

        token = (data.get("token") or "").strip()
        password1 = data.get("password1") or ""
        password2 = data.get("password2") or ""

        if not token:
            return jsonify(success=False, message="token is required"), 400
        if not password1 or not password2:
            return jsonify(success=False, message="Both password fields are required"), 400
        if password1 != password2:
            return jsonify(success=False, message="Passwords do not match"), 400

        user = _load_password_reset_user(token)
        user.password_hash = bcrypt.generate_password_hash(password1).decode("utf-8")
        db.session.commit()

        current_app.logger.info(
            f"[PASSWORD RESET]: Password updated for {user.email} at {datetime.now(timezone.utc)}"
        )
        return jsonify(success=True, message="Password updated. You can sign in now."), 200
    except ValueError as e:
        return jsonify(success=False, message=str(e)), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"[PASSWORD RESET ERROR]: {e}")
        return jsonify(success=False, message="Unable to reset password"), 500
    
    
@auth_bp.route("/logout", methods=["GET"])
@login_required
def logout():
    try:
        current_app.logger.info(f"[LOGOUT]: {current_user.first_name} {current_user.last_name[0]}. has logged out.")
        logout_user()
        return jsonify(success=True, message="User logged out."), 200
    except Exception as e:
        current_app.logger.error(f"[LOGOUT ERROR]: {e}")
        return jsonify(success=False, message="There was an error when logging out"), 500
    
    
@auth_bp.route("/hydrate", methods=['GET'])
@login_required
def hydrate():
    return jsonify(success=True, user=current_user.serialize()), 200


@auth_bp.get("/manifest-access")
@login_required
def manifest_access():
    try:
        serializer = _manifest_access_serializer()
        token = serializer.dumps(
            {
                "id": current_user.id,
                "email": current_user.email,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "role": str(current_user.role),
            }
        )
        return (
            jsonify(
                success=True,
                payload={
                    "token": token,
                    "base_url": current_app.config.get("MANIFEST_DESTINY_BASE_URL"),
                    "expires_in": current_app.config.get(
                        "MANIFEST_DESTINY_ACCESS_TOKEN_MAX_AGE",
                        300,
                    ),
                },
            ),
            200,
        )
    except Exception as e:
        current_app.logger.error(f"[MANIFEST ACCESS ERROR]: {e}")
        return jsonify(success=False, message="Unable to create manifest access token"), 500
