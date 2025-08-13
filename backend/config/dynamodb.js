const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

// Check if AWS credentials are available
const hasAwsCredentials = process.env.AWS_ACCESS_KEY_ID && 
                         process.env.AWS_SECRET_ACCESS_KEY && 
                         process.env.AWS_REGION;

let dynamoClient = null;
let docClient = null;

if (hasAwsCredentials) {
  try {
    console.log('AWS credentials found. Configuring DynamoDB...');
    
    // Create DynamoDB client
    dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });

    // Create DynamoDB Document Client for easier operations
    docClient = DynamoDBDocumentClient.from(dynamoClient);

    console.log('DynamoDB configuration successful!');
  } catch (error) {
    console.error('DynamoDB configuration error:', error);
    console.log('DynamoDB will be disabled. Add AWS credentials to enable.');
  }
} else {
  console.log('AWS credentials not found. DynamoDB will be disabled.');
  console.log('To enable DynamoDB, add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION to your .env file');
}

module.exports = { dynamoClient, docClient };
