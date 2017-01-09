var listUser = require('../utils/listUser.js');
var _ = require('lodash');
var https = require('https');
var handleWebSocket = (wss) => {
    wss.on('connection', (socket) => {
        socket.on('message', (msg) => {
            var data;
            try {
                data = JSON.parse(msg);
            } catch (e) {
                data = {};
            }
            switch (data.intent) {
                case 'login':
                    if (socket.name) {
                        console.log('Socket had been login!');
                        socket.send(JSON.stringify({
                            intent: 'on_login',
                            status: 102
                        }));
                        return;
                    }
                    var name = data.name;
                    var index = _.findIndex(wss.clients, {
                        name: name
                    });
                    if (index !== -1) {
                        console.log('delete' +  wss.clients[index].name);
                        delete wss.clients[index].name;
                    }
                    console.log(name + ' login successfull!');
                    socket.name = name;
                    socket.send(JSON.stringify({
                        intent: 'on_login',
                        status: 100
                    }));
                    var options = {
                        host: '127.0.0.1',
                        port: 8443,
                        path: '/Nihongonomori/api/v1/loginAddOnline?username=' + name,
                        method: 'GET'
                    };
                    var req = https.request(options, function(res) {
                        console.log(res.statusCode);
                        res.on('data', function(d) {
                            process.stdout.write(d);
                        });
                    });
                    req.end();
                    req.on('error', function(e) {
                        console.error(e);
                    });
                    break;
                case 'call':
                    if (!socket.name) {
                        console.log('Not login!');
                        return;
                    }
                    var name = data.name;
                    var codeCall = data.codeCall;
                    var video = data.video;
                    var index = _.findIndex(wss.clients, {
                        name: name
                    });
                    if (index !== -1) {
                        console.log(socket.name + ' calling to ' + name);
                        wss.clients.forEach(function each(client) {
                            if (client.name === name) {
                                client.send(JSON.stringify({
                                    intent: 'on_call',
                                    name: socket.name,
                                    video: video,
                                    codeCall: codeCall
                                }));
                            }
                        });
                        return;
                    }
                    console.log('Not found ' + name);
                    socket.send(JSON.stringify({
                        intent: 'on_result_call',
                        status: 101,
                        name: data.name,
                        codeCall: codeCall
                    }));
                    break;
                case 'reply':
                    if (!socket.name) {
                        console.log('Not login!');
                        return;
                    }
                    var name = data.name;
                    var codeCall = data.codeCall;
                    var answer = data.answer;
                    console.log(data);
                    console.log(socket.name + ' reply ' + answer + ' ' + name);
                    wss.clients.forEach(function each(client) {
                        if (client.name === name) {
                            client.send(JSON.stringify({
                                intent: 'on_result_call',
                                status: 100,
                                answer: answer,
                                name: socket.name,
                                codeCall: codeCall
                            }));
                        }
                    });
                    break;
                case 'callerReady':
                    if (!socket.name) {
                        console.log('Not login!');
                        return;
                    }
                    var name = data.name;
                    var codeCall = data.codeCall;
                    wss.clients.forEach(function each(client) {
                        if (client.name === name) {
                            client.send(JSON.stringify({
                                intent: 'on_caller_ready',
                                name: socket.name,
                                codeCall: codeCall
                            }));
                        }
                    });
                    break;
                case 'calleeReady':
                    if (!socket.name) {
                        console.log('Not login!');
                        return;
                    }
                    var name = data.name;
                    var codeCall = data.codeCall;
                    wss.clients.forEach(function each(client) {
                        if (client.name === name) {
                            client.send(JSON.stringify({
                                intent: 'on_callee_ready',
                                name: socket.name,
                                codeCall: codeCall
                            }));
                        }
                    });
                    break;
                case 'cancelCall':
                    if (!socket.name) {
                        console.log('Not login');
                        return;
                    }
                    var name = data.name;
                    var codeCall = data.codeCall;
                    console.log(socket.name + ' cancel');
                    wss.clients.forEach(function each(client) {
                        if (client.name === name) {
                            client.send(JSON.stringify({
                                intent: 'on_cancelCall',
                                name: socket.name,
                                codeCall: codeCall,
                            }));
                        }
                    });
                    break;
                case 'message':
                    if (!socket.name) {
                        console.log('Not login');
                        return;
                    }
                    var name = data.name;
                    var codeCall = data.codeCall;
                    var type = data.type;
                    var payload = data.payload;
                    console.log(socket.name + ' send ' + type + ' to ' + name + ' ' + __dirname);
                    wss.clients.forEach(function each(client) {
                        if (client.name === name) {
                            client.send(JSON.stringify({
                                intent: 'on_message',
                                name: socket.name,
                                codeCall: codeCall,
                                type: type,
                                payload: payload
                            }));
                        }
                    });
                    break;
                case 'switchAudio':
                    if (!socket.name) {
                        console.log('Not login');
                        return;
                    }
                    var name = data.name;
                    var codeCall = data.codeCall;
                    var status = data.status;
                    wss.clients.forEach(function each(client) {
                        if (client.name === name) {
                            client.send(JSON.stringify({
                                intent: 'on_switch_audio',
                                name: socket.name,
                                codeCall: codeCall,
                                status: status
                            }));
                        }
                    });
                    break;
                case 'switchVideo':
                    if (!socket.name) {
                        console.log('Not login');
                        return;
                    }
                    var name = data.name;
                    var codeCall = data.codeCall;
                    var status = data.status;
                    wss.clients.forEach(function each(client) {
                        if (client.name === name) {
                            client.send(JSON.stringify({
                                intent: 'on_switch_video',
                                name: socket.name,
                                codeCall: codeCall,
                                status: status
                            }));
                        }
                    });
                    break;
                case 'finish':
                    if (!socket.name) {
                        console.log('not login');
                        return;
                    }
                    var name = data.name;
                    var codeCall = data.codeCall;
                    console.log(socket.name + ' finish ' + name);
                    wss.clients.forEach(function each(client) {
                        if (client.name === name) {
                            client.send(JSON.stringify({
                                intent: 'on_finish',
                                name: socket.name,
                                codeCall: codeCall,
                            }));
                        }
                    });
                    break;
                default:

            }
        });
        socket.on('close', () => {
            console.log('close socket!');
            console.log('Remove ' + socket.name + ' successfull ' + __dirname);
            if (!socket.name) {
                return;
            }
            var options = {
                host: '127.0.0.1',
                port: 8443,
                path: '/Nihongonomori/api/v1/logout?username=' + socket.name,
                method: 'GET'
            };
            var req = https.request(options, function(res) {
                console.log(res.statusCode);
                res.on('data', function(d) {
                    process.stdout.write(d);
                });
            });
            req.end();
            req.on('error', function(e) {
                console.error(e);
            });
        });
    });
}
module.exports.handleWebSocket = handleWebSocket;
