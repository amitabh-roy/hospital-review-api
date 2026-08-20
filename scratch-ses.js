const { SESClient, GetSendQuotaCommand } = require('@aws-sdk/client-ses');
const client = new SESClient({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: 'AKIASZKR5IZR4XUYJBV5',
    secretAccessKey: 'BGbzoRuYEuNgNStBuej9Y5bQnT4zJnGQBzEJ/sq5w1C+',
  }
});

async function run() {
  try {
    const data = await client.send(new GetSendQuotaCommand({}));
    console.log("SDK Success:", data);
  } catch (err) {
    console.log("SDK Error:", err.message);
  }
}
run();
