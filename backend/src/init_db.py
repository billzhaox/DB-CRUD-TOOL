import sqlite3

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

    

if __name__ == "__main__":
    # try:
    #     conn = connect_to_db()
    #     conn.execute('''
    #         DROP TABLE employee;
    #     ''')

    #     conn.commit()
    #     print("successfully")
    # except:
    #     print("failed")
    # finally:
    #     conn.close()
    create_db_table()