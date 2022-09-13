from settings import db
from datetime import datetime

# class Employees(db.Model):
#     __tablename__ = 'employee'
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     name = db.Column(db.String(100), nullable=False)
#     email = db.Column(db.String(100), nullable=False)
#     department = db.Column(db.String(100), nullable=False)

#     def to_json(self):
#         return {
#             'id': self.id,
#             'name': self.name,
#             'email': self.email,
#             'department': self.department
#         }
    
#     def save(self):
#         db.session.add(self)
#         db.session.commit()

#     def delete(self):
#         db.session.delete(self)
#         db.session.commit()
    
#     def update(self, data):
#         self.name = data.get('name')
#         self.email = data.get('email')
#         self.department = data.get('department')
#         db.session.commit()

class Users(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer,primary_key=True, autoincrement=True)
    username = db.Column(db.String(25),nullable=False,unique=True)
    email = db.Column(db.String(80),nullable=False)
    password = db.Column(db.Text(),nullable=False)
    permission = db.Column(db.Integer,nullable=False)

    def __repr__(self):
        return f"<User {self.username}>"

    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def has_permission(self, perm):
        return self.permission & perm == perm
    
    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'permission': self.permission
        }

class OpsLog(db.Model):
    __tablename__ = 'ops_log'
    id = db.Column(db.Integer,primary_key=True, autoincrement=True)
    username = db.Column(db.String(25), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now)
    db_uri = db.Column(db.Text(), nullable=False)
    tb_name = db.Column(db.Text(), nullable=False)
    operation = db.Column(db.String(25),nullable=False)
    ops_obj_id = db.Column(db.Integer,nullable=True)
    request_body = db.Column(db.Text(),nullable=True)

    def save(self):
        db.session.add(self)
        db.session.commit()
    
    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'timestamp': self.timestamp,
            'db_uri': self.db_uri,
            'tb_name': self.tb_name,
            'operation': self.operation,
            'ops_obj_id': self.ops_obj_id,
            'request_body': self.request_body
        }

if __name__ == "__main__":
    db.create_all()