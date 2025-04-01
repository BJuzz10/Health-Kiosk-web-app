from flask import Flask, Blueprint, request, jsonify, session, make_response
import pandas as pd
from datetime import datetime 
import io

filt = Blueprint('filt', __name__)

from .log import user_logins

@filt.route('/filter_csv', methods=['POST'])
def filter_csv():
    login_time = datetime.strptime(request.cookies.get('datetime'), "%m/%d/%Y %H:%M")
    if not login_time:
        return jsonify({"error":"User login time not found"}), 400

    file = request.files['file'] 
    if 'file' not in request.files:
        return jsonify({"error":"No file uploaded"}), 400
    #reads csv file
    df = pd.read_csv(file)#, header=None) 
    # Convert 'Measurement Date' to datetime format (adjust column name as needed)
    df['Measurement Date'] = pd.to_datetime(df['Measurement Date'], format="%m/%d/%Y %H:%M", errors='coerce')
    
    #time value
    custom_dt = login_time
    
    #filter data frame
    filtered_df = df[df['Measurement Date'] >= custom_dt]
    
    #remove unecessary columns
    fildf = filtered_df[['Measurement Date','SYS(mmHg)','DIA(mmHg)']]
    #print(pd.DataFrame(fildf)) 
    #convert filtered dataframe to csv in memory
    output = io.StringIO()
    fildf.to_csv(output, index=False)
    output.seek(0)

    return output.getvalue(), 200, {'Content-Type':'text/csv','Content-Disposition':'attachment; filename=FilteredOmron.csv'}

    