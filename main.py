from website import create_app
from flask import Flask, redirect

app = create_app()

@app.route("/open-omron")
def open_omron():
    return redirect("https://play.google.com/store/apps/details?id=jp.co.omron.healthcare.omron_connect")

@app.route("/open-healthtree")
def open_healthtree():
    return redirect("https://play.google.com/store/apps/details?id=com.jks.Spo2MonitorEx")

@app.route("/open-medm")
def open_medm(): 
    return redirect("https://play.google.com/store/apps/details?id=com.beurer.healthmanager")

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=10000, debug=True)

