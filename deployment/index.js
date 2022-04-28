if (process.argv.length < 8) {
  console.log(`Usage: ${process.argv[0]} ${process.argv[1]} accessKeyId accessKeySecret region bucket local_path remote_path`);
  process.exit(1);
}

const accessKeyId = process.argv[2];
const accessKeySecret = process.argv[3];
const region = process.argv[4];
const bucket = process.argv[5];
const local_path = process.argv[6];
const remote_path = process.argv[7];

const OSS = require('ali-oss');
const client = new OSS({
  region,
  accessKeyId,
  accessKeySecret,
  bucket
});

client.put(remote_path, local_path).then((result) => {
  if (result.res.status !== 200) {
    console.log(`Failed to upload ${local_path} to ${remote_path}`);
    process.exit(1);
  }
  console.log(`${local_path} uploaded to ${remote_path}`);
  process.exit(0);
});
