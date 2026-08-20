const nodemailer = require('nodemailer');
const regions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-south-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
  'ca-central-1', 'eu-central-1', 'eu-west-1', 'eu-west-2', 'sa-east-1'
];

async function testAll() {
  for (const region of regions) {
    const transporter = nodemailer.createTransport({
      host: `email-smtp.${region}.amazonaws.com`,
      port: 465,
      secure: true,
      auth: {
        user: 'AKIASZKR5IZR4XUYJBV5',
        pass: 'BGbzoRuYEuNgNStBuej9Y5bQnT4zJnGQBzEJ/sq5w1C+',
      }
    });

    try {
      await new Promise((resolve, reject) => {
        transporter.verify((err, success) => {
          if (err) reject(err);
          else resolve(success);
        });
      });
      console.log(`${region} SUCCESS`);
      return; // Stop on first success
    } catch (err) {
      if (err.message.includes('535 Authentication Credentials Invalid')) {
        // expected for wrong region? 
      } else {
        console.log(`${region} ERROR:`, err.message);
      }
    }
  }
  console.log('All regions failed with 535 or timeout.');
}
testAll();
