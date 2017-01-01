var pc;
$('#buttonLogin').on('click', function() {
    var name = $('#inputLogin').val();
    pc = new peer(name);
    pc.onLogin = function(data) {
        alert(data);
    };
    pc.onCall = function(name, video) {
        console.log(video);
        var idTime = setTimeout(function() {
            console.log('Huy cuoc goi!');
            $('#iscalling').modal('hide');
            pc.hangup();
        }, 20000);
        $('#iscalling').modal('show');
        $('#iscalling').off('click');
        $('#iscalling').on('click', function(event) {
            var answer = event.target.getAttribute('answer');
            console.log(answer);
            if (answer === 'accept') {
                console.log('tu choi');
                $('#iscalling').modal('hide');
                $('#myModal').modal('show');
                pc.reply(true);
                return;
            }
            if (answer === 'close') {
                $('#iscalling').modal('hide');
                clearTimeout(idTime);
                pc.reply(false);
                return;
            }
        });
        $('#hangup').off('click');
        $('#hangup').on('click', function() {
            console.log(name);
            pc.finish(name);
        });

        console.log('Co nguoi goi');
        pc.onLocalStream = function(stream) {
            $('#local').attr('src', window.URL.createObjectURL(stream));
        };
        pc.onRemoteStream = function(stream) {
            $('#remote').attr('src', window.URL.createObjectURL(stream));
        };
        pc.onSwitchVideo = function(status) {
            // when switch video
        };
        pc.onSwitchAudio = function(status) {
            // when switch audio
        };
        pc.onCancel = function() {
            clearTimeout(idTime);
            $('#iscalling').modal('hide');
            console.log('cancel');
        };
        pc.onClose = function() {
            // Khi cuộc goi kết thúc đóng giao diện
            clearTimeout(idTime);
            $('#myModal').modal('hide');
            console.log('close');

        };
        pc.onSuccess = function() {
            clearTimeout(idTime);
            console.log('successfull');
        };
        pc.onFinish = function() {
            console.log('finish!');
            $('#myModal').modal('hide');
            // đống giao diện
        };
    };
});

//  $('#login-modal').modal('toggle')

$('#buttonCall').on('click', function() {
    var name = $('#inputCall').val();
    pc.call(name, true);
    var idTime = setTimeout(function() {
        console.log('Huy cuoc goi!');
        $('#callingto').modal('hide');
        pc.cancelCall(name);
    }, 10000);
    $('#callingto').modal('show');
    $('#callingto').off('click');
    $('#callingto').on('click', function(event) {
        var answer = event.target.getAttribute('answer');
        console.log(answer);
        if (answer === 'close') {
            $('#callingto').modal('hide');
            pc.cancelCall(name);
            clearTimeout(idTime);
            return;
        }
    });
    $('#hangup').off('click');
    $('#hangup').on('click', function() {
        console.log(name);
        pc.finish(name);
    });

    //call when want cancel call pc.cancelCall();
    pc.onReject = function() {
        $('#callingto').modal('hide');
        clearTimeout(idTime);
        console.log('Tu choi');
    };
    pc.onAccept = function() {
        console.log('Chap nhan cuoc goi');
        $('#callingto').modal('hide');
        $('#myModal').modal('show');
    };
    pc.onLocalStream = function(stream) {
        $('#local').attr('src', window.URL.createObjectURL(stream));
    };
    pc.onRemoteStream = function(stream) {
        $('#remote').attr('src', window.URL.createObjectURL(stream));
    };
    pc.onSwitchVideo = function(status) {
        // when switch video
    };
    pc.onSwitchAudio = function(status) {
        // when switch audio
    };
    pc.onClose = function() {
        // Khi cuộc goi kết thúc đóng giao diện
        clearTimeout(idTime);
        $('#myModal').modal('hide');
        console.log('close');
    };
    pc.onSuccess = function() {
        clearTimeout(idTime);
        console.log('successfull');
    };
    pc.onFinish = function() {
        $('#myModal').modal('hide');
        console.log('finish!');
        // đống giao diện
    };
    //pc.switchAudio(name);
    //pc.switchVideo(name);
});


DetectRTC.load(function() {
    //check DetectRTC.isSctpDataChannelsSupported
//    DetectRTC.isRtpDataChannelsSupported
//DetectRTC.isWebRTCSupported
//DetectRTC.isMobileDevice
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

    DetectRTC.isWebsiteHasWebcamPermissions // getUserMedia allowed for HTTPs domain in Chrome?
    DetectRTC.isWebsiteHasMicrophonePermissions // getUserMedia allowed for HTTPs domain in Chrome?

    DetectRTC.audioInputDevices // microphones
    DetectRTC.audioOutputDevices // speakers
    DetectRTC.videoInputDevices // cameras

    DetectRTC.osName
    DetectRTC.osVersion
    console.log(DetectRTC.browser.name);
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
