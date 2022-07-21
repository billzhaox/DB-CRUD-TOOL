from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, get_jwt_identity, jwt_required

from models import Employees, Users, OpsLog
from settings import app, api, db
from datetime import datetime
import json

# Settings
CORS(app, resources=r'/*', supports_credentials=True)

# Routes

# shows the list of all employees, and lets you POST to add new employees
class EmployeesList(Resource):
    def get(self):
        employees = Employees.query.all()
        return jsonify([em.to_json() for em in employees])

    @jwt_required()
    def post(self):
        data = request.get_json()
        if not data:
            abort(404)
        print(data)
        employee = Employees(
            name=data.get('name'),
            email=data.get('email'),
            department=data.get('department')
        )
        db.session.add(employee)
        db.session.commit()
        mylog = OpsLog(
            username=get_jwt_identity(),
            timestamp = datetime.now(),
            operation='CREATE',
            ops_obj = data.get('name'),
            request_body = json.dumps(data)
        )
        mylog.save()
        return make_response(jsonify(employee.to_json()), 201)

api.add_resource(EmployeesList, '/employees')

# shows a single employee and lets you edit or delete an item
class Employee(Resource):
    def get(self, id):
        employee = Employees.query.get(id)
        if employee is None:
            abort(400, message="Employee {} doesn't exist".format(id))
        return jsonify(employee.to_json())

    @jwt_required()
    def delete(self, id):
        employee = Employees.query.get(id)
        if employee is None:
            abort(400, message="Employee {} doesn't exist".format(id))
        db.session.delete(employee)
        db.session.commit()
        mylog = OpsLog(
            username=get_jwt_identity(),
            timestamp = datetime.now(),
            operation='DELETE',
            ops_obj = data.get('name'),
            request_body = json.dumps(data)
        )
        mylog.save()
        return make_response(jsonify({'message': 'Item Deleted'}), 204)

    @jwt_required()
    def put(self, id):
        data = request.get_json()
        if not data:
            abort(404)
        employee = Employees.query.get(id)
        if employee is None:
            abort(400)
        employee.name = data.get('name')
        employee.email = data.get('email')
        employee.department = data.get('department')
        db.session.commit()
        mylog = OpsLog(
            username=get_jwt_identity(),
            timestamp = datetime.now(),
            operation='UPDATE',
            ops_obj = data.get('name'),
            request_body = json.dumps(data)
        )
        mylog.save()
        return make_response(jsonify(employee.to_json()), 201)

api.add_resource(Employee, '/employees/<id>')

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
