const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { nanoid } = require( "nanoid" );
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const S3 = new S3Client();


exports.handler = async (event) => {
  
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ message: "Bad Request: No body provided" }) };
  }
  
  //parse upload event
  const body = JSON.parse(event.body);
    
  //generate unique ID
  const fileId = nanoid();
    
  //bucket name
  const bucketName = 'jsktfovusproj';
    
  //S3 path
  const filePath = '${bucketName}/${inputFile}.txt';
    
  //input text from event
  const inputText = body.inputText;
    
  //decode the file
  const fileContent = Buffer.from(body.fileContent, 'base64');
    
  //upload the file to s3
  //await client.putObject({Bucket: bucketName, Key: filePath, Body: fileContent}).promise();
  try {
    const s3Params = {
      Bucket: bucketName,
      Key: '${fileId}.txt',
      Body: fileContent
    };
    await S3.seond(new PutCommand(s3Params));
  } catch (error) {
    console.log("Error uploading file:", error);
    return { statusCode: 500, body: JSON.stringify({ message: "Error uploading file" }) };
    
  }

  
  try {
    const dbParams = new PutCommand({
      TableName: "FileTable",
      Item: {
        id: fileId,
        input_text: inputText,
        input_file_path: filePath
      },
    });

    const response = await docClient.send(dbParams);
    console.log("DynamoDB response:", response);
    return { statusCode: 200, body: JSON.stringify({ message: "Data saved successfully", response }) };
    
  } catch (error) {
    console.log("Error saving data to DynamoDB:", error);
    return { statusCode: 500, body: JSON.stringify({ message: "Error saving data to DynamoDB" }) };
  }
};