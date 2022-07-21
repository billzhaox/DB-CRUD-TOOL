from settings import db
from datetime import datetime

class Employees(db.Model):
    __tablename__ = 'employee'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)

    def to_json(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'department': self.department
        }

class Users(db.Model):
    __tablename__ = 'user'
    id=db.Column(db.Integer,primary_key=True, autoincrement=True)
    username=db.Column(db.String(25),nullable=False,unique=True)
    email=db.Column(db.String(80),nullable=False)
    password=db.Column(db.Text(),nullable=False)

    def __repr__(self):
        return f"<User {self.username}>"


    def save(self):
        db.session.add(self)
        db.session.commit()

class OpsLog(db.Model):
    __tablename__ = 'ops_log'
    id=db.Column(db.Integer,primary_key=True, autoincrement=True)
    username=db.Column(db.String(25), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)
    operation=db.Column(db.String(25),nullable=False)
    ops_obj=db.Column(db.String(25),nullable=False)
    request_body=db.Column(db.Text())

    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'timestamp': self.timestamp,
            'operation': self.operation,
            'ops_obj': self.ops_obj,
            'request_body': self.request_body
        }

if __name__ == "__main__":
    db.create_all()