require('dotenv').config();
const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

// Check if AWS credentials are available
const hasAwsCredentials = process.env.AWS_ACCESS_KEY_ID && 
                         process.env.AWS_SECRET_ACCESS_KEY && 
                         process.env.AWS_REGION;

if (!hasAwsCredentials) {
  console.log('❌ AWS credentials not found in environment variables');
  console.log('Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION');
  process.exit(1);
}

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function createTables() {
  try {
    console.log('🚀 Starting DynamoDB table creation...\n');

    // Check existing tables
    const listCommand = new ListTablesCommand({});
    const existingTables = await dynamoClient.send(listCommand);
    console.log('📋 Existing tables:', existingTables.TableNames || []);

    // Create Users Table
    console.log('\n📝 Creating users table...');
    const createUsersTable = new CreateTableCommand({
      TableName: 'campus-share-users',
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'email-index',
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    await dynamoClient.send(createUsersTable);
    console.log('✅ Users table created successfully!');

    // Create Listings Table
    console.log('\n📝 Creating listings table...');
    const createListingsTable = new CreateTableCommand({
      TableName: 'campus-share-listings',
      AttributeDefinitions: [
        { AttributeName: 'listingId', AttributeType: 'S' },
        { AttributeName: 'sellerId', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'listingId', KeyType: 'HASH' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'sellerId-index',
          KeySchema: [
            { AttributeName: 'sellerId', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    await dynamoClient.send(createListingsTable);
    console.log('✅ Listings table created successfully!');

    // Create Groups Table
    console.log('\n📝 Creating groups table...');
    const createGroupsTable = new CreateTableCommand({
      TableName: 'campus-share-groups',
      AttributeDefinitions: [
        { AttributeName: 'groupId', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'groupId', KeyType: 'HASH' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    await dynamoClient.send(createGroupsTable);
    console.log('✅ Groups table created successfully!');

    // Create User Groups Table
    console.log('\n📝 Creating user-groups table...');
    const createUserGroupsTable = new CreateTableCommand({
      TableName: 'campus-share-user-groups',
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'groupId', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' },
        { AttributeName: 'groupId', KeyType: 'RANGE' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    await dynamoClient.send(createUserGroupsTable);
    console.log('✅ User Groups table created successfully!');

    console.log('\n🎉 All tables created successfully!');
    console.log('\n📋 Final table list:');
    const finalTables = await dynamoClient.send(new ListTablesCommand({}));
    console.log(finalTables.TableNames);

  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('⚠️  Some tables already exist. This is fine!');
    } else {
      console.error('❌ Error creating tables:', error.message);
      console.error('Full error:', error);
    }
  }
}

createTables();
