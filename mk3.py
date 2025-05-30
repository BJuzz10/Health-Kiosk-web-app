from flask import Flask, render_template, jsonify, request, redirect
import os 

# Explicitly set the template folder
app = Flask(__name__, template_folder="templates")

@app.route("/")
def home():
    return render_template("index.html")  # ✅ Loads 'templates/index.html'

# ✅ Allow user input from a FORM (not input())
@app.route("/get_health_data", methods=["POST"])
def get_health_data():
    # Get data from an HTML form
    name = request.form.get("name")
    age = request.form.get("age")
    sex = request.form.get("sex")
    
    data = {
        "NAME": name,
        "AGE": age,
        "SEX": sex,
        #"blood_pressure(mmHg)": bp,
        #"oxygen_saturation(%)": oxi,
        #"temperature(°C)": temp,
    }
    return jsonify(data)
@app.route("/open-omron") #dadalhin ka sa omron via deeplink, SANA MERON
def open_omron():
    return redirect("https://play.google.com/store/apps/details?id=jp.co.omron.healthcare.omron_connect") #Google playstore link
    
@app.route("/open-healthtree")
def open_healthtree(): #DEEPLINK NG HEALTHtREE NMN, SANA MERON
    return redirect("https://play.google.com/store/apps/details?id=com.jks.Spo2MonitorEx") #Google playstore link

@app.route("/open-medm")
def open_medm(): 
    return redirect("https://play.google.com/store/apps/details?id=com.beurer.healthmanager") #Google playstore link

if __name__ == "__main__":
    port = int(os.environ.get("PORT",10000)) #default port daw ni Render
    print(f"Starting server on port {port}...") #debugging info
    app.run(host="0.0.0.0", port=port) #Default port of Render

    
