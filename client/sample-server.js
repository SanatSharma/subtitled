var http = require('http');
var https = require('https');
var url = require('url');
var os = require("os");
var fs = require('fs');
var qrcode = require('qrcode-terminal'); // "qrcode-terminal": "^0.11.0",

var sample = fs.readFileSync(__dirname + '/Sample.html', 'utf8');
var sdk_js = fs.readFileSync(__dirname + '/speech-sdk.js', 'utf8');

var enableTunnel = false;
for (let j = 0; j < process.argv.length; j++) {  
    enableTunnel |= process.argv[j] == 'enableTunnel';
}

var keyFile = __dirname+'/speech.key';
if (fs.existsSync(keyFile)) {
    var key = fs.readFileSync(keyFile, 'utf8');
    key = key.replace(/\s/g, "");
    if (!!key) {
        var before = "YOUR_BING_SPEECH_API_KEY";
        var after = key;
        sample = sample.replace(before, after);
        //sample = sample.replace('var useTokenAuth = false;', 'var useTokenAuth = true;');
    }
} else {
    console.log("Please provide an API key in speech.key");
}

var port = 8765;
var server = http.createServer(function(request, response){
    var respond = function(status, data, contentType) {
        if (typeof(contentType) === 'undefined') {
            contentType = 'text/plain';
        }
        response.writeHead(status, {'Content-Type': contentType});
        !!data && response.write(data);
        response.end();
    }

    path= url.parse(request.url).pathname;    
    console.log("Incoming request:" + request.url);

    if (path == '/token') {
        respond(404, '');
        /*getToken(key, function(token){ 
            respond(200, token);
         })*/
    } else if (path == '/') {
        respond(200, sample, 'text/html');
    } else {
        respond(200, sdk_js, 'text/html');
    }
});


var quit = false;
if (enableTunnel) {
    var localtunnel = require('localtunnel');
    var tunnel = localtunnel(port, function(err, tunnel) {
        if (err) {
            quit = true;
            server.close(); 
            console.log('Something went south...' + err.message)
        } else {
            printServerInfo(tunnel.url)
        }
    });

    tunnel.on('close', function() {
        quit = true;
        server.close();   
    });
} else {
    printServerInfo('http://'+os.hostname() + ':' + port);
}



if (!quit) {
    server.listen(port);
}

function printServerInfo(url) {
    console.log('Up and running @ ' + url);
    qrcode.setErrorLevel('H');
    qrcode.generate(url, {small: true});
}

/*function getToken(apiKey, result) {
    var options = {
        host: 'api.cognitive.microsoft.com',
        path: '/sts/v1.0/issueToken',
        method: 'POST',
         headers: {
            'Content-type': 'application/x-www-form-urlencoded',
            'Content-Length': '0',
            'Ocp-Apim-Subscription-Key': apiKey
        }
    };

    var callback = function(response) {
      var token = ''
      response.on('data', function (chunk) {
        token += chunk;
      });

      response.on('end', function () {
        result(token);
      });
    }

    var issueTokenRequest = https.request(options, callback);
    issueTokenRequest.end();
}*/