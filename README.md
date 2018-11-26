# subtitled

Subtitled is a web app that helps provide live subtitles for any meeting or lecture by converting speech to text. The interface can be accessed over any media device through a web browser

The service currently uses the Bing Speech API, to make project work:
  1) Host server.js
  2) Create a speech.key file with your Bing Speech Key
  
# How to Run (on local computer)

```
Create speech.key file with Bing Speech API key
```
This can be created at https://azure.microsoft.com/en-us/services/cognitive-services/speech/

Download packages
```
npm install
```

Run server
```
node server.js
```

To start leader page, go to localhost:3000
Open member.html in a browser, now anything spoken in the leader.html should be live transcripted and shown on member.html
