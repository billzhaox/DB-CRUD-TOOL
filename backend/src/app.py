from flask import Flask, jsonify, request, make_response, abort
from flask_cors import CORS
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, get_jwt_identity, jwt_required

from models import Employees, Users, OpsLog
# from settings import app, api, db, set_uri, myTable
from datetime import datetime
import json
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from sqlalchemy.ext.automap import automap_base

# Instantiation
app = Flask(__name__)
api = Api(app)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///myweb.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = b'\xfd(0\xec0e\xcd`\x94~\x17\xdb<m\x98\xca'
# Database
db = SQLAlchemy(app)
JWTManager(app)
myTable = "nones"

def as_dict(obj):
    data = obj.__dict__
    # print("dict ", data)
    data.pop('_sa_instance_state', None)
    return data

# Settings
CORS(app, resources=r'/*', supports_credentials=True)

# Routes

class DBSet(Resource):

    def post(self):
        data = request.get_json()
        print(data)
        if not data:
            abort(404)
        global app
        app.config['SQLALCHEMY_DATABASE_URI'] = data.get('uri')
        global myTable
        Base = automap_base()
        Base.prepare(db.engine, reflect=True)
        myTable = Base.classes[data.get('table_name')]
        myTable.as_dict = as_dict
        # set_uri(data.get('uri'),data.get('table_name'))
        return 201

api.add_resource(DBSet, '/dbset')

# shows the list of all employees, and lets you POST to add new employees
class ItemsList(Resource):
    def get(self):
        # TODO: select certain columns
        results = db.session.query(myTable).all()
        # print(results)
        return jsonify([r.as_dict() for r in results])

    # @jwt_required()
    def post(self):
        data = request.get_json()
        if not data:
            abort(404)
        print(data)
        new_item = myTable(**data)
        db.session.add(new_item)
        db.session.commit()
        # mylog = OpsLog(
        #     username=get_jwt_identity(),
        #     timestamp = datetime.now(),
        #     operation='CREATE',
        #     ops_obj = data.get('name'),
        #     request_body = json.dumps(data)
        # )
        # mylog.save()

        
        return make_response({}, 201)

api.add_resource(ItemsList, '/items')

# shows a single employee and lets you edit or delete an item
class Item(Resource):
    def get(self, id):
        item = db.session.query(myTable).get(id)
        if item is None:
            abort(400, message="Item {} doesn't exist".format(id))
        return jsonify(item.as_dict())

    # @jwt_required()
    def delete(self, id):
        item = db.session.query(myTable).get(id)
        if item is None:
            abort(400, message="Item {} doesn't exist".format(id))
        db.session.delete(item)
        db.session.commit()
        # mylog = OpsLog(
        #     username=get_jwt_identity(),
        #     timestamp = datetime.now(),
        #     operation='DELETE',
        #     ops_obj = employee.name
        # )
        # mylog.save()
        return make_response(jsonify({'message': 'Item Deleted'}), 204)

    # @jwt_required()
    def put(self, id):
        data = request.get_json()
        if not data:
            abort(404)
        print("data: ",data)
        item = db.session.query(myTable).filter(myTable.id==id)
        if item is None:
            abort(400, message="Item {} doesn't exist".format(id))
        # for key, value in data.items():
        #     setattr(item, key, value)
        item.update(data)
        db.session.commit()
        # mylog = OpsLog(
        #     username=get_jwt_identity(),
        #     timestamp = datetime.now(),
        #     operation='UPDATE',
        #     ops_obj = data.get('name'),
        #     request_body = json.dumps(data)
        # )
        # mylog.save()
        return make_response({}, 201)

api.add_resource(Item, '/items/<id>')

class SignUp(Resource):
    def post(self):
        data = request.get_json()
        if not data:
          abort(404)
        username=data.get('username')
        db_user=Users.query.filter_by(username=username).first()
        if db_user is not None:
            return jsonify({"message":f"User with username {username} already exists"})
        new_user=Users(
            username=data.get('username'),
            email=data.get('email'),
            password=generate_password_hash(data.get('password'))
        )
        new_user.save()
        return make_response(jsonify({"message":"User created successfuly"}),201)

api.add_resource(SignUp, '/signup')

class Login(Resource):
    def post(self):
        data=request.get_json()
        if not data:
          abort(404)
        username=data.get('username')
        password=data.get('password')
        db_user=Users.query.filter_by(username=username).first()
        if db_user and check_password_hash(db_user.password, password):
            access_token=create_access_token(identity=db_user.username)
            refresh_token=create_refresh_token(identity=db_user.username)
            return jsonify({"access_token":access_token,"refresh_token":refresh_token})
        else:
            return jsonify({"message":"Invalid username or password"})

api.add_resource(Login, '/login')

class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        current_user=get_jwt_identity()
        # print(current_user)
        new_access_token=create_access_token(identity=current_user)
        return make_response(jsonify({"access_token":new_access_token}),200)

api.add_resource(Refresh, '/refresh')

class GetUser(Resource):
    @jwt_required()
    def get(self):
        current_user=get_jwt_identity()
        # print(current_user)
        return make_response(jsonify({"uname":current_user}),200)

api.add_resource(GetUser, '/getUser')

# shows the list of all logs
class LogsList(Resource):
    @jwt_required()
    def get(self):
        logs = OpsLog.query.all()
        return jsonify([log.to_json() for log in logs])

api.add_resource(LogsList, '/logs')

if __name__ == "__main__":
    app.run(debug=True)
