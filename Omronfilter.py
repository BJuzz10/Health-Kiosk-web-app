from flask import Flask, request 
from packages import filter_backend

app = filter_backend()

if __name__ == '__main__':
    app.run(debug=True)