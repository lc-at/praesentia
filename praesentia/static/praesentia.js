QrScanner.WORKER_PATH = 'static/qr-scanner/qr-scanner-worker.min.js';

let qrData = '';
let tokenAuth = false;
let capture, worker;

function processQrImage(file, hide_alert = false) {
    $('#qrData').text('scanning...');
    return QrScanner.scanImage(file, null, worker).then((decodedText) => {
        qrData = decodedText;
        $('#qrData').text(decodedText.slice(0, 20) + '...');
        $('#btnSubmit').focus();
        if ($('#autoSubmit').prop('checked')) {
            $('#btnSubmit').click();
        }
        $('#hasQrData').show();
        return true;
    }).catch(err => {
        if (!hide_alert)
            swal.fire('Error', 'Cannot read QR code. ' +
                'Please make sure that it is an image that contains a QR code.', 'error');
        $('#qrImageFile').val('');
        $('#hasQrData').hide();
        $('#qrData').text('-');
        return false;
    });
}

function randomizeLatLong() {
    // CENTER TO JAKARTA
    const y0 = -6.121435;
    const x0 = 106.774124;
    // RANDOMIZE WITHIN R=300 KM
    const rd = 300000 / 111300;

    const u = Math.random();
    var v = Math.random();

    const w = rd * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const x = w * Math.cos(t);
    const y = w * Math.sin(t);

    return {
        'latitude': y + y0,
        'longitude': x + x0
    };
}

async function scanVideoStream(imageData) {
    const image = await createImageBitmap(imageData);
    if (await processQrImage(image, true)) {
        stopCapture();
    }
};

async function startCapture() {
    try {
        await capture.startCapture();
        $('#btnStartScreenSharing').prop('disabled', true);
        $('#btnStopScreenSharing').prop('disabled', false);
    } catch (err) {
        console.error(err);
    }
}


function stopCapture() {
    $('#btnStartScreenSharing').prop('disabled', false);
    $('#btnStopScreenSharing').prop('disabled', true);

    capture.stopCapture();
}

$('body').on('paste', event => {
    let paste = event.originalEvent.clipboardData || window.clipboardData;
    if (paste.files.length > 0) {
        processQrImage(paste.files[0]);
        event.preventDefault();
    }
});

$('#qrImageFile').on('change', event => {
    processQrImage(event.target.files[0]);
});

$('#hurry').click(function () {
    if ($('#hurry').prop('checked')) {
        const randomLocation = randomizeLatLong()
        $('#latitude').val(randomLocation.latitude);
        $('#longitude').val(randomLocation.longitude);
    }
    $('#coordinateInputs').fadeToggle();
});

$('#btnSubmit').click(function () {
    const username = $('#username').val();
    const password = $('#password').val();
    const lat = $('#latitude').val();
    const long = $('#longitude').val();

    if ((!tokenAuth && (username.length <= 0 || password.length <= 0)) || lat.length <= 0 || long.length <= 0 || qrData.length <= 0) {
        return swal.fire('Error', 'Please make sure to fill out all the fields.', 'error');
    }

    if ($('#rememberMe').prop('checked')) {
        if (!tokenAuth) {
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
        }
        localStorage.setItem('lat', lat);
        localStorage.setItem('long', long);
        localStorage.setItem('auto_submit', $('#autoSubmit').prop('checked'));
    } else {
        localStorage.clear();
    }

    $('#btnSubmit').prop('disabled', true);
    $.post('api/qr_scan', {
        username: username,
        password: password,
        lat: lat,
        long: long,
        qr_data: qrData,
    }, function (data) {
        const title = data.ok ? 'Success' : 'Error';
        let extra_message = '';
        if (data.token) {
            extra_message = `<div class="token">${data.token}</div>`;
        }
        return swal.fire({
            title: title,
            html: `<code>${data.message}</code>${extra_message}`,
            icon: title.toLowerCase(),
        })
    }).fail(function () {
        return swal.fire('Err...', 'Something happened. Please try again.', 'error')
    }).always(() => $('#btnSubmit').prop('disabled', false));
});

$('#getLocation').click(function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            $('#latitude').val(position.coords.latitude);
            $('#longitude').val(position.coords.longitude);
        });
    } else {
        swal.fire('Ooops...', 'Geolocation is not supported by this browser.', 'info');
    }
});

$('#qrCodeSourceSelect').on('change', function () {
    [$('#qrFileInput'), $('#qrScreenInput')].forEach(e => e.hide());
    $('#' + $(this).val()).show();
});

$('#btnStartScreenSharing').click(function () {
    startCapture();
});

$('#btnStopScreenSharing').click(function () {
    stopCapture();
});

$('#username').on('keyup', function () {
    console.log($(this).val())
    if ($(this).val().startsWith('token:')) {
        $('#passwordContainer').hide();
        tokenAuth = true;
    } else {
        $('#passwordContainer').show();
        tokenAuth = false;
    }
});

$(document).ready(async function () {
    $('#hasQrData').hide();
    if (localStorage.getItem('username')) {
        $('#username').val(localStorage.getItem('username'));
        $('#password').val(localStorage.getItem('password'));
        $('#latitude').val(localStorage.getItem('lat'));
        $('#longitude').val(localStorage.getItem('long'));
        $('#rememberMe').prop('checked', true);
        $('#autoSubmit').prop('checked', localStorage.getItem('auto_submit'));
    }
    capture = new StreamDisplay(scanVideoStream);
    worker = await QrScanner.createQrEngine(QrScanner.WORKER_PATH);
});
