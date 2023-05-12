// index.js
require('dotenv').config();
const express = require('express')
const app = express()


app.use(express.static('public'))

const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 3001 })
console.log("Websocket server running on port 3001")


const { Deepgram } = require('@deepgram/sdk')
const deepgram = new Deepgram(process.env.DG_KEY)



// client connects to websocket server (ws://localhost:3001)
wss.on('connection', (ws) => {
    const deepgramLive = deepgram.transcription.live({ utterances: true })

    deepgramLive.addListener("open", () => {
        console.log('dg onopen');
    });


    deepgramLive.addListener("error", (err) => {
        console.log(err);
    });

    // on data recieved from front-end, send to deepgram
    ws.onmessage = (event) => {
        console.log("message data from front-end: ", event.data)
        deepgramLive.send(event.data)
    }


    deepgramLive.addListener('transcriptReceived', (data) => ws.send(data))
})

app.listen(3000)