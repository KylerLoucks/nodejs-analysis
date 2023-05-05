const AWS = require('aws-sdk');
const ffmpeg = require('fluent-ffmpeg');
const stream = require('stream');

const s3 = new AWS.S3();



const bucketName = 'mediacapture-cd12ad00';
// const bucketName = 'tims-backend-mediacapture';
const meetingId = '1cbb9a14-ea1d-49ce-ac28-a3704f720706';
const prefix = `captures/${meetingId}/audio/`


  
  
async function getObjects(bucketName, prefix) {
    const data = await new Promise((resolve, reject) => {
        s3.listObjectsV2({ Bucket: bucketName, Prefix: prefix }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
    });
    
    console.info(data);
    // const objects = [];
    if (data.Contents.length > 0) {
        // console.info(`Grabbed data from s3: ${JSON.stringify(data)}`)
        // Sort the objects by the timestamp in the file path in ascending order
        const sortedObjects = data.Contents.sort((a, b) => {
            const aTimestamp = new Date(a.Key.substring(prefix.length, prefix.length + 19));
            
            const bTimestamp = new Date(b.Key.substring(prefix.length, prefix.length + 19));
            return bTimestamp - aTimestamp;
        });

        // Get the most recent audio file path
        const mostRecentAudioFilePath = sortedObjects[0].Key;
        const secondMostRecentAudioFilePath = sortedObjects[1] && sortedObjects[1].Key !== null ? sortedObjects[1].Key: null;
        console.info(`Most recent audio file name: ${mostRecentAudioFilePath}`)
        console.info(`Most recent audio file path: s3://${bucketName}/${mostRecentAudioFilePath}`)
       

        
        // objects.push(mostRecentAudioFilePath)
        if (secondMostRecentAudioFilePath) {
            console.info(`Second most recent audio file: ${sortedObjects[1].Key}`)
            // objects.push(secondMostRecentAudioFilePath)
        }
        const objects = sortedObjects.map((obj) => obj.Key)
        return objects;


        
    }
}

async function convertMp4ToWav(fromBucket, filePath) {
    const toBucket = 'voiceconnectoraudio-cd12ad00';
    const wavFilePath = 'captures/1cbb9a14-ea1d-49ce-ac28-a3704f720706/audio/2023-05-05-17-58-08-442.wav';

    const readStream = s3.getObject({ Bucket: fromBucket, Key: mp4FilePath }).createReadStream();
    
    const ffmpegProcess = ffmpeg(readStream)
        .toFormat('wav')
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000);

    const passThrough = new stream.PassThrough();
    ffmpegProcess.pipe(passThrough);

    ffmpegProcess.on('error', (err, stdout, stderr) => {
        // Handle errors here
    }).on('end', () => {
        // Processing is complete
        console.info('Process complete');
        s3.upload({
        Bucket: toBucket,
        Key: wavFilePath,
        Body: passThrough,
        ContentType: 'audio/wav'
        }, (err, data) => {
        if (err) {
            console.error(err)
        }
        console.log("done");
        });
    });
}


async function run() {
    
    try { 
        const mp4FilePath = 'captures/1cbb9a14-ea1d-49ce-ac28-a3704f720706/audio/2023-05-05-17-58-08-442.mp4';
        await convertMp4ToWav(bucketName, mp4FilePath)
        console.info("Converted MP4 files to WAV")
    } catch (err) {
        console.error(err);
    }

    try {
      const objects = await getObjects(bucketName, prefix);
      console.info(`Objects received: ${objects}`);
    } catch (err) {
      console.error(err);
    }
}


run();



/**
 * IDEA:
 * 
 * Use the audio file we grab from CaptureBucket and pass it to deepgram to transcribe to text and translate it if needed
 * 
 * use AWS Polly to create a .wav file from the text recieved, upload it to AWS S3 audioConnectorBucket
 * 
 * Pass the key of that object to the PlayAudio action to play the audio back to the caller.
 */






// s3://mediacapture-cd12ad00/captures/bfd45e11-72b7-4991-b28e-555d54070706/audio/2023-05-05-16-25-15-164.mp4

// s3://mediacapture-cd12ad00/captures/bfd45e11-72b7-4991-b28e-555d54070706/audio/2023-05-05-16-25-21-764.mp4