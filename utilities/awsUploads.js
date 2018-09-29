const fs = require('fs');
const AWS = require('aws-sdk');
const bluebird = require('bluebird');

// configure the keys for accessing AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// configure AWS to work with promises
AWS.config.setPromisesDependency(bluebird);

// create S3 instance
const s3 = new AWS.S3({ region: 'us-east-1' });

getBucketName = (bucketName) => {
  switch (bucketName) {
    case 'cause':
      return process.env.S3_CAUSES_BUCKET;
    case 'user':
      return process.env.S3_USERS_BUCKET;
    case 'organization':
      return process.env.S3_ORGANIZATIONS_BUCKET;
    default:
      return;
  }
},

exports.getUploadParameters = (file, folder) => {
  return {
     path: file.path,
     buffer: fs.createReadStream(file.path),
     type: file.headers['content-type'],
     name: `${folder}/${file.originalFilename}`,
  }
}

exports.uploadFile = (args, bucketName) => {
  const params = {
    ACL: 'public-read',
    Body: args.buffer,
    Bucket: getBucketName(bucketName),
    ContentType: args.type,
    Key: `${args.name}`
  };
  return s3.upload(params).promise();
};
