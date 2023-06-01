const { CognitoJwtVerifier } = require("aws-jwt-verify");
require('dotenv').config();
const userPoolId = process.env.USERPOOLID
const clientId = process.env.USERPOOLCLIENTID


const test = async () => {
    const token= "eyJraWQiOiJrSWV0eVRJeTdrMmFTVVdpelhJMXVuR05KMmhPaWs5UmVac293Y2ZYcnlrPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI1MDc3ZjY2Zi1iOWIxLTQxYTEtODJiMC0xYjY4ZjllYmI2N2EiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImN1c3RvbTpuYXRpdmVfbGFuZ3VhZ2UiOiJlbiIsInByb2ZpbGUiOiJ1cy1lYXN0LTE6ZmNlNmVjZjEtMzU4Ny00OTU0LWEyNWUtZGMzZTk3ZjhkNWM5IiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfR3R1RU5ORGZUIiwiY29nbml0bzp1c2VybmFtZSI6Imtsb3Vja3NAY2xvdWQzMDMuaW8iLCJvcmlnaW5fanRpIjoiMDE2NDcyMjUtNWY4NS00Y2NiLWE4YTctNzU0NzY1NzNhN2U1IiwiYXVkIjoiNnVwNmRtcmloNWpicjFoZGRqNmFoOGc3cWMiLCJldmVudF9pZCI6IjA4ZmYwOTU0LTQ5ZTEtNDFhYy1hYjE1LThiZmI4M2Y5YWYyMyIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjg1NTcxNzQ4LCJleHAiOjE2ODU1NzUzNDgsImlhdCI6MTY4NTU3MTc0OCwianRpIjoiYzJhMmVhM2ItMDU5NC00OGU4LThiZWYtOTdkODU3NTVlMWIxIiwiZW1haWwiOiJrbG91Y2tzQGNsb3VkMzAzLmlvIn0.L5DOpneaMaVTAWUqZqxX4lvovXN-L8IVlckzlHd-lc69rZr6JK7OjejiKBeghOI8d4-0WECyskTdJiRC_vwRqT3d88HrEOF30agRzk-fbywFSDNObc3GSuUdxJMGTNzrtiMgK2upxY-kdPRyN_wbZRI001OTYTKhlFBmAmg2eoFZcUC7cM-YCdI4Ftmjz6zd7gSDQsTgzA_5hHN3gjotUt2WqqDdJlZwxpjkDmP6VYOKkczac4ZBbqqH_jWp7yNc7Q0RzfEdyq1y2nZpX-_OIvi1_uNo0JBR7oC5FWBtMmGPMpSQAiROUEBZMyIqXA8QwiMVO1Bo8qqfsKqEBRUPvw"
    // Verifier that expects valid access tokens:
    const verifier = CognitoJwtVerifier.create({
        userPoolId: userPoolId,
        tokenUse: "id",
        clientId: clientId,
    });
    console.log(verifier)
        
    try {
        const payload = await verifier.verify(token); // the JWT as string

        console.log("Token is valid. Payload:", payload);
    } catch (err) {
        console.log("Token not valid!", err);
    }
}

test()
