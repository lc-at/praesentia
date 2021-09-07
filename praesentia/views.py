from flask import abort, jsonify, render_template, request

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

    if not (username and password and lat and long and qr_data):
        return abort(403)

    sqp = SimasterQrPresence()

    if not sqp.login(username, password):
        return jsonify(ok=False, message='Login failed', data={})

    qrp_status, _, qrp_message = sqp.send_qr_presence(
        qr_data, lat, long)
    return jsonify(ok=(qrp_status == 200), message=qrp_message)
