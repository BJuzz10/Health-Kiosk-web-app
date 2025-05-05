from flask import Flask, request, Blueprint, jsonify, session, make_response
import pandas as pd
from datetime import datetime
import io 

filt = Blueprint('filt', __name__)

from .log import user_logins

@filt.route('/filter_csv', methods=['POST'])
def filter_csv():
    try:
        login_time = datetime.strptime(request.cookies.get('datetime'), "%Y-%m-%d %H:%M:%S")
        if not login_time:
            return jsonify({"error":"User login time not found"}), 400
    
        file = request.files['file']
        if 'file' not in request.files:
            return jsonify({"error":"No file uploaded"}), 400
    
        #read xls file from healthtree 
        df = pd.read_excel(file) #for this either .xls or .xlrd idk basta install openpyxl and xlrd nlng pag ganyan
    
        #convert Time data to datetime format
        df['Time'] = pd.to_datetime(df['Time'], format="%Y-%m-%d %H:%M:%S", errors='coerce')
        print(df['Time'])
        #time value set
        custom_dt = login_time
    
        #compare data for filtering
        filtered_df = df[df['Time'] >= custom_dt]
        #print for debugging purp
        print(pd.DataFrame(filtered_df))
        
        """
        output = io.StringIO()
        filtered_df.to_csv(output, index=False)
        output.seek(0)
    
        return output.getvalue(), 200, {'Content-Type':'text/csv','Content-Disposition':'attachment; filename=Filteredhealthtree.csv'}
        """
        json_data = filtered_df.to_dict(orient='records')
    
        return jsonify({"filtered_data": json_data}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    