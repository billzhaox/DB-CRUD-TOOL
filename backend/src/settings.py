from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_jwt_extended import JWTManager
from sqlalchemy.ext.automap import automap_base

# Instantiation
app = Flask(__name__, static_folder='frontend/build')
api = Api(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///myweb.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = b'\xfd(0\xec0e\xcd`\x94~\x17\xdb<m\x98\xca'
app.secret_key = 'dljsaklqk24e21cjn!Ew@@dsa5'
app.config['SQLALCHEMY_BINDS'] = {}
# Database
db = SQLAlchemy(app)
JWTManager(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')