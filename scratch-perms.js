const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'email-smtp.ap-south-1.amazonaws.com',
  port: 465,
  secure: true
});

const usernames = [
  'AKIASZKR5IZR7YQJXN6L',
  'AKIASZKR51ZR7YQJXN6L'
];

const passwords = [
  'BKM6MTjGMyssJMQDWdyxxj/6C8I3YI7JrmYN960Hz9Dl',
  'BKM6MTjGMyssJMQDWdyxxj/6C813Y17JrmYN960Hz9Dl',
  'BKM6MTjGMyssJMQDWdyxxj/6C8I3YI7JrmYN960Hz9D1',
  'BKM6MTjGMyssJMQDWdyxxj/6C813Y17JrmYN960Hz9D1',
  'BKM6MTjGMyssJMQDWdyxxj/6C8I3YI7JrmYN960Hz9DI',
  'BKM6MTjGMyssJMQDWdyxxj/6C813Y17JrmYN960Hz9DI',
];

async function tryPerms() {
  for (const user of usernames) {
    for (const pass of passwords) {
      console.log(`Trying ${user} / ${pass}`);
      try {
        const t = nodemailer.createTransport({
          host: 'email-smtp.ap-south-1.amazonaws.com',
          port: 465,
          secure: true,
          auth: { user, pass }
        });
        await new Promise((resolve, reject) => {
          t.verify((err, success) => {
            if (err) reject(err); else resolve(success);
          });
        });
        console.log('SUCCESS!!', user, pass);
        return;
      } catch (err) {
        // ignore
      }
    }
  }
  console.log('All failed.');
}
tryPerms();
