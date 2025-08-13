const { docClient } = require('../config/dynamodb');
const { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'campus-share-groups';
const USER_GROUPS_TABLE = 'campus-share-user-groups';

class StudyGroup {
  static async create(groupData) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const groupId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const group = {
      groupId,
      name: groupData.name,
      description: groupData.description,
      course: groupData.course,
      subject: groupData.subject,
      maxMembers: groupData.maxMembers || 10,
      currentMembers: [{
        userId: groupData.creatorId,
        role: 'admin',
        joinedAt: timestamp
      }],
      status: 'active',
      meetingSchedule: groupData.meetingSchedule || [],
      creatorId: groupData.creatorId,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Create the group
    const groupCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: group
    });

    await docClient.send(groupCommand);

    // Add creator to user-groups table
    const userGroupCommand = new PutCommand({
      TableName: USER_GROUPS_TABLE,
      Item: {
        userId: groupData.creatorId,
        groupId: groupId,
        joinedAt: timestamp,
        role: 'admin'
      }
    });

    await docClient.send(userGroupCommand);

    return group;
  }

  static async findById(groupId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { groupId }
    });

    const result = await docClient.send(command);
    return result.Item || null;
  }

  static async findAll(filters = {}, page = 1, limit = 12) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    let filterExpression = '';
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};

    // Build filter expressions
    if (filters.subject) {
      filterExpression += 'subject = :subject';
      expressionAttributeValues[':subject'] = filters.subject;
    }

    if (filters.status) {
      if (filterExpression) filterExpression += ' AND ';
      filterExpression += '#status = :status';
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = filters.status;
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
      groups: paginatedItems,
      total: items.length,
      currentPage: page,
      totalPages: Math.ceil(items.length / limit)
    };
  }

  static async findByUser(userId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    // Get all groups the user is a member of
    const userGroupsCommand = new QueryCommand({
      TableName: USER_GROUPS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    });

    const userGroupsResult = await docClient.send(userGroupsCommand);
    const userGroups = userGroupsResult.Items || [];

    if (userGroups.length === 0) {
      return [];
    }

    // Get the actual group details
    const groupIds = userGroups.map(ug => ug.groupId);
    const groups = [];

    for (const groupId of groupIds) {
      const group = await this.findById(groupId);
      if (group) {
        groups.push(group);
      }
    }

    return groups;
  }

  static async joinGroup(userId, groupId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    // Check if user is already a member
    const existingMembership = await docClient.send(new GetCommand({
      TableName: USER_GROUPS_TABLE,
      Key: { userId, groupId }
    }));

    if (existingMembership.Item) {
      throw new Error('User is already a member of this group');
    }

    // Get the group to check capacity
    const group = await this.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if ((group.currentMembers || []).length >= group.maxMembers) {
      throw new Error('Group is full');
    }

    // Add user to group
    const userGroupCommand = new PutCommand({
      TableName: USER_GROUPS_TABLE,
      Item: {
        userId,
        groupId,
        joinedAt: new Date().toISOString(),
        role: 'member'
      }
    });

    await docClient.send(userGroupCommand);

    // Update group member count
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { groupId },
      UpdateExpression: 'SET currentMembers = list_append(if_not_exists(currentMembers, :empty_list), :newMember), updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':newMember': [{
          userId: userId,
          role: 'member',
          joinedAt: new Date().toISOString()
        }],
        ':empty_list': [],
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(updateCommand);
    return result.Attributes;
  }

  static async leaveGroup(userId, groupId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    // Remove user from user-groups table
    await docClient.send(new DeleteCommand({
      TableName: USER_GROUPS_TABLE,
      Key: { userId, groupId }
    }));

    // Update group member count
    const group = await this.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const updatedMembers = (group.currentMembers || []).filter(member => member.userId !== userId);
    
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { groupId },
      UpdateExpression: 'SET currentMembers = :updatedMembers, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':updatedMembers': updatedMembers,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(updateCommand);
    return result.Attributes;
  }

  static async update(groupId, updateData) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    const timestamp = new Date().toISOString();
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updateData).forEach(key => {
      if (key !== 'groupId') {
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
      Key: { groupId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await docClient.send(command);
    return result.Attributes;
  }

  static async delete(groupId) {
    if (!docClient) {
      throw new Error('DynamoDB not configured');
    }

    // Delete all user-group relationships
    const userGroupsCommand = new QueryCommand({
      TableName: USER_GROUPS_TABLE,
      KeyConditionExpression: 'groupId = :groupId',
      ExpressionAttributeValues: {
        ':groupId': groupId
      }
    });

    const userGroupsResult = await docClient.send(userGroupsCommand);
    const userGroups = userGroupsResult.Items || [];

    // Delete each user-group relationship
    for (const userGroup of userGroups) {
      await docClient.send(new DeleteCommand({
        TableName: USER_GROUPS_TABLE,
        Key: { userId: userGroup.userId, groupId: userGroup.groupId }
      }));
    }

    // Delete the group
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { groupId }
    }));
  }
}

module.exports = StudyGroup;
