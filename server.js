const WebSocket = require('ws')
const express = require('express')

/* Current Implementation
    sessions = {session: leader_ws}
    conn  = {session: [ws,ws,ws]}
    */

const wss = new WebSocket.Server({port:4000});
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
                    conn[obj.session].push(ws)
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