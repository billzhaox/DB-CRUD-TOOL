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
import pymysql
pymysql.install_as_MySQLdb()
user_dict = {}

# obj to dict
def as_dict(obj):
    data = obj.__dict__
    # print("dict ", data)
    data.pop('_sa_instance_state', None)
    return data

def getTableAndDBsession(current_user, table_name):
    Base = automap_base()
    Base.prepare(db.get_engine(app, current_user), reflect=True)
    myTable = Base.classes[table_name]
    myTable.as_dict = as_dict
    sess = db.create_scoped_session(options={'bind': db.get_engine(app, current_user)})
    return myTable, sess

# check if current user has certain kind of permission
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

# connect to database by uri
class DBSet(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        # print(data)
        if not data:
            abort(400, "The request json is none")
        current_user=get_jwt_identity()
        bds = current_app.config['SQLALCHEMY_BINDS']
        bds[current_user] = data.get('uri')
        app.config['SQLALCHEMY_BINDS'] = bds
        # app.config['SQLALCHEMY_BINDS'] = {current_user:data.get('uri')}
        # print(current_app.config['SQLALCHEMY_BINDS'])
        s1 = current_user + "_uri"
        session[s1] = data.get('uri')
        Base = automap_base()
        Base.prepare(db.get_engine(app, current_user), reflect=True)
        sess = db.create_scoped_session(options={'bind': db.get_engine(app, current_user)})
        try:
            # sess.query("1").from_statement(text("SELECT 1")).all() # mysql?
            sess.execute('SELECT 1')
        except:
            abort(404, "Connection Failed")
        tables = sorted(Base.classes.keys())
        return jsonify(tables)

api.add_resource(DBSet, '/dbset')

# get columns list of the chosen table
class TableSet(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        # print(data)
        if not data:
            abort(400, "The request json is none")
        current_user=get_jwt_identity()
        bds = current_app.config['SQLALCHEMY_BINDS']
        bds[current_user] = session.get(current_user+"_uri")
        app.config['SQLALCHEMY_BINDS'] = bds
        # print(current_app.config['SQLALCHEMY_BINDS'])
        s2 = current_user + "_tb_name"
        session[s2] = data.get('table_name')
        myTable, sess = getTableAndDBsession(current_user, data.get('table_name'))
        sess.close()
        columns = myTable.__table__.columns.keys()
        dt_list = []
        for c in myTable.__table__.columns:
            dt_list.append({"c_name":str(c.name),"c_type":str(c.type)})
        return jsonify(dt_list)

api.add_resource(TableSet, '/tbset')


# shows the list of all employees, and lets you POST to add new employees
class ItemsList(Resource):
    @jwt_required()
    def get(self):
        current_user=get_jwt_identity()
        bds = current_app.config['SQLALCHEMY_BINDS']
        bds[current_user] = session.get(current_user+"_uri")
        app.config['SQLALCHEMY_BINDS'] = bds
        # print(current_app.config['SQLALCHEMY_BINDS'])
        myTable, sess = getTableAndDBsession(current_user, session.get(current_user+"_tb_name"))
        results = sess.query(myTable).all()
        sess.close()
        # print("anmenzhebian: ", jsonify([r.as_dict() for r in results]).json())
        return jsonify([r.as_dict() for r in results])

    @jwt_required()
    def post(self):
        data = request.get_json()
        if not data:
            abort(400, "The request json is none")
        # print(data)
        if not check_perms(Perms.CREATE):
            abort(403, "CREATE permission are required to perform this operation")
        current_user=get_jwt_identity()
        bds = current_app.config['SQLALCHEMY_BINDS']
        bds[current_user] = session.get(current_user+"_uri")
        app.config['SQLALCHEMY_BINDS'] = bds
        myTable, sess = getTableAndDBsession(current_user, session.get(current_user+"_tb_name"))
        new_item = myTable(**data)
        sess.add(new_item)
        # sess.flush()
        # id_ = new_item.id
        sess.commit()
        mylog = OpsLog(
            username = get_jwt_identity(),
            timestamp = datetime.now(),
            db_uri = app.config['SQLALCHEMY_BINDS'][current_user],
            tb_name = myTable.__table__.name,
            operation='CREATE',
            request_body = json.dumps(data)
        )
        mylog.save()
        sess.close()
        return jsonify({"message":"Item Added"})

api.add_resource(ItemsList, '/items')

# shows a single employee and lets you edit or delete an item
class Item(Resource):
    @jwt_required()
    def get(self, id):
        current_user=get_jwt_identity()
        bds = current_app.config['SQLALCHEMY_BINDS']
        bds[current_user] = session.get(current_user+"_uri")
        app.config['SQLALCHEMY_BINDS'] = bds
        myTable, sess = getTableAndDBsession(current_user, session.get(current_user+"_tb_name"))
        item = sess.query(myTable).get(id)
        if item is None:
            abort(400, "Item {} doesn't exist".format(id))
        sess.close()
        return jsonify(item.as_dict())

    @jwt_required()
    def delete(self, id):
        current_user=get_jwt_identity()
        bds = current_app.config['SQLALCHEMY_BINDS']
        bds[current_user] = session.get(current_user+"_uri")
        app.config['SQLALCHEMY_BINDS'] = bds
        myTable, sess = getTableAndDBsession(current_user, session.get(current_user+"_tb_name"))
        item = sess.query(myTable).get(id)
        if item is None:
            abort(400, "Item {} doesn't exist".format(id))
        if not check_perms(Perms.DELETE):
            abort(403, "DELETE permission are required to perform this operation")
        sess.delete(item)
        sess.commit()
        mylog = OpsLog(
            username = get_jwt_identity(),
            timestamp = datetime.now(),
            db_uri = app.config['SQLALCHEMY_BINDS'][current_user],
            tb_name = myTable.__table__.name,
            operation='DELETE',
            ops_obj_id = id
        )
        mylog.save()
        sess.close()
        return jsonify({'message': 'Item Deleted'})

    @jwt_required()
    def put(self, id):
        data = request.get_json()
        if not data:
            abort(400, "The request json is none")
        # print("data: ", data)
        current_user=get_jwt_identity()
        bds = current_app.config['SQLALCHEMY_BINDS']
        bds[current_user] = session.get(current_user+"_uri")
        app.config['SQLALCHEMY_BINDS'] = bds
        myTable, sess = getTableAndDBsession(current_user, session.get(current_user+"_tb_name"))
        if not check_perms(Perms.UPDATE):
            abort(403, "UPDATE permission are required to perform this operation")
        item = sess.query(myTable).filter(myTable.id==id)
        if item is None:
            abort(400, "Item {} doesn't exist".format(id))
        # for key, value in data.items():
        #     setattr(item, key, value)
        item.update(data)
        sess.commit()
        mylog = OpsLog(
            username=get_jwt_identity(),
            timestamp = datetime.now(),
            db_uri = app.config['SQLALCHEMY_BINDS'][current_user],
            tb_name = myTable.__table__.name,
            operation='UPDATE',
            ops_obj_id = id,
            request_body = json.dumps(data)
        )
        mylog.save()
        sess.close()
        return jsonify({"message":"Item Updated"})

api.add_resource(Item, '/items/<id>')

class SignUp(Resource):
    def post(self):
        data = request.get_json()
        if not data:
          abort(400, "The request json is none")
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
        return jsonify({"message":"User created successfuly"})

api.add_resource(SignUp, '/signup')

class Login(Resource):
    def post(self):
        data = request.get_json()
        if not data:
          abort(400, "The request json is none")
        username=data.get('username')
        password=data.get('password')
        db_user=Users.query.filter_by(username=username).first()
        if db_user and check_password_hash(db_user.password, password):
            access_token=create_access_token(identity=db_user.username)
            refresh_token=create_refresh_token(identity=db_user.username)
            return jsonify({"access_token":access_token,"refresh_token":refresh_token})
        else:
            abort(401, "Invalid username or password")

api.add_resource(Login, '/login')

class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        current_user=get_jwt_identity()
        # print(current_user)
        new_access_token=create_access_token(identity=current_user)
        return jsonify({"access_token":new_access_token})

api.add_resource(Refresh, '/refresh')

# get current user name
class GetUser(Resource):
    @jwt_required()
    def get(self):
        current_user=get_jwt_identity()
        # print(current_user)
        return jsonify({"uname":current_user})

api.add_resource(GetUser, '/getUser')

# get the list of all logs
class LogsList(Resource):
    @jwt_required()
    def get(self):
        logs = OpsLog.query.order_by(OpsLog.timestamp.desc()).all()
        return jsonify([log.to_json() for log in logs])

api.add_resource(LogsList, '/logs')

# get the list of all users
class UsersList(Resource):
    @jwt_required()
    def get(self):
        users = Users.query.all()
        return jsonify([user.to_json() for user in users])

api.add_resource(UsersList, '/users')

# update the permission of an user
class Permission(Resource):
    @jwt_required()
    def put(self, id):
        data = request.get_json()
        if not data:
            abort(400, "The request json is none")
        # print(data)
        if not check_perms(Perms.ADMIN):
            abort(403, "ADMIN permission are required to perform this operation")
        target_user = db_user=Users.query.filter_by(id=id).first()
        if target_user is None:
            abort(400, "User {} doesn't exist".format(id))
        target_user.permission = data.get('permission')
        db.session.commit()
        return jsonify({"message":"permission updated"})

api.add_resource(Permission, '/perms/<id>')

class Logout(Resource):
    @jwt_required()
    def get(self):
        current_user=get_jwt_identity()
        app.config['SQLALCHEMY_BINDS'].pop(current_user, None)
        s1 = current_user + "_uri"
        s2 = current_user + "_tb_name"
        session[s1] = False
        session[s2] = False

api.add_resource(Logout, '/out')


if __name__ == "__main__":
    # app.run(debug=True)
    app.run()
