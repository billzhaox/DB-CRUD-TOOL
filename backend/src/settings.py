from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_jwt_extended import JWTManager

# Instantiation
app = Flask(__name__)
api = Api(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///myweb.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = b'\xfd(0\xec0e\xcd`\x94~\x17\xdb<m\x98\xca'
# Database
db = SQLAlchemy(app)
JWTManager(app)