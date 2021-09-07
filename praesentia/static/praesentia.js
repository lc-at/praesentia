let qrData = '';
let html5QrcodeScanner = new Html5QrcodeScanner(
    'reader',
    {
        fps: 10,
        qrbox: 250,
    });


html5QrcodeScanner.render(onScanSuccess);

function onScanSuccess(decodedText, decodedResult) {
    $('#qrData').text(decodedText);
    qrData = decodedText;
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

    if (username.length <= 0 || password.length <= 0 || lat.length <= 0 || long.length <= 0 || qrData.length <= 0) {
        return swal.fire('Error', 'Please make sure to fill out all the fields.', 'error');
    }

    if ($('#rememberMe').prop('checked')) {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        localStorage.setItem('lat', lat);
        localStorage.setItem('long', long);
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
        return swal.fire({
            title: title,
            html: `Message:<pre>${data.message}</pre>`,
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

$(document).ready(function () {
    if (localStorage.getItem('username')) {
        $('#username').val(localStorage.getItem('username'));
        $('#password').val(localStorage.getItem('password'));
        $('#latitude').val(localStorage.getItem('lat'));
        $('#longitude').val(localStorage.getItem('long'));
        $('#rememberMe').prop('checked', true);
    }
});
