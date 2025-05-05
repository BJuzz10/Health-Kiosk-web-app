from flask import Flask, request
from packages import filter_backend

app = filter_backend()

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=10000, debug=True)