//Used index.js for lambda function as Nanoid failed to import.

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const s3Client = new S3Client();
const dynamoDbClient = new DynamoDBClient();
const { crypto } = require('crypto');

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

exports.handler = async (event) => {
  
  
  const bucketName = process.env.BUCKET_NAME;
  const inputFilePath = process.env.INPUT_FILE_PATH; //locaiton of the file within S3 bucket
  
  try {
    //fetch input file from S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: inputFilePath,
    });
    const inputFile = await s3Client.send(getObjectCommand);
    const fileContents = await streamToString(inputFile.Body); //read con
    
    //extract required fields
    const { input_text, input_file_path } = parseFile(fileContents);
    

    const id = generateUniqueId();
    
    //store data to DynamoDB
    const putItemCommand = new PutItemCommand({
      TableName: 'FileTable',
      Item: {
        id: { S: id },
        input_text: { S: input_text },
        input_file_path: { S: input_file_path },
      },
    });
    await dynamoDbClient.send(putItemCommand);
    
    //debugging purposes
    console.log("id:", id);
    console.log("input text:", input_text);
    console.log("path:", input_file_path);
    
    return { statusCode: 200, body: JSON.stringify({ message: 'Data processed successfully' }) }; //debug
    
      

  } catch (error) {
    console.error('Error processing file:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Error processing file' }) };

  }
  
};
  
//helper functions
function parseFile(contents) {
  const data = {};
  contents.split('\n').forEach(line => {
    const [key, value] = line.split(':').map(str => str.trim());
    data[key] = value;
  });

  return {
    //id: data.id,
    input_text: data.input_text,
    input_file_path: data.input_file_path,
  };
}
