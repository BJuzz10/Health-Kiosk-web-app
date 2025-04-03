from flask import Flask, request, Blueprint, jsonify
import os

def filter_backend():
    app = Flask(__name__)

    app.secret_key = 'my_secret_key'
    app.config['SESSION_PERMANENT'] = True 

    from .log import log
    from .filt import filt 

    app.register_blueprint(log)
    app.register_blueprint(filt)

    return app 