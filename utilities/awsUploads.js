const fs = require('fs');
const AWS = require('aws-sdk');
const bluebird = require('bluebird');
const multiparty = require('multiparty');

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
};

getUploadParameters = (file, folder) => {
  return {
    path: file.path,
    buffer: fs.createReadStream(file.path),
    type: file.headers['content-type'],
    name: `${folder}/${file.originalFilename}`,
  }
};

const parseUploadData = (req) => new Promise((resolve, reject) => {
  const form = new multiparty.Form();

  form.parse(req, (error, fields, files) => {
    if (error) return reject(error);

    const { profileImage, coverImage } = files;

    const bucket_name = fields.bucket[0];
    const profile_params = profileImage ? getUploadParameters(profileImage[0], 'profileImages') : null;
    const cover_params = coverImage ? getUploadParameters(coverImage[0], 'coverImages') : null;


    return resolve({ bucket_name, profile_params, cover_params, fields });
  })
});

const getFileFromS3 = async ({ bucket_name, name }) => {
  const params = { Bucket: getBucketName(bucket_name), Key: name }
  try {
    await s3.headObject(params);
    const signedUrl = s3.getSignedUrl('getObject', params);
    const url = signedUrl.substring(0, signedUrl.indexOf('?'));
    console.log('File Already exists @ url: ', url);

    return { status: true, url: url };
  } catch (error) {
    if (error.statusCode === 404) return { status: false, message: 'File not found' };
    console.error('Unexpected Error', error)
  }
}

const uploadFile = (args, bucketName) => {
  const params = {
    ACL: 'public-read',
    Body: args.buffer,
    Bucket: getBucketName(bucketName),
    ContentType: args.type,
    Key: `${args.name}`
  };
  return s3.upload(params).promise();
};

exports.findOrCreateFile = async ({ bucket_name, profile_params, cover_params }) => {
  const stateChanges = {};

  if (profile_params) {
    const existing_profile = await getFileFromS3({ bucket_name, ...profile_params });

    if (existing_profile.status) {
      stateChanges.mainImage = existing_profile.url;
    } else {
      const profile_response = profile_params && await uploadFile(profile_params, bucket_name);
      stateChanges.mainImage = profile_response.Location;
    }
  }

  if (cover_params) {
    const existing_cover = await getFileFromS3({ bucket_name, ...cover_params });

    if (existing_cover.status) {
      stateChanges.backgroundImage = existing_cover.url;
    } else {
      const cover_response = cover_params && await uploadFile(cover_params, bucket_name);
      stateChanges.backgroundImage = cover_response.Location;
    }
  }

  return stateChanges;
};

exports.parseUploadData = parseUploadData;
exports.getFileFromS3 = getFileFromS3;
exports.uploadFile = uploadFile;