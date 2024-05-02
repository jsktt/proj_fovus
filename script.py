import boto3
import os
import subprocess
from nanoid import generate
import requests

#aws config
s3_bucket_name = os.environ.get("BUCKET_NAME")
input_file_key = "info.txt"  
output_file_key = "output.txt"
dynamodb_table_name = "FileTable"
region = "us-east-2"  

#init aws clients
s3_client = boto3.client('s3', region_name=region)
dynamodb_client = boto3.client('dynamodb', region_name=region)

# download inputfile from S3
print("Bucket name:", s3_bucket_name, "Type:", type(s3_bucket_name))
print("File key:", input_file_key, "Type:", type(input_file_key))
local_input_file = "/tmp/info.txt"
s3_client.download_file(s3_bucket_name, input_file_key, local_input_file)

#read the intput files
input_data = {}
with open(local_input_file, 'r') as file:
    for line in file:
        line = line.strip()
        if ':' in line:
            key, value = line.split(':', 1)
            input_data[key.strip()] = value.strip()

id = input_data.get('id', 'unknown_id')
input_text = input_data.get('input_text', '')
input_file_path = input_data.get('input_file_path', '')

#append additional files
new_text = f"\n[File Content]: {input_text}"

#save to output.txt
local_output_file = "/tmp/output.txt"
with open(local_output_file, 'w') as file:
    file.write(new_text)

#reupload to S3
s3_client.upload_file(local_output_file, s3_bucket_name, output_file_key)

# update it to the DynamoDB
item_id = generate()  
dynamodb_client.put_item(
    TableName=dynamodb_table_name,
    Item={
        'id': {'S': item_id},
        'input_text': {'S': input_text},
        'output_file_path': {'S': f"{s3_bucket_name}/{output_file_key}"}
    }
)

#getting token (fix for the Error:401)
def get_imds_v2_token():
    token_url = "http://169.254.169.254/latest/api/token"
    try:
        response = requests.put(
            token_url,
            headers={"X-aws-ec2-metadata-token-ttl-seconds": "21600"}  # Token TTL in seconds (6 hours)
        )
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Error generating IMDSv2 token: {e}")
        return None


def get_instance_id():
    token = get_imds_v2_token()
    if not token:
        return None

    metadata_url = "http://169.254.169.254/latest/meta-data/instance-id"
    try:
        response = requests.get(
            metadata_url,
            headers={"X-aws-ec2-metadata-token": token}
        )
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching instance ID: {e}")
        return None
    
ec2_client = boto3.client('ec2', region_name=region)

def terminate_instance(instance_id):
    try:
        response = ec2_client.terminate_instances(InstanceIds=[instance_id])
        print("Instance termination initiated:", response)
    except ec2_client.exceptions.ClientError as e:
        print("Error terminating instance:", e)

#terminate VM.
instance_id = get_instance_id()
if instance_id:
    print("Instance ID:", instance_id)
    terminate_instance(instance_id)
