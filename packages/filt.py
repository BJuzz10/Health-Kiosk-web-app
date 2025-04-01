from flask import Flask, Blueprint, request, jsonify, session, make_response
import pandas as pd
from datetime import datetime
import io

filt = Blueprint('filt', __name__)

#user_logins from log.py
from .log import user_logins

@filt.route('/filter_csv', methods=['POST'])
def filter_csv():
    """user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error":"User ID required"}), 400"""

    login_time = request.cookies.get('datetime')
    if not login_time:
        return jsonify({"error":"User login time not found"}), 400
        
    file = request.files['file']  # Get the uploaded CSV file
    # Check if a file was uploaded
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    #
    df = pd.read_csv(file, header=None)  # Read CSV dynamically

    # Split the 'User details' column by semicolons
    split_data = df[0].str.split(';', expand=True)

    # Ensure only 3 expected columns (Date, Time, Temperature)
    split_data = split_data.iloc[:, :3]
    split_data.columns = ['Date', 'Time', 'Temperature']

    # Drop the original combined column
    df.drop(columns=[0], inplace=True)

    # Concatenate the split data with the original DataFrame
    df = pd.concat([df, split_data], axis=1)

    # Remove rows 0 to 7 and reset the index
    df = df.iloc[8:].reset_index(drop=True)

    # Combine Date & Time columns
    df['Date&Time'] = pd.to_datetime(df['Date'] + ' ' + df['Time'])
    df.drop(['Date', 'Time'], axis=1, inplace=True)

    """#inputs the time of user logging in the web app
    input_time = user_logins[user_id]
    if input_time is None:
        return jsonify({"error":"User login time not found"}), 404"""

    # Filter the dataframe
    filtered_df = df[df['Date&Time'] >= login_time] #compare csv time to login time

    # Convert filtered DataFrame to CSV in memory
    output3 = io.StringIO()
    filtered_df.to_csv(output3, index=False)
    output3.seek(0)

    return output3.getvalue(), 200, {'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=Filtered_Output3.csv'}
