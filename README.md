# Praesentia
Praesentia is a simple Python-based web application to allow UGM students to fill their QR presence list without having another device in hand.

## How to use
You can use an image file containing a QR code (can be obtained using a screenshot). Alternatively, you can just directly use the camera.

## FAQ
### Demo?!
The demo is available at https://lcat.dev/praesentia. Don't expect a 99.99% uptime, the server is an old Raspberry Pi 3.
### Background?
- Many UGM students are required to use SIMASTER mobile app to scan QR codes to fill their presence list. This mostly means that a student needs at least two devices to make the mechanism works.
- Two devices are not always available.
### API Source?
I decompiled SIMASTER mobile app to get the source code. I also used interceptors to quickly recognize what was being sent and received.
### How does it work?
It works just like scanning QR in the SIMASTER mobile app.
### Side-effect?
I don't think there is any except that you will get logged out of your SIMASTER app on your phone (just re-login, it will work again). I have never done research
about the API's rate-limiting or any possible ban.

## Installation and Deployment
Installation of Praesentia is fairly straightforward. You just need at least Python 3.6.
### Installing requirements
This app only requires `flask` (to serve the web) and `requests` library (to call the API). You can install both using pip.
```
pip install flask requests
```
It is recommended but not necessary to separate an app's environment by using a virtual environment (e.g. `venv`).
### Deployment
There are many ways to deploy Praesentia. You can use the following (but not limited to) ways:
- Gunicorn
```
gunicorn -b :6749 wsgi:app
```
- Flask development server
```
python wsgi.py
```

## Contribution
Contribution in any form will be highly appreciated.

## License
This project is licensed using MIT License.
