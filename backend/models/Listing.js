const { docClient } = require('../config/dynamodb');
const { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'campus-share-listings';

class Listing {
  static async create(listingData) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const listingId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const listing = {
      listingId,
      title: listingData.title,
      description: listingData.description,
      price: listingData.price,
      priceType: listingData.priceType,
      category: listingData.category,
      condition: listingData.condition,
      location: listingData.location,
      images: listingData.images || [],
      sellerId: listingData.sellerId,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: listing
    });

    await docClient.send(command);
    return listing;
  }

  static async findById(listingId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { listingId }
    });

    const result = await docClient.send(command);
    return result.Item || null;
  }

  static async findBySeller(sellerId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'sellerId-index', // You'll need to create this GSI
      KeyConditionExpression: 'sellerId = :sellerId',
      ExpressionAttributeValues: {
        ':sellerId': sellerId
      }
    });

    const result = await docClient.send(command);
    return result.Items || [];
  }

  static async findAll(filters = {}, page = 1, limit = 12) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    let filterExpression = '';
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};

    // Build filter expressions
    if (filters.category) {
      filterExpression += 'category = :category';
      expressionAttributeValues[':category'] = filters.category;
    }

    if (filters.priceType) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += 'priceType = :priceType';
      expressionAttributeValues[':priceType'] = filters.priceType;
    }

    if (filters.condition) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += 'condition = :condition';
      expressionAttributeValues[':condition'] = filters.condition;
    }

    if (filters.search) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += '(contains(title, :search) OR contains(description, :search))';
      expressionAttributeValues[':search'] = filters.search;
    }

    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: filterExpression || undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: limit
    });

    const result = await docClient.send(command);
    const items = result.Items || [];
    
    // Sort by creation date (newest first)
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Simple pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return {
      listings: paginatedItems,
      total: items.length,
      currentPage: page,
      totalPages: Math.ceil(items.length / limit)
    };
  }

  static async update(listingId, updateData) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const timestamp = new Date().toISOString();
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updateData).forEach(key => {
      if (key !== 'listingId' && key !== 'sellerId') {
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
      Key: { listingId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(command);
    return result.Attributes;
  }

  static async delete(listingId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { listingId }
    });

    await docClient.send(command);
    return true;
  }
}

module.exports = Listing;
