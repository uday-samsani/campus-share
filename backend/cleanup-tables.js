require('dotenv').config();
const { DynamoDBClient, DeleteTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function cleanupTables() {
  try {
    console.log('🧹 Cleaning up incorrectly created tables...\n');

    const listCommand = new ListTablesCommand({});
    const tables = await dynamoClient.send(listCommand);
    
    // Tables to delete (the incorrectly created ones)
    const tablesToDelete = [
      'campus-share',
      'campus-share-groups', 
      'campus-share-listings',
      'campus-share-user-groups',
      'campus-share-users',
      'email-index',
      'sellerId-index'
    ];

    for (const tableName of tablesToDelete) {
      if (tables.TableNames.includes(tableName)) {
        console.log(`🗑️  Deleting table: ${tableName}`);
        try {
          const deleteCommand = new DeleteTableCommand({ TableName: tableName });
          await dynamoClient.send(deleteCommand);
          console.log(`   ✅ Deleted: ${tableName}`);
        } catch (error) {
          console.log(`   ⚠️  Error deleting ${tableName}: ${error.message}`);
        }
      }
    }

    console.log('\n⏳ Waiting for tables to be deleted...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

    console.log('\n📋 Remaining tables:');
    const remainingTables = await dynamoClient.send(new ListTablesCommand({}));
    console.log(remainingTables.TableNames);

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

cleanupTables();
