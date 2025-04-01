from flask import Flask, request, jsonify, Blueprint
import os

def filter_backend():
    app = Flask(__name__)

    app.secret_key = 'my_secret_key'
    app.config['SESSION_PERMANENT'] = True
    
    from .log import log
    from .filt import filt

    app.register_blueprint(log)#, url_prefix='/logtime')
    app.register_blueprint(filt)#, url_prefix='/filter_csv') 

    return app