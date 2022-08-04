from flask import Flask, jsonify, request, make_response, abort
from flask_cors import CORS
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, get_jwt_identity, jwt_required

from models import Users, OpsLog
from settings import app, api, db
from datetime import datetime
import json
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from sqlalchemy.ext.automap import automap_base

def as_dict(obj):
    data = obj.__dict__
    # print("dict ", data)
    data.pop('_sa_instance_state', None)
    return data

def check_perms(perm):
    cur_user = Users.query.filter_by(username=get_jwt_identity()).first()
    return cur_user.has_permission(perm)


# def convDtype(dt):
#     for k in data.keys():
#         if k == "timestamp":
#             data[k] = datetime(2012, 3, 3, 10, 10, 10)

# Settings
CORS(app, resources=r'/*', supports_credentials=True)

class Perms:
    READ=0x01
    CREATE=0x02
    UPDATE=0x04
    DELETE=0x08
    ADMIN=0x80

# Routes

class DBSet(Resource):

    def post(self):
        data = request.get_json()
        # print(data)
        if not data:
            abort(404)
        app.config['SQLALCHEMY_BINDS'] = {'customDB' : data.get('uri')}
        global Base
        Base = automap_base()
        Base.prepare(db.get_engine(app, 'customDB'), reflect=True)
        global sess
        sess = db.create_scoped_session(options={'bind': db.get_engine(app, 'customDB')})
        sess.expire_on_commit = False
        tables = sorted(Base.classes.keys())
        # set_uri(data.get('uri'),data.get('table_name'))
        return make_response(jsonify(tables), 201)

api.add_resource(DBSet, '/dbset')

class TableSet(Resource):

    def post(self):
        data = request.get_json()
        print(data)
        if not data:
            abort(404)
        global myTable
        myTable = Base.classes[data.get('table_name')]
        myTable.as_dict = as_dict
        # columns = myTable.__table__.columns.keys()
        dt_list = []
        for c in myTable.__table__.columns:
            dt_list.append({"c_name":str(c.name),"c_type":str(c.type)})
        print(dt_list)
        return make_response(jsonify(dt_list), 201)

api.add_resource(TableSet, '/tbset')



# shows the list of all employees, and lets you POST to add new employees
class ItemsList(Resource):
    # @jwt_required()
    def get(self):
        # TODO: select certain columns
        results = sess.query(myTable).all()
        # print("anmenzhebian: ", jsonify([r.as_dict() for r in results]).json())
        return jsonify([r.as_dict() for r in results])

    @jwt_required()
    def post(self):
        data = request.get_json()
        if not data:
            abort(404)
        print(data)
        if not check_perms(Perms.CREATE):
            abort(403)
        new_item = myTable(**data)
        sess.add(new_item)
        sess.flush()
        id_ = new_item.id
        sess.commit()
        mylog = OpsLog(
            username = get_jwt_identity(),
            timestamp = datetime.now(),
            db_uri = app.config['SQLALCHEMY_BINDS']['customDB'],
            tb_name = myTable.__table__.name,
            operation='CREATE',
            ops_obj_id = id_,
            request_body = json.dumps(data)
        )
        mylog.save()

        
        return make_response({}, 201)

api.add_resource(ItemsList, '/items')

# shows a single employee and lets you edit or delete an item
class Item(Resource):
    @jwt_required()
    def get(self, id):
        item = sess.query(myTable).get(id)
        if item is None:
            abort(400, message="Item {} doesn't exist".format(id))
        return jsonify(item.as_dict())

    @jwt_required()
    def delete(self, id):
        item = sess.query(myTable).get(id)
        if item is None:
            abort(400, message="Item {} doesn't exist".format(id))
        if not check_perms(Perms.DELETE):
            abort(403)
        sess.delete(item)
        sess.commit()
        mylog = OpsLog(
            username = get_jwt_identity(),
            timestamp = datetime.now(),
            db_uri = app.config['SQLALCHEMY_BINDS']['customDB'],
            tb_name = myTable.__table__.name,
            operation='DELETE',
            ops_obj_id = id
        )
        mylog.save()
        return make_response(jsonify({'message': 'Item Deleted'}), 204)

    @jwt_required()
    def put(self, id):
        data = request.get_json()
        if not data:
            abort(404)
        print("data: ", data)
        if not check_perms(Perms.UPDATE):
            abort(403)
        item = sess.query(myTable).filter(myTable.id==id)
        if item is None:
            abort(400, message="Item {} doesn't exist".format(id))
        # for key, value in data.items():
        #     setattr(item, key, value)
        item.update(data)
        sess.commit()
        mylog = OpsLog(
            username=get_jwt_identity(),
            timestamp = datetime.now(),
            db_uri = app.config['SQLALCHEMY_BINDS']['customDB'],
            tb_name = myTable.__table__.name,
            operation='UPDATE',
            ops_obj_id = id,
            request_body = json.dumps(data)
        )
        mylog.save()
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
            password=generate_password_hash(data.get('password')),
            permission=0x01
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

# get current user name
class GetUser(Resource):
    @jwt_required()
    def get(self):
        current_user=get_jwt_identity()
        # print(current_user)
        return make_response(jsonify({"uname":current_user}),200)

api.add_resource(GetUser, '/getUser')

# get the list of all logs
class LogsList(Resource):
    @jwt_required()
    def get(self):
        logs = OpsLog.query.all()
        return jsonify([log.to_json() for log in logs])

api.add_resource(LogsList, '/logs')

# get the list of all users
class UsersList(Resource):
    @jwt_required()
    def get(self):
        users = Users.query.all()
        return jsonify([user.to_json() for user in users])

api.add_resource(UsersList, '/users')

if __name__ == "__main__":
    app.run(debug=True)
