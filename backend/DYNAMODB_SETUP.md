# AWS DynamoDB Setup Guide for CampusShare

## 🚀 **Step 1: Create DynamoDB Tables**

### **Users Table**
- **Table Name**: `campus-share-users`
- **Partition Key**: `userId` (String)
- **Additional Attributes**:
  - `email` (String)
  - `firstName` (String)
  - `lastName` (String)
  - `university` (String)
  - `major` (String)
  - `year` (Number)
  - `password` (String)
  - `rating` (Number)
  - `totalRatings` (Number)
  - `createdAt` (String)
  - `updatedAt` (String)

**Global Secondary Index (GSI) for email lookup:**
- **Index Name**: `email-index`
- **Partition Key**: `email` (String)

### **Listings Table**
- **Table Name**: `campus-share-listings`
- **Partition Key**: `listingId` (String)
- **Additional Attributes**:
  - `title` (String)
  - `description` (String)
  - `price` (Number)
  - `priceType` (String)
  - `category` (String)
  - `condition` (String)
  - `location` (String)
  - `images` (List of Strings)
  - `sellerId` (String)
  - `createdAt` (String)
  - `updatedAt` (String)

**Global Secondary Index (GSI) for seller lookup:**
- **Index Name**: `sellerId-index`
- **Partition Key**: `sellerId` (String)

### **Study Groups Table**
- **Table Name**: `campus-share-groups`
- **Partition Key**: `groupId` (String)
- **Additional Attributes**:
  - `name` (String)
  - `description` (String)
  - `course` (String)
  - `subject` (String)
  - `maxMembers` (Number)
  - `currentMembers` (List of Strings)
  - `status` (String)
  - `meetingSchedule` (List of Maps)
  - `createdBy` (String)
  - `createdAt` (String)
  - `updatedAt` (String)

### **User Groups Table (Many-to-Many Relationship)**
- **Table Name**: `campus-share-user-groups`
- **Partition Key**: `userId` (String)
- **Sort Key**: `groupId` (String)
- **Additional Attributes**:
  - `joinedAt` (String)
  - `role` (String)

## 🔐 **Step 2: IAM Permissions**

Add these permissions to your existing IAM user or create a new one:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/campus-share-*",
        "arn:aws:dynamodb:*:*:table/campus-share-*/index/*"
      ]
    }
  ]
}
```

## 🌍 **Step 3: Environment Variables**

Add these to your `.env` file:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

# DynamoDB Tables (optional - defaults will be used)
DYNAMODB_USERS_TABLE=campus-share-users
DYNAMODB_LISTINGS_TABLE=campus-share-listings
DYNAMODB_GROUPS_TABLE=campus-share-groups
DYNAMODB_USER_GROUPS_TABLE=campus-share-user-groups
```

## 📊 **Step 4: Table Creation Commands**

### **Using AWS CLI:**

```bash
# Create Users Table
aws dynamodb create-table \
  --table-name campus-share-users \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes IndexName=email-index,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST

# Create Listings Table
aws dynamodb create-table \
  --table-name campus-share-listings \
  --attribute-definitions AttributeName=listingId,AttributeType=S AttributeName=sellerId,AttributeType=S \
  --key-schema AttributeName=listingId,KeyType=HASH \
  --global-secondary-indexes IndexName=sellerId-index,KeySchema=[{AttributeName=sellerId,KeyType=HASH}],Projection={ProjectionType=ALL} \
  --billing-mode PAY_PER_REQUEST

# Create Groups Table
aws dynamodb create-table \
  --table-name campus-share-groups \
  --attribute-definitions AttributeName=groupId,AttributeType=S \
  --key-schema AttributeName=groupId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Create User Groups Table
aws dynamodb create-table \
  --table-name campus-share-user-groups \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=groupId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH AttributeName=groupId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

## 🔍 **Step 5: Verify Setup**

Test your DynamoDB connection:

```bash
# List tables
aws dynamodb list-tables

# Describe a table
aws dynamodb describe-table --table-name campus-share-users
```

## ⚠️ **Important Notes**

1. **Billing Mode**: Using `PAY_PER_REQUEST` for development. Switch to `PROVISIONED` for production with specific read/write capacity.

2. **Indexes**: Global Secondary Indexes (GSI) are essential for efficient queries on non-primary keys.

3. **Data Types**: DynamoDB uses different data types than MongoDB:
   - `String` for text
   - `Number` for numeric values
   - `List` for arrays
   - `Map` for objects

4. **Performance**: 
   - Use Query operations instead of Scan when possible
   - Implement pagination for large datasets
   - Consider using DynamoDB Streams for real-time updates

5. **Security**: 
   - Use IAM roles instead of access keys in production
   - Enable encryption at rest
   - Use VPC endpoints for private access

## 🚀 **Next Steps**

After setting up the tables:

1. **Test the connection** by starting your backend server
2. **Verify table access** by creating a test user
3. **Monitor CloudWatch** for any errors or performance issues
4. **Set up backups** using DynamoDB point-in-time recovery
5. **Configure auto-scaling** if using provisioned capacity
