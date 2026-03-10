from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_login import LoginManager
from flask_session import Session
from flask_mailman import Mail

from app.models import Base
db = SQLAlchemy(model_class=Base)

migrate = Migrate()
bcrypt = Bcrypt()
cors = CORS()
login_manager = LoginManager()
session = Session()
mail = Mail()
serializer = None