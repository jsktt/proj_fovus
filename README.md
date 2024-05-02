#  README
This readme will have instructions to set-up, and run the code. 

## Uploading inputfile to S3 Bucket.

![.png failed to load](gui.png)
Through the interactive GUI, a file named info.txt will be  downlaoded to the hosts download folder.

1. In the S3 AWS Console page, create a bucket, with the option to block all public access on.
2. Inside the bucket, upload the info.txt to the bucket. My info.txt was in the following format for testing purposes:
```
id: 12345
input_text:testing
input_file_path: bucketName/inputfile.txt
```
## Upload file to DynamoDB via API gateway and Lambda Function.

1. In order to save the file to DynamoDB, first create a table in the DynamoDB Console page in AWS, and call it FileTable.
2. In the AWS Lambda Console Page, create a new function, I have named it file-function.
3. In the API gateway page in AWS Console, go to Routes page accessed at the left side bar, and implement the following routes.
  - /items -> POST
  - /items/{id} -> GET, PUT, DELETE
4. To make sure they are integerated to AWS Lambda, go to the integerations page acced through the left side bar. Click on any route, and attach it to your Lambda function.
5. Going back to the AWS Lambda Console page, copy the index.js code to the code source window, and deploy. I created a test environment to make sure that the code works, as shown below in the image. 
![.png failed to load](lambda.png)


