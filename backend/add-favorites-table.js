require('dotenv').config();
const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function addFavoritesTable() {
  try {
    console.log('🚀 Adding favorites table to DynamoDB...\n');

    // Check existing tables
    const listCommand = new ListTablesCommand({});
    const existingTables = await dynamoClient.send(listCommand);
    console.log('📋 Existing tables:', existingTables.TableNames || []);

    // Create Favorites Table
    console.log('\n📝 Creating favorites table...');
    const createFavoritesTable = new CreateTableCommand({
      TableName: 'campus-share-favorites',
      AttributeDefinitions: [
        { AttributeName: 'favoriteId', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'listingId', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'favoriteId', KeyType: 'HASH' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'userId-index',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
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
          IndexName: 'userId-listingId-index',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'listingId', KeyType: 'RANGE' }
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

    await dynamoClient.send(createFavoritesTable);
    console.log('✅ Favorites table created successfully!');

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

addFavoritesTable();
