const { docClient } = require('../config/dynamodb');
const { PutCommand, GetCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'campus-share-favorites';

class Favorite {
  static async addFavorite(userId, listingId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const favoriteId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const favorite = {
      favoriteId,
      userId,
      listingId,
      createdAt: timestamp
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: favorite
    });

    await docClient.send(command);
    return favorite;
  }

  static async removeFavorite(userId, listingId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    // Find the favorite first
    const favorites = await this.findByUserAndListing(userId, listingId);
    if (favorites.length === 0) {
      throw new Error('Favorite not found');
    }

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { favoriteId: favorites[0].favoriteId }
    });

    await docClient.send(command);
    return true;
  }

  static async findByUser(userId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    });

    const result = await docClient.send(command);
    return result.Items || [];
  }

  static async findByUserAndListing(userId, listingId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'userId-listingId-index',
      KeyConditionExpression: 'userId = :userId AND listingId = :listingId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':listingId': listingId
      }
    });

    const result = await docClient.send(command);
    return result.Items || [];
  }

  static async isFavorited(userId, listingId) {
    const favorites = await this.findByUserAndListing(userId, listingId);
    return favorites.length > 0;
  }

  static async getFavoriteCount(listingId) {
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
    return result.Items.length;
  }
}

module.exports = Favorite;
