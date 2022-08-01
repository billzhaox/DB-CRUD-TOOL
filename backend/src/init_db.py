import sqlite3
# from settings import db
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_jwt_extended import JWTManager

# Instantiation
app = Flask(__name__)
api = Api(app)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///myweb.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = b'\xfd(0\xec0e\xcd`\x94~\x17\xdb<m\x98\xca'
# Database
db = SQLAlchemy(app)
JWTManager(app)

def connect_to_db():
    conn = sqlite3.connect('myweb.db')
    return conn

# __tablename__ = 'employee'
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     name = db.Column(db.String(100), nullable=False)
#     email = db.Column(db.String(100), nullable=False)
#     department = db.Column(db.String(100), nullable=False)

def create_db_table():
    try:
        conn = connect_to_db()
        conn.execute('''
            CREATE TABLE employee (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                department TEXT NOT NULL
            );
        ''')

        conn.commit()
        print("Employee table created successfully")
    except:
        print("Employee table creation failed")
    finally:
        conn.close()

    

# db.reflect()
# all_table = {table_obj.name: table_obj for table_obj in db.get_tables_for_bind()}
# a = db.session.query(all_table["employee"]).all()
# print(a)
# db.Model.metadata.reflect(db.engine)
# # print(db.Model.metadata.tables['employee'])


# class Employees(db.Model):
#     __tablename__ = 'employee'


# ee = Employees()
# table_columns = str(ee.__table__.columns)
# print(table_columns)

from sqlalchemy.ext.automap import automap_base

if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///myweb.db'
    Base = automap_base()
    Base.prepare(db.engine, reflect=True)

    myTable = Base.classes.employee
    # new_t = myTable(name='New Product', email='50@abc.com', department='1000')
    # db.session.add(new_t)
    # db.session.commit()
    results = db.session.query(myTable).all()
    for r in results:
        print(r.name)

    # class myTable(Base, db.Model):
    #     __tablename__ = 'employee'


    # employees = myTable.query.all()
    # for r in employees:
    #    print(r.email)
    for x in Base.classes:
        print(x)
    print(Base.classes['employee'])

