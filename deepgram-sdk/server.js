// index.js

const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const redis = require("redis");


require('dotenv').config();

// Deepgram SDK
const { Deepgram } = require('@deepgram/sdk')


const io = new Server({cors: {origin: "*"}});

// Redis pub/sub
const pubClient = redis.createClient({url: "redis://localhost:6379"});
const subClient = pubClient.duplicate();



// adapter allows Socket.IO to utilize Redis for broadcasting messages and handling scalability across multiple server instances.
io.adapter(createAdapter(pubClient, subClient));
io.listen(3001);

console.log("websocket listening on port 3001")


// establish connection to redis
pubClient.connect()

// handle redis connection errors
pubClient.on('error', (err) => {
    console.log('Error occured while connecting or accessing redis server');
});


// Connection is established between client and server:
io.on("connection", async (socket) => {
    console.log(`A user connected to the Websocket!! ${socket.id}`)


    // TODO: put in io.on("join-meeting")
    const response = await pubClient.get(`meetingId`).catch((err) => {
        console.log("Error getting data in redis: ", err)
    });

    const data = JSON.parse(response || "{}");
    data.users = data.users || [];
    data.users.push({ cognitoUser: 'test', languagePref: "en" })


    const updatedData = JSON.stringify(data)
    console.log(updatedData)

    // update redis data
    await pubClient.set(`meetingId`, JSON.stringify(updatedData)).catch(err =>
        console.log("Error setting data in redis: ", err)
    );

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
        // console.log("event recieved", event)
        // check if connection is established with deepgram
        if (deepgramLive.getReadyState() == 1) {
            deepgramLive.send(event.data)
        }
    });

    // translate text to another language
    socket.on("translate", (event) => {
        translate()
    })

    // handle when users disconnect
    socket.on("disconnect", (reason) => {
        console.log("Client disconnected!", reason)

        
    });

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

