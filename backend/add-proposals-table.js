require('dotenv').config();
const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function addProposalsTable() {
  try {
    console.log('🚀 Adding proposals table to DynamoDB...\n');

    // Check existing tables
    const listCommand = new ListTablesCommand({});
    const existingTables = await dynamoClient.send(listCommand);
    console.log('📋 Existing tables:', existingTables.TableNames || []);

    // Create Proposals Table
    console.log('\n📝 Creating proposals table...');
    const createProposalsTable = new CreateTableCommand({
      TableName: 'campus-share-proposals',
      AttributeDefinitions: [
        { AttributeName: 'proposalId', AttributeType: 'S' },
        { AttributeName: 'listingId', AttributeType: 'S' },
        { AttributeName: 'buyerId', AttributeType: 'S' },
        { AttributeName: 'sellerId', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'proposalId', KeyType: 'HASH' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'listingId-index',
          KeySchema: [
            { AttributeName: 'listingId', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'buyerId-index',
          KeySchema: [
            { AttributeName: 'buyerId', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
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

    await dynamoClient.send(createProposalsTable);
    console.log('✅ Proposals table created successfully!');

    console.log('\n📋 Final table list:');
    const finalTables = await dynamoClient.send(new ListTablesCommand({}));
    console.log(finalTables.TableNames);

  } catch (error) {
    if (error.name === 'ResourceInUseException') {
      console.log('⚠️  Table already exists. This is fine!');
    } else {
      console.error('❌ Error creating table:', error.message);
      console.error('Full error:', error);
    }
  }
}

addProposalsTable();
