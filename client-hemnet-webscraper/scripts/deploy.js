'use strict';

require('dotenv').config();

const {spawn} = require('child_process');

const awsSync = spawn('aws',
    ['s3', 'sync', 'build', 's3://' + process.env.S3_BUCKET_NAME]
);

awsSync.stdout.on('data', data => {
  console.log(`stdout: ${data}`);
});

awsSync.stderr.on('data', data => {
  console.log(`stderr: ${data}`);
});

awsSync.on('close', code => {
  console.log(`Sync process successfully finished with code: ${code}`);

  const clearCache = spawn('aws',
      ['cloudfront', 'create-invalidation', '--paths', '/*', '--distribution-id', process.env.DISTRIBUTION_ID]
  );

  clearCache.stdout.on('data', data => {
    console.log(`stdout: ${data}`);
  });

  clearCache.stderr.on('data', data => {
    console.log(`stderr: ${data}`);
  });

  clearCache.on('close', code => {
    console.log(`Clear cache process successfully finished with code: ${code}`);
  });
});