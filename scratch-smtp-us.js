const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: 'AKIASZKR5IZR7YQJXN6L',
    pass: 'BKM6MTjGMyssJMQDWdyxxj/6C8I3YI7JrmYN960Hz9Dl'
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.log('Error:', err.message);
  } else {
    console.log('Success:', success);
  }
});
