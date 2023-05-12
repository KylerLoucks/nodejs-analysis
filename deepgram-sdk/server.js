// index.js

const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");


require('dotenv').config();

// Deepgram SDK
const { Deepgram } = require('@deepgram/sdk')


const io = new Server({cors: {origin: "*"}});

// Redis pub/sub
const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

// adapter allows Socket.IO to utilize Redis for broadcasting messages and handling scalability across multiple server instances.
io.adapter(createAdapter(pubClient, subClient));
io.listen(3001);

console.log("websocket listening on port 3001")


// Connection is established between client and server:
io.on("connection", (socket) => {
    console.log(`A user connected to the Websocket!! ${socket.id}`)

    const deepgram = new Deepgram(process.env.DG_KEY)
    const deepgramLive = deepgram.transcription.live({ 
        punctuate: true,
        utterances: true,
        model: "nova"
        
    })

    // listen for deepgram transcripts callback:
    deepgramLive.addListener('transcriptReceived', (data) => {
        console.log("transcript data: ", data)
        socket.emit("transcript", data)
        
    })
    
    // handle when deepgram connection is established
    deepgramLive.addListener("open", () => {
        console.log('dg onopen');
        
    });

    // handle when errors happen with deepgram
    deepgramLive.addListener("error", (err) => {
        console.log(err);
    });

    // Listen for audio stream
    socket.on("audiostream", (event) => {
        console.log("event recieved", event)
        // check if connection is established with deepgram
        if (deepgramLive.getReadyState() == 1) {
            deepgramLive.send(event.data)
        }
    });

    // translate text to another language
    socket.on("translate", (event) => {
        translate()
    })



});


async function translate(source, target, text) {
    const url = 'https://dev-api.itranslate.com/translation/v2/'
    const headers = {
      Authorization: 'YOUR ITRANSLATE API KEY',
      'Content-Type': 'application/json',
    }
    const data = {
      source: { dialect: source, text: text },
      target: { dialect: target },
    }
  
    const result = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }).then((r) => r.json())
  
    return result
  }

