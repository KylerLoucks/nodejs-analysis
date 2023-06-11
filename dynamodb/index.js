// ES6 AWS SDK v3:
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"; // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_util_dynamodb.html
import { config } from "dotenv";
config()
const ddb = new DynamoDB({apiVersion: '2012-08-10'})


const testTable = "testdatapksk"
const gameID = "01GPEV315ASJQK3PRMAW94XCQG"

const region = process.env.AWS_REGION
console.log(region)

// DynamoDB Query Example
const main = async () => {
    const queryParams = {
        TableName: testTable,
        KeyConditionExpression: "PK = :Id and begins_with(SK, :user)",
        ExpressionAttributeValues: {
            ":Id": { S: `GAME#${gameID}` },
            ":user": { S: "USER#" }
        },
        ConsistentRead: true
    }

    const response = await ddb.query(queryParams)
    const items = response.Items.map((item) => unmarshall(item));

    console.log("marshalled response: ", JSON.stringify(response))
    console.log("unmarshalled response: ", items)
}

main()