# AWS S3 Setup Guide

## 1. Create AWS S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `campus-share-images`)
4. Select your preferred region
5. Keep default settings for now
6. Click "Create bucket"

## 2. Configure Bucket for Public Access

1. Click on your bucket name
2. Go to "Permissions" tab
3. Under "Block public access", click "Edit"
4. Uncheck "Block all public access"
5. Check "I acknowledge that the current settings might result in this bucket and the objects within it becoming public"
6. Click "Save changes"

## 3. Update Bucket Policy

1. In "Permissions" tab, click "Bucket policy"
2. Add this policy (replace `your-bucket-name` with your actual bucket name):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

## 4. Create IAM User

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Create user"
3. Enter username (e.g., `campus-share-upload`)
4. Select "Programmatic access"
5. Click "Next: Permissions"

## 5. Attach S3 Policy

1. Click "Attach existing policies directly"
2. Search for "AmazonS3FullAccess" or create custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

## 6. Get Access Keys

1. Complete user creation
2. Click on the created user
3. Go to "Security credentials" tab
4. Click "Create access key"
5. Copy Access Key ID and Secret Access Key

## 7. Update Environment Variables

Add these to your `.env` file:

```env
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

## 8. Test Upload

1. Restart your backend server
2. Try creating a listing with images
3. Check S3 bucket for uploaded files

## Security Notes

- The bucket is public for reading (images need to be publicly accessible)
- Only authenticated users can upload
- Consider implementing image optimization and CDN for production
- Monitor S3 costs and set up billing alerts
