// index.js

const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const redis = require("redis");
require('dotenv').config();

const AWS = require('aws-sdk')
AWS.config.update({ region: 'us-east-1' });
const translate = new AWS.Translate();

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


// // establish connection to redis
// pubClient.connect()

// // handle redis connection errors
// pubClient.on('error', (err) => {
//     // console.log('Error occured while connecting or accessing redis server');
// });


const deepgram = new Deepgram(process.env.DG_KEY)
// Connection is established between client and server:
io.on("connection", async (socket) => {
    console.log(`A user connected to the Websocket!! ${socket.id}`)


    // TODO: put in io.on("join-meeting")
    // const response = await pubClient.get(`meetingId`).catch((err) => {
    //     console.log("Error getting data in redis: ", err)
    // });

    // const data = JSON.parse(response || "{}");
    // data.users = data.users || [];
    // data.users.push({ cognitoUser: 'test', languagePref: "en" })


    // const updatedData = JSON.stringify(data)
    // console.log(updatedData)

    // // update redis data
    // await pubClient.set(`meetingId`, JSON.stringify(updatedData)).catch(err =>
    //     console.log("Error setting data in redis: ", err)
    // );

    const deepgramLive = deepgram.transcription.live({ 
        punctuate: true,
        utterances: true,
        // model: "nova"
        
    })

    // listen for deepgram transcripts callback:
    deepgramLive.addListener('transcriptReceived', (data) => {
        console.log("Recieved Transcript from Deepgram")
        socket.emit("transcript", data)
        
        // const received = JSON.parse(data)
        // const transcript = received?.channel?.alternatives[0]?.transcript ?? null;
        // // if the transcription text recieved is fully processed
        // if (transcript && received.is_final) {
        //     translateText(transcript, "en", "es")
        //         .then(translatedText => {
        //             console.log('Translated text:', translatedText);
        //         })
        //         .catch(error => {
        //             console.error('Translation error:', error);
        //         });
        // }
    })
    
    // handle when deepgram connection is established
    deepgramLive.addListener("open", () => {
        console.log('deepgram connected!');
        
    });

    // handle when errors happen with deepgram
    deepgramLive.addListener("error", (err) => {
        console.log(err);
    });

    // Listen for audio stream
    socket.on("audiostream", (event) => {
        console.log("event recieved")
        // check if connection is established with deepgram
        console.log(deepgramLive.getReadyState())
        if (deepgramLive.getReadyState() == 1) {
            deepgramLive.send(event.data)
        }
    });

    // handle when users disconnect
    socket.on("disconnect", (reason) => {
        console.log("Client disconnected!", reason)

        
    });

});



/**
 * Translates text-to-text
 * @param {String} text 
 * @param {String} sourceLanguageCode 
 * @param {String} targetLanguageCode 
 * @returns {String} translated text
 */
async function translateText(text, sourceLanguageCode, targetLanguageCode) {
    const params = {
      Text: text,
      SourceLanguageCode: sourceLanguageCode,
      TargetLanguageCode: targetLanguageCode
    };
  
    try {
      const result = await translate.translateText(params).promise();
      return result.TranslatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
}




async function itranslate(source, target, text) {
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

