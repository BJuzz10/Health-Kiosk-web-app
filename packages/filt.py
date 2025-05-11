from flask import Flask, request, Blueprint, jsonify, session, make_response
import pandas as pd
#from datetime import datetime
import io 

filt = Blueprint('filt', __name__)

#from .log import user_logins

@filt.route('/filter_csv', methods=['POST'])
def filter_csv():
    try:
        file = request.files['file']
        if 'file' not in request.files:
            return jsonify({"error":"No file uploaded"}), 400
    
        #read xls file from healthtree 
        df = pd.read_excel(file) #for this either .xls or .xlrd idk basta install openpyxl and xlrd nlng pag ganyan
        
        #remain the first row
        filtered_df = df.iloc[:1]
        
        #jsonified
        json_data = filtered_df.to_dict(orient='records')
    
        return jsonify({"filtered_data": json_data}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
    