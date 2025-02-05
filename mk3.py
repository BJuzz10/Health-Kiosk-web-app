from flask import Flask, render_template, jsonify, request

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
    bp = request.form.get("bp")  
    oxi = request.form.get("oxygen")
    temp = request.form.get("temp")

    data = {
        "NAME": name,
        "AGE": age,
        "SEX": sex,
        "blood_pressure(mmHg)": bp,
        "oxygen_saturation(%)": oxi,
        "temperature(°C)": temp,
    }
    return jsonify(data)

if __name__ == "__main__":
    app.run(port=5003, debug=True)

    