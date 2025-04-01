from flask import Flask, Blueprint, request, jsonify, session, make_response
from datetime import datetime

log = Blueprint('log', __name__)

#Temporary storage for log in time, use in database storage in frontend
user_logins = {}

@log.route('/logtime', methods=['POST']) #pang curl ng log in time ng user
def log_time():
    user_id = request.form.get('user_id') #get user id through curl
    if not user_id:
        return jsonify({"error": "User ID required"}), 400

    #stores in session
    session['user_id'] = user_id #saves user id in session

    session['login_time'] = str(datetime.now().strftime("%m/%d/%Y %H:%M"))#nilagyan ko ng strftime
    session.permanent = True
    print("Session set:", session)
    user_logins[user_id] = session['login_time'] #stored login times of the user

    print(f"User:{user_id} logged in at {user_logins[user_id]}")#debugging purposes
    """return jsonify({"message": "Login time recorded", "user_id": user_id, "datetime": str(session['login_time'])}), 200"""

    response = make_response(jsonify({
        "datetime": user_logins[user_id],
        "message": "Login time recorded",
        "user_id": user_id
    }))
    #response.set_cookie("user_id", user_id)#, session.sid) #set session cookie
    response.set_cookie('datetime', user_logins[user_id])
    print(f"Cookies set:", response.headers.getlist('Set-Cookie'))#{response.set_cookie("user_id", user_id)}") #debug purp I think 
    return response
