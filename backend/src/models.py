from settings import db

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

if __name__ == "__main__":
    db.create_all()