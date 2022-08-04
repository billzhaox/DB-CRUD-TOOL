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
# Database
db = SQLAlchemy(app)
JWTManager(app)

def set_uri(uri, table_name):
    app.config['SQLALCHEMY_DATABASE_URI'] = uri ## 'sqlite:///myweb.db'
    Base = automap_base()
    Base.prepare(db.engine, reflect=True)
    global myTable
    myTable = Base.classes[table_name]