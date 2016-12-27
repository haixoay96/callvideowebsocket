var pc;
$('#buttonLogin').on('click', function() {
    var name = $('#inputLogin').val();
    pc = new peer(name);
    pc.onLogin = function(data) {
        alert(data);
    };
    pc.onCall = function(name) {
        $('#iscalling').modal('toggle');
        $('#iscalling').off('click');
        $('#iscalling').on('click', function(event) {
            var answer = event.target.getAttribute('answer');
            console.log(answer);
            if (answer === 'accept') {
                console.log('tu choi');
                $('#iscalling').modal('toggle');
                pc.reply(true);
                return;
            }
            if (answer === 'close') {
                $('#iscalling').modal('toggle');
                pc.reply(false);
                return;
            }
        });
        $('#hangup').off('click');
        $('#hangup').on('click', function() {
            console.log(name);
            pc.finish(name);
        });
        var idTime = setTimeout(function() {
            console.log('Huy cuoc goi!');
            pc.hangup();
        }, 20000);
        console.log('Co nguoi goi');
        pc.onLocalStream = function(stream) {
            $('#local').attr('src', window.URL.createObjectURL(stream));
        };
        pc.onRemoteStream = function(stream) {
            $('#remote').attr('src', window.URL.createObjectURL(stream));
        };
        pc.onCancel = function() {
            $('#iscalling').modal('toggle');
            console.log('cancel');
        };
        pc.onClose = function() {
            // Khi cuộc goi kết thúc đóng giao diện
            console.log('close');

        };
        pc.onSuccess = function() {
            clearTimeout(idTime);
            console.log('successfull');
        };
    };
});

//  $('#login-modal').modal('toggle')

$('#buttonCall').on('click', function() {
    var name = $('#inputCall').val();
    pc.call(name);
    $('#hangup').off('click');
    $('#hangup').on('click', function() {
        console.log(name);
        pc.finish(name);
    });
    var idTime = setTimeout(function() {
        console.log('Huy cuoc goi!');
        pc.cancelCall(name);
    }, 10000);
    //call when want cancel call pc.cancelCall();
    pc.onReject = function() {
        clearTimeout(idTime);
        console.log('Tu choi');
    };
    pc.onAccept = function() {
        console.log('Chap nhan cuoc goi');
    };
    pc.onLocalStream = function(stream) {
        $('#local').attr('src', window.URL.createObjectURL(stream));
    };
    pc.onRemoteStream = function(stream) {
        $('#remote').attr('src', window.URL.createObjectURL(stream));
    };
    pc.onClose = function() {
        // Khi cuộc goi kết thúc đóng giao diện
        console.log('close');
    };
    pc.onSuccess = function() {
        clearTimeout(idTime);
        console.log('successfull');
    };
    pc.onFinish = function() {
            console.log('finish!');
            // đống giao diện
        }
        //call pc.hangup() when want to finish
});


DetectRTC.load(function() {
    DetectRTC.isScreenCapturingSupported
    DetectRTC.isSctpDataChannelsSupported
    DetectRTC.isRtpDataChannelsSupported
    DetectRTC.isAudioContextSupported
    DetectRTC.isWebRTCSupported
    console.log(DetectRTC.isWebRTCSupported);
    DetectRTC.isDesktopCapturingSupported
    DetectRTC.isMobileDevice

    DetectRTC.isWebSocketsSupported
    DetectRTC.isWebSocketsBlocked

    DetectRTC.isWebsiteHasWebcamPermissions        // getUserMedia allowed for HTTPs domain in Chrome?
    DetectRTC.isWebsiteHasMicrophonePermissions    // getUserMedia allowed for HTTPs domain in Chrome?

    DetectRTC.audioInputDevices    // microphones
    DetectRTC.audioOutputDevices   // speakers
    DetectRTC.videoInputDevices    // cameras

    DetectRTC.osName
    DetectRTC.osVersion
    console.log(DetectRTC.browser.name );
    DetectRTC.browser.name === 'Edge' || 'Chrome' || 'Firefox'
    DetectRTC.browser.version
    DetectRTC.browser.isChrome
    DetectRTC.browser.isFirefox
    DetectRTC.browser.isOpera
    DetectRTC.browser.isIE
    DetectRTC.browser.isSafari
    DetectRTC.browser.isEdge

    DetectRTC.browser.isPrivateBrowsing // incognito or private modes

    DetectRTC.isCanvasSupportsStreamCapturing
    DetectRTC.isVideoSupportsStreamCapturing

});
