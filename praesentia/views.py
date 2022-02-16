from flask import abort, jsonify, render_template, request
from itsdangerous import json

from . import app
from .simaster import SimasterQrPresence


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/api/qr_scan', methods=['POST'])
def qr_scan():
    username = request.form.get('username')
    password = request.form.get('password')
    lat = request.form.get('lat')
    long = request.form.get('long')
    qr_data = request.form.get('qr_data')

    if (not username.startswith('token:') or not (username and password)) \
            and not (lat and long and qr_data):
        return abort(403)

    sqp = SimasterQrPresence()

    if username.startswith('token:'):
        if not sqp.load_session(username):
            return jsonify(ok=False, message='Invalid session')
    elif not sqp.login(username, password):
        return jsonify(ok=False, message='Login failed')

    qrp_status, _, qrp_message = sqp.send_qr_presence(
        qr_data, lat, long)
    token = sqp.serialize_session()
    return jsonify(ok=(qrp_status == 200), message=qrp_message, token=token)
