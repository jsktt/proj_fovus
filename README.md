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
5. In order to make sure that Lambda can communicate to DynamoDB without restrictions, create a custom IAM policy through the policy editor.
```
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "ExampleStmt",
			"Action": [
				"s3:GetObject",
				"s3:PutObject",
				"s3:PutObjectAcl",
				"s3:PutObjectTagging",
				"ec2:TerminateInstances"
			],
			"Effect": "Allow",
			"Resource": "*"
		}
	]
}
```
On top of those, I also included the AWS managed policies: AmazonDynamoDBFullAccess, AmazonS3ReadOnlyAccess.
5. Going back to the AWS Lambda Console page, copy the index.js code to the code source window, and deploy. I created a test environment to make sure that the code works, as shown below in the image. 
![.png failed to load](lambda.png)

## EC-2 Instance and a trigger script.

1. Create an EC-2 instance in the EC-2 AWS Console page. For this project I used amazon Linux.
2. Create a new IAM role, but this time select EC2 for the use case.
3. The included policies I have for this role is AmazonDynamoDBFullAccess, AmazonS3ReadOnlyAccess, AmazonSSMManagedInstanceCore, and the custom MyLambdaPolicy.
4. Create a IAM role for the EC-2 instance, and attach the IAM role which can be done in the instances tab under the EC-2 AWS Console Page. (Right click the instance id -> security -> Modify IAM Role)
5. To run the EC-2 Instance, go to the System Manager console, and click on session Manager at the left side bar. Go to start session and click the instance that was recently created. 
6. The requirement states no SSH, so the VM could be used by ```sudo su ec2-user```.
7. upload the script.py provided in the github to S3, under the same bucket.
8. As I prefer using python, boto3 has to be imported through pip. The full instruction is below.
install pip: ```sudo yum install -y python3-pip```
install nanoid: ```pip3 install nanoid```
install boto3: ```sudo pip3 install boto3```
aws cli: ```sudo yum install -y aws-cli``` (installed for debug convinences)

As the requirements asks for no hard codes, the variable BUCKET_NAME can be initialized: ```export BUCKET_NAME='your_bucket_name'```. Echo the variable in the instance to make sure that it is declared. 

10. Download the script from S3: ```aws s3 cp s3://your_bucket_name/script.py-path /home/ec2-user/script.py```
11. Execute the script: ```python3 /home/ec2-user/script.py```
