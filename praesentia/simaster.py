import base64
import random
import string

import requests


class SimasterQrPresence:
    BASIC_AUTH_KEY = 'integrasiPresensiQR:serv1CEintegrasi-Pre$en$iGHQR'
    SIMASTER_URL = 'https://simaster.ugm.ac.id'
    LOGIN_URL = f'{SIMASTER_URL}/services/simaster/service_login'
    COMMIT_DEVICE_URL = f'{SIMASTER_URL}/services/simaster/commit_device'
    QRP_TOKEN_REQUEST_URL = f'{SIMASTER_URL}/services/presensiqr/request_token'
    QRP_SCAN_URL = f'{SIMASTER_URL}/services/presensiqr/doscanent'
    QRP_AUTH_HEADER = {
        'Authorization': f'Basic {base64.b64encode(BASIC_AUTH_KEY.encode()).decode()}'}
    HEADERS = {
        'UGMFWSERVICE': '1',
        'User-Agent': 'Praesentia/1.0.0'
    }

    def __init__(self, a_id=None):
        self.a_id = a_id if a_id else self._generate_random_a_id()
        self.logged_in = False
        self.session_id = None
        self.group_id = None
        self.session = requests.Session()
        self.session.headers.update(self.HEADERS)

    def login(self, username, password):
        req = self.session.post(self.LOGIN_URL, data={
            'aId': self.a_id,
            'username': username,
            'password': password,
        })
        if req.status_code != 200:
            return False

        self.logged_in = True

        data = req.json()
        self.session_id = data['sesId']
        self.group_id = data['groupMenu']
        return self._commit_device()


    def load_session(self, serialized_session):
        try:
            _, session_id, group_id = serialized_session.split(':')
        except ValueError:
            return False

        self.session_id = session_id
        self.group_id = group_id
        self.logged_in = True
        return True

    def serialize_session(self):
        return f'token:{self.session_id}:{self.group_id}'

    def send_qr_presence(self, qr_data, lat, long):
        token = self._request_token()
        if not token:
            return None
        data = self.session.post(self.QRP_SCAN_URL, headers={**self.QRP_AUTH_HEADER},
                                 data={
            token['token']: token['value'],
            'device': self.session_id,
            'group': self.group_id,
            'code': qr_data,
            'latitudeGps': lat,
            'longitudeGps': long,
        }).json()
        return data['status'], data['heading'], data['message']

    def _commit_device(self):
        if not self.logged_in:
            return False
        req = self.session.post(self.COMMIT_DEVICE_URL, data={
            'sesId': self.session_id
        })
        return req.status_code == 200

    def _request_token(self):
        if not self.logged_in:
            return {}
        req = self.session.get(self.QRP_TOKEN_REQUEST_URL, headers={
            **self.QRP_AUTH_HEADER
        })
        if not req.status_code == 200:
            return {}
        return req.json()

    @staticmethod
    def _generate_random_a_id():
        return ''.join(random.choice(string.hexdigits) for _ in range(16)).lower()
