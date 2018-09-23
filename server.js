const WebSocket = require('ws')
const express = require('express')
const fs = require('fs');

/* Current Implementation
    sessions = {session: leader_ws}
    conn  = {session: [ws,ws,ws]}
    */

const wss = new WebSocket.Server({port:2000});
var sessions = {};
var conn = {};

wss.on('connection', function connection(ws,req){
    const ip = req.connection.remoteAddress;
    wss.clients.add(ws);
    ws._socket.setKeepAlive(true);

    console.log("Added client!");
    ws.on("error", function(error) {
        console.log('WebSocket Error: ' + error);
    });

    ws.on("close", function ws_close(data){
        console.log("removing client");
        if(isJson(data)){
            var obj = JSON.parse(data);
            var keys = Object.keys(sessions);
            var check = false;
            keys.forEach(function(session){
                if(sessions[session]==ws){
                    console.log("Found leader. Closing chat room");
                    delete sessions[session];
                    check = true;
                    delete conn[session];
                }
            });

            if (!check){
                var keys = Object.keys(conn);
                keys.forEach(function(session){
                    d = conn[session];
                    for (a in d){
                        if (d[a]==ws){
                            console.log("remove member");
                            check =true;
                            ws.close();
                            d.splice(a,1);
                        }
                    }
                });
            }
        }
        else{
            console.log("Data is not JSON");
        }
    });

    ws.on("message", function ws_message(data){
        if(isJson(data)){
            var obj = JSON.parse(data);
            if (obj.type=="leader_add"){
                console.log("Adding a new leader with session: " + obj.session);
                sessions[obj.session] = ws;
                conn[obj.session] = [];
            }
            else if (obj.type=="member_add"){
                if (obj.session in conn){
                    console.log("Adding client");
                    conn[obj.session].push(ws);
                }
                else{
                    console.log("Could not add client. No session");
                }
            }
            else if (obj.type=="message"){
                if (obj.session in sessions && sessions[obj.session]==ws){
                    clients = conn[obj.session];
                    for(var i in clients){
                        client = clients[i];
                        console.log("Sending message");
                        client.send(JSON.stringify({
                            type: "message",
                            data: obj.data
                        }));
                    }
                }
                else{
                    console.log("Sender not identified")
                }
            }
        }
    });
});

function isJson(str) {
    try {
        console.log(str);
        JSON.parse(str);
    } catch (e) {
        console.log(e);
        return false;
    }
    return true;
}

var key = (function() {
    var keyFile = __dirname + '/speech.key';
    var key;
    if (fs.existsSync(keyFile) && (key = fs.readFileSync(keyFile, 'utf8'))) {
        key = key.replace(/\s/g, "");
        if (key) return key;
    }

    console.log("Please provide an API key in speech.key");
    process.exit(0);
})();

/* Express */
const app = express();
const pages = {
    room: fs.readFileSync(__dirname + '/client/leader.html', 'utf8')
        .replace("YOUR_BING_SPEECH_API_KEY", key),
}

app.use('/static', express.static('client/static'));
app.get('/', (req, res) => res.send(pages.room));

app.listen(3000, () => console.log('App listening on port 3000!'));
//hello