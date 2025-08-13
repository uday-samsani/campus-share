const { docClient } = require('../config/dynamodb');
const { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'campus-share-proposals';

class Proposal {
  static async create(proposalData) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const proposalId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const proposal = {
      proposalId,
      listingId: proposalData.listingId,
      buyerId: proposalData.buyerId,
      sellerId: proposalData.sellerId,
      message: proposalData.message,
      proposedPrice: proposalData.proposedPrice,
      status: 'pending', // pending, accepted, rejected, withdrawn
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: proposal
    });

    await docClient.send(command);
    return proposal;
  }

  static async findById(proposalId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { proposalId }
    });

    const result = await docClient.send(command);
    return result.Item || null;
  }

  static async findByListing(listingId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'listingId-index',
      KeyConditionExpression: 'listingId = :listingId',
      ExpressionAttributeValues: {
        ':listingId': listingId
      }
    });

    const result = await docClient.send(command);
    return result.Items || [];
  }

  static async findByBuyer(buyerId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'buyerId-index',
      KeyConditionExpression: 'buyerId = :buyerId',
      ExpressionAttributeValues: {
        ':buyerId': buyerId
      }
    });

    const result = await docClient.send(command);
    return result.Items || [];
  }

  static async findBySeller(sellerId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'sellerId-index',
      KeyConditionExpression: 'sellerId = :sellerId',
      ExpressionAttributeValues: {
        ':sellerId': sellerId
      }
    });

    const result = await docClient.send(command);
    return result.Items || [];
  }

  static async update(proposalId, updateData) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const timestamp = new Date().toISOString();
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updateData).forEach(key => {
      if (key !== 'proposalId') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = updateData[key];
      }
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = timestamp;

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { proposalId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(command);
    return result.Attributes;
  }

  static async delete(proposalId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { proposalId }
    });

    await docClient.send(command);
    return true;
  }

  static async updateStatus(proposalId, status) {
    return this.update(proposalId, { status });
  }
}

module.exports = Proposal;
