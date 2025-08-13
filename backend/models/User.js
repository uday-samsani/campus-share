const { docClient } = require('../config/dynamodb');
const { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'campus-share-users';

class User {
  static async create(userData) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const userId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const user = {
      userId,
      email: userData.email.toLowerCase(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      university: userData.university,
      major: userData.major,
      year: userData.year,
      password: await bcrypt.hash(userData.password, 12),
      profileImage: userData.profileImage || null,
      rating: 0,
      totalRatings: 0,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: 'attribute_not_exists(userId)'
    });

    await docClient.send(command);
    return { ...user, password: undefined };
  }

  static async findByEmail(email) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'email-index', // You'll need to create this GSI
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase()
      }
    });

    const result = await docClient.send(command);
    return result.Items[0] || null;
  }

  static async findById(userId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId }
    });

    const result = await docClient.send(command);
    return result.Item || null;
  }

  static async updateProfile(userId, updateData) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const timestamp = new Date().toISOString();
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updateData).forEach(key => {
      if (key !== 'userId' && key !== 'password' && key !== 'email') {
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
      Key: { userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(command);
    return result.Attributes;
  }

  static async updateRating(userId, newRating) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: 'SET rating = :rating, totalRatings = :totalRatings, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':rating': newRating,
        ':totalRatings': 1,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(command);
    return result.Attributes;
  }
}

module.exports = User;
