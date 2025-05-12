from flask import Flask, request, Blueprint, jsonify
import os
from flask_cors import CORS, cross_orgin

def filter_backend():
    app = Flask(__name__)
    CORS(app) #, origins="*")
    
    app.secret_key = 'my_secret_key'
    app.config['SESSION_PERMANENT'] = True 

    from .log import log
    from .filt import filt
    from .download import down

    app.register_blueprint(log)
    app.register_blueprint(filt)
    app.register_blueprint(down)

    return app 
