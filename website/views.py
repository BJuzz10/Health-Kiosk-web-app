from flask import Blueprint, render_template, jsonify, request, redirect

views = Blueprint('views', __name__) 

@views.route('/')
def home():
    return render_template("index.html")

# The rest of your routes
@views.route("/get_health_data", methods=["POST"]) #app.route ito sa mk3
def get_health_data():
    name = request.form.get("name")
    age = request.form.get("age")
    sex = request.form.get("sex")

    data = {
        "NAME": name,
        "AGE": age,
        "SEX": sex,
    }
    return jsonify(data)

@views.route("/open-omron")
def open_omron():
    return redirect("https://play.google.com/store/apps/details?id=jp.co.omron.healthcare.omron_connect")

@views.route("/open-healthtree")
def open_healthtree():
    return redirect("https://play.google.com/store/apps/details?id=com.jks.Spo2MonitorEx")

@views.route("/open-medm")
def open_medm(): 
    return redirect("https://play.google.com/store/apps/details?id=com.beurer.healthmanager")