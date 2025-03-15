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

#def signup
def signup():
    print("Sign up...")
    email = input("Enter your email: ")
    password = input("Enter your password: ")
    try:
        user = auth.create_user_with_email_and_password(email, password)
        uid = user['localID']
    except pyrebase.pyrebase.AuthError as e:
        print(f"Error during sign up: {e}")
    return

def login():
    print("Log in...")
    email = input("Enter your email: ")
    password = input("Enter your password: ")
    try:
        user = auth.sign_in_with_email_and_password(email, password)
        #print(f"Log in successful! Welcome {email}!")
    except pyrebase.pyrebase.AuthError as e:
        print(f"Error during sign up: {e}")
    
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