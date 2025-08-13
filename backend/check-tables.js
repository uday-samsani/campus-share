require('dotenv').config();
const { DynamoDBClient, DescribeTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function checkTables() {
  try {
    console.log('🔍 Checking DynamoDB table structures...\n');

    const listCommand = new ListTablesCommand({});
    const tables = await dynamoClient.send(listCommand);
    
    for (const tableName of tables.TableNames) {
      console.log(`\n📋 Table: ${tableName}`);
      try {
        const describeCommand = new DescribeTableCommand({ TableName: tableName });
        const tableInfo = await dynamoClient.send(describeCommand);
        
        console.log(`   Primary Key: ${tableInfo.Table.KeySchema.map(k => k.AttributeName).join(' + ')}`);
        console.log(`   Attributes: ${tableInfo.Table.AttributeDefinitions.map(a => `${a.AttributeName} (${a.AttributeType})`).join(', ')}`);
        
        if (tableInfo.Table.GlobalSecondaryIndexes) {
          console.log(`   GSIs: ${tableInfo.Table.GlobalSecondaryIndexes.map(gsi => gsi.IndexName).join(', ')}`);
        }
        
        console.log(`   Item Count: ${tableInfo.Table.ItemCount || 'Unknown'}`);
        console.log(`   Status: ${tableInfo.Table.TableStatus}`);
      } catch (error) {
        console.log(`   ❌ Error describing table: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
}

checkTables();
