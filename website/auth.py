#from flask import Blueprint, render_template
import pyrebase
import psycopg2
from flask_sqlalchemy import SQLAlchemy
from flask import Flask

firebase_config = {
    'apiKey': "AIzaSyBi9PX6ZgjmuHbE2wQ27CMeRZrMy6Zs6N4",
    'authDomain': "health-kiosk-ce33f.firebaseapp.com",
    'projectId': "health-kiosk-ce33f",
    'storageBucket': "health-kiosk-ce33f.appspot.com",
    'messagingSenderId': "713733059727",
    'appId': "1:713733059727:web:9d01b7fb55ed25f3902cfa",
    'measurementId': "G-GV8SFDDTFR",
    'databaseURL': "",
}
#Firebase initialization 
firebase=pyrebase.initialize_app(firebase_config)
auth=firebase.auth()

#Flask app and postgre connection
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://db-healthkiosk-instance-1.cp6c4goakaid.ap-southeast-2.rds.amazonaws.com"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False 
db = SQLAlchemy(app)

#define user model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)

# Create Table
with app.app_context():
    db.create_all()

#def signup
def signup():
    print("Sign up...")
    email = input("Enter your email: ")
    password = input("Enter your password: ")
    try:
        user = auth.create_user_with_email_and_password(email, password)
        uid = user['localID']
        #Store user in PostgreSQL
        new_user = User(uid=uid, email=email)
        db.session.add(new_user)
        db.session.commit()
        print(f"User {email} successfully registered.")
    except Exception as e:
        print(f"Error {e}")
    return

def login():
    print("Log in...")
    email = input("Enter your email: ")
    password = input("Enter your password")
    try:
        user = auth.sign_in_with_email_and_password(email, password)
        print(f"Login Successful! Welcome {email}!")
    except Exception as e:
        print(f"Login failed: {e}")
    
ans = input("Are you a new user?[y/n]")

if ans == "n":
    login()
elif ans == "y":
    signup()
else:
    print("Invalid input. Please enter 'y' or 'n' ONLY! >:[ ")

"""
auth = Blueprint('auth', __name__) 

@auth.route('/login')
def login():
    return render_template("login.html")

@auth.route('/logout')
def logout():
    return "<p>Logout</p>"

@auth.route('/sign-up')
def sign_up():
    return "<p>Sign Up</p>"
"""