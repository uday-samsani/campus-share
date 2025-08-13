const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// Check if AWS credentials are available
const hasAwsCredentials = process.env.AWS_ACCESS_KEY_ID && 
                         process.env.AWS_SECRET_ACCESS_KEY && 
                         process.env.AWS_S3_BUCKET_NAME;

let s3 = null;
let upload = null;

if (hasAwsCredentials) {
  try {
    console.log('AWS credentials found. Configuring S3...');
    
    // Configure AWS SDK v3
    s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });

    // Test S3 connection
    const { ListBucketsCommand } = require('@aws-sdk/client-s3');
    s3.send(new ListBucketsCommand({})).then(data => {
      console.log('S3 connection successful. Available buckets:', data.Buckets.map(b => b.Name));
    }).catch(err => {
      console.error('S3 connection test failed:', err.message);
    });

    // Configure multer for S3 upload (compatible with multer-s3 v3)
    upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        // Remove ACL since bucket doesn't allow it
        key: function (req, file, cb) {
          // Generate unique filename - use fieldname to determine path
          let path = 'listings/';
          if (file.fieldname === 'image') {
            path = 'profiles/';
          }
          const fileName = `${path}${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
          cb(null, fileName);
        },
        contentType: function (req, file, cb) {
          cb(null, file.mimetype);
        },
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        }
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 files per upload
      },
      fileFilter: function (req, file, cb) {
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      }
    });
    
    console.log('S3 upload configuration successful!');
  } catch (error) {
    console.error('AWS S3 configuration error:', error);
    console.log('S3 uploads will be disabled. Add AWS credentials to enable.');
  }
} else {
  console.log('AWS credentials not found. S3 uploads will be disabled.');
  console.log('To enable S3 uploads, add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME to your .env file');
}

// Function to delete image from S3
const deleteImage = async (imageUrl) => {
  try {
    if (!s3 || !imageUrl || !imageUrl.includes(process.env.AWS_S3_BUCKET_NAME)) {
      return false;
    }
    
    const key = imageUrl.split('.com/')[1];
    if (!key) return false;
    
    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    }));
    
    return true;
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    return false;
  }
};

// Function to get signed URL for private uploads (if needed)
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    if (!s3) return null;
    
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Expires: expiresIn
    };
    
    return await s3.getSignedUrl('putObject', params);
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

module.exports = {
  upload,
  s3,
  deleteImage,
  getSignedUrl
};
