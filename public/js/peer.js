var config = {
    'iceServers': [{
        'urls': 'stun:stun.l.google.com:19302'
    }, {
        'urls': 'turn:numb.viagenie.ca:3478',
        'username': 'haixoay96@gmail.com',
        'credential': '123456'

    }]
};
var constraints = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
var configStream = {
    "audio": true,
    "video": true
}

function peer(nameId) {
    this.codeCall = undefined;
    this.pc = undefined;
    this.configStream = {
        "audio": true,
        "video": true
    };
    var point = this;
    this.socket = new WebSocket('wss://' + '27.134.241.160');
    this.socket.onopen = function() {
        // Web Socket is connected, send data using send()
        point.socket.send(JSON.stringify({
            intent: 'login',
            name: nameId
        }));
        console.log('Send login!');
        console.log('ready');
    };
    this.socket.onmessage = function(evt) {
        var received_msg = evt.data;
        console.log(received_msg);
        var data;
        try {
            data = JSON.parse(received_msg);
        } catch (e) {
            data = {};
        }
        switch (data.intent) {
            case 'on_login':
                alert(data.status);
                console.log(data);
                break;
            case 'on_call':
                if (data.codeCall === undefined) {
                    console.log('Fake!');
                    return;
                }
                if (point.codeCall !== undefined) {
                    console.log('Đang bận!');
                    point.socket.send(JSON.stringify({
                        intent: 'reply',
                        name: data.name,
                        answer: false,
                        codeCall: data.codeCall
                    }));
                    return;
                }
                point.codeCall = data.codeCall;
                var name = data.name;
                setTimeout(function() {
                    if (point.onCall) {
                        point.onCall(name, data.video);
                    }
                }, 0);
                point.reply = function(answer) {
                    if (point.codeCall === undefined) {
                        return;
                    }
                    if (!answer) {
                        console.log(point.codeCall);
                        console.log(answer);
                        point.socket.send(JSON.stringify({
                            intent: 'reply',
                            name: data.name,
                            answer: false,
                            codeCall: point.codeCall
                        }));
                        point.hangup();
                        return;
                    }
                    if (data.video) {
                        point.configStream = {
                            "audio": true,
                            "video": true
                        };
                    } else {
                        point.configStream = {
                            "audio": true
                        };
                    }
                    point.pc = new RTCPeerConnection(config);
                    point.pc.onaddstream = function(event) {
                        console.log('remote');
                        console.log(event.stream);
                        setTimeout(function() {
                            if (point.onRemoteStream) {
                                point.onRemoteStream(event.stream);
                            }
                        }, 0);
                    };
                    point.pc.oniceconnectionstatechange = handleIceConnectionStateChange;
                    point.pc.onicecandidate = function(event) {
                        if (event.candidate) {
                            console.log("handleIceCandidate");
                            sendMessage(name, point.codeCall, "candidate", event.candidate);
                            console.log(name);
                        }
                    };
                    point.socket.send(JSON.stringify({
                        intent: 'reply',
                        name: data.name,
                        answer: true,
                        codeCall: point.codeCall
                    }));
                }
                console.log('Co nguoi goi');
                break;
            case 'on_result_call':
                var name = data.name;
                console.log(data);
                if (data.codeCall === undefined) {
                    return;
                }
                if (point.codeCall !== data.codeCall) {
                    console.log('sai codeCall');
                    return;
                }
                if (data.status === 101) {
                    console.log(name + ' không sẵn sàng ');
                    point.clean();
                    setTimeout(function() {
                        if (point.onReject) {
                            point.onReject();
                        }
                    }, 0);
                    return;
                }
                if (!data.answer) {
                    console.log(name + ' từ chối cuộc gọi');
                    point.clean();
                    setTimeout(function() {
                        if (point.onReject) {
                            point.onReject();
                        }
                    }, 0);
                    return;
                }
                setTimeout(function() {
                    if (point.onAccept) {
                        point.onAccept();
                    }
                }, 0);
                console.log(name + ' đồng ý cuộc gọi');
                // prepare
                point.pc.onaddstream = function(event) {
                    console.log('remote');
                    console.log(event.stream);
                    setTimeout(function() {
                        if (point.onRemoteStream) {
                            point.onRemoteStream(event.stream);
                        }
                    }, 0);
                };
                point.pc.oniceconnectionstatechange = handleIceConnectionStateChange;
                point.pc.onicecandidate = function(event) {
                    if (event.candidate) {
                        console.log("handleIceCandidate");
                        console.log(name);
                        sendMessage(name, point.codeCall, "candidate", event.candidate);
                    }
                };
                // get stream
                navigator.mediaDevices.getUserMedia(point.configStream)
                    .then(function(stream) {
                        console.log('local');
                        point.pc.addStream(stream);
                        point.localStream = stream;
                        point.socket.send(JSON.stringify({
                            intent: 'callerReady',
                            name: name,
                            codeCall: point.codeCall
                        }));
                        console.log('da gui');
                        setTimeout(function() {
                            if (point.onLocalStream) {
                                point.onLocalStream(stream);
                            }
                        }, 0);
                    })
                    .catch(function(error) {});
                break;
            case 'on_message':
                if (data.codeCall === undefined) {
                    return;
                }
                if (point.pc === undefined || point.codeCall !== data.codeCall) {
                    return;
                }
                if (data.type === "candidate") {
                    point.pc.addIceCandidate(new RTCIceCandidate(data.payload));
                } else if (data.type === "offer") {
                    point.pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                    point.pc.createAnswer()
                        .then(function(answer) {
                            point.pc.setLocalDescription(answer);
                            sendMessage(data.name, point.codeCall, "answer", answer);
                            console.log(name);
                        })
                        .catch(function(error) {
                            console.log(error);
                        });
                } else if (data.type === "answer") {
                    console.log('nhan answer');
                    point.pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                }
                break;
            case 'on_caller_ready':
                if (data.codeCall === undefined) {
                    return;
                }
                if (point.codeCall !== data.codeCall) {
                    return;
                }
                navigator.mediaDevices.getUserMedia(point.configStream)
                    .then((stream) => {
                        console.log('local');
                        point.pc.addStream(stream);
                        point.localStream = stream;
                        point.socket.send(JSON.stringify({
                            intent: 'calleeReady',
                            name: data.name,
                            codeCall: point.codeCall
                        }));
                        setTimeout(function() {
                            if (point.onLocalStream) {
                                point.onLocalStream(stream);
                            }
                        }, 0);
                    })
                    .catch(function(error) {

                    });
                break;
            case 'on_callee_ready':
                if (data.codeCall === undefined) {
                    return;
                }
                if (data.codeCall !== point.codeCall) {
                    return;
                }
                point.pc.createOffer(constraints)
                    .then(function(offer) {
                        console.log("Create offer for ", data.name);
                        point.pc.setLocalDescription(offer);
                        console.log(data.name);
                        sendMessage(data.name, point.codeCall, "offer", offer);
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
                break;
            case 'on_cancelCall':
                if (data.codeCall === undefined) {
                    return;
                }
                if (point.codeCall !== data.codeCall) {
                    return;
                }
                delete point.codeCall;
                delete point.pc;
                setTimeout(function() {
                    if (point.onCancel) {
                        point.onCancel();
                    }
                }, 0);
                break;
            case 'on_switch_audio':
                if (data.codeCall === undefined) {
                    return;
                }
                if (point.codeCall !== data.codeCall) {
                    return;
                }
                setTimeout(function() {
                    if (point.onSwitchAudio) {
                        point.onSwitchAudio(data.status);
                    }
                }, 0);
                break;
            case 'on_switch_video':
                if (data.codeCall === undefined) {
                    return;
                }
                if (point.codeCall !== data.codeCall) {
                    return;
                }
                setTimeout(function() {
                    if (point.onSwitchVideo) {
                        point.onSwitchVideo(data.status);
                    }
                }, 0);
                break;
            case 'on_finish':
                console.log('finish');
                if (data.codeCall === undefined) {
                    return;
                }
                if (point.codeCall !== data.codeCall) {
                    return;
                }
                setTimeout(function() {
                    if (point.onFinish) {
                        point.onFinish();
                    }
                }, 0);
                point.hangup();
                break;
            default:
                console.log('Miss event!');
        }
    };
    this.socket.onclose = function() {
        // websocket is closed.
        console.log('Close');
    };

    point.cancelCall = function(name) {
        if (point.codeCall !== undefined) {
            point.socket.send(JSON.stringify({
                intent: 'cancelCall',
                codeCall: point.codeCall,
                name: name
            }));
            point.hangup();
        }
    };
    // when call
    this.call = function(name, video) {
        if (point.pc !== undefined || point.codeCall !== undefined) {
            console.log('Khong ther goi');
            return;
        }
        if (video) {
            point.configStream = {
                "audio": true,
                "video": true
            };
        } else {
            point.configStream = {
                "audio": true
            };
        }
        console.log('Bắt đầu gọi!');
        point.pc = new RTCPeerConnection(config);
        point.codeCall = Date.now().toString(); // code room
        point.socket.send(JSON.stringify({
            intent: 'call',
            name: name,
            video: video,
            codeCall: point.codeCall
        }));
    };
    this.switchAudio = function(name) {
        if (point.localStream) {
            if (point.localStream.getAudioTracks()[0]) {
                point.localStream.getAudioTracks()[0].enabled = !(point.localStream.getAudioTracks()[0].enabled);
                point.socket.send(JSON.stringify({
                    intent: 'switchAudio',
                    status: point.localStream.getAudioTracks()[0].enabled,
                    codeCall: point.codeCall,
                    name: name
                }));
            }
        }
    };
    this.switchVideo = function(name) {
        if (point.localStream) {
            if (point.localStream.getVideoTracks()[0]) {
                point.localStream.getVideoTracks()[0].enabled = !(point.localStream.getVideoTracks()[0].enabled);
                point.socket.send(JSON.stringify({
                    intent: 'switchVideo',
                    status: point.localStream.getVideoTracks()[0].enabled,
                    codeCall: point.codeCall,
                    name: name
                }));
            }
        }
    };
    this.finish = function(name) {
            if (point.codeCall === undefined || point.pc === undefined) {
                console.log('Cuoc goi chua duoc mo');
                return;
            }
            point.socket.send(JSON.stringify({
                intent: 'finish',
                name: name,
                codeCall: point.codeCall
            }));
            point.hangup();
        }
        // function clean
    this.clean = function() {
            console.log('Clean');
            delete this.pc;
            delete this.codeCall;
        }
        // function handle hangup
    this.hangup = function() {
        if (this.pc) {
            this.pc.close();
        }
        point.clean();
        point.stopStream();

    };
    // stop media stream
    this.stopStream = function() {
        if (point.localStream) {
            if (point.localStream.getAudioTracks()[0]) {
                point.localStream.getAudioTracks()[0].stop();
            }
            if (point.localStream.getVideoTracks()[0]) {
                point.localStream.getVideoTracks()[0].stop();
            }
            delete point.localStream;
        }
    };

    function handleIceConnectionStateChange(event) {
        var pcx = event.target;
        console.log('[handleIceConnectionStateChange]', pcx.iceConnectionState)
        if (pcx.iceConnectionState === 'closed') {

            console.log('hangup');
        }
        if (pcx.iceConnectionState === 'disconnected') {

        }
        if (pcx.iceConnectionState === 'failed') {
            point.hangup();
            setTimeout(function() {
                point.onClose();
            }, 0);
        }
        if (pcx.iceConnectionState === 'connected') {
            console.log('Call successdull');
            setTimeout(function() {
                if (point.onSuccess) {
                    point.onSuccess()
                }
            }, 0);
        }
    };

    function sendMessage(name, codeCall, type, payload) {
        console.log('[sendMessage]', name, type, payload);
        point.socket.send(JSON.stringify({
            intent: 'message',
            name: name,
            codeCall: point.codeCall,
            type: type,
            payload: payload
        }));
    };
};
