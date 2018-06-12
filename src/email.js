const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const email = {
  sendRecover() {
    transport.sendMail({
      from: 'William King <contact@wking.io>',
      to: 'william@example.com',
      subject: 'Just trying things out!',
      html: 'Hey <strong>Cool</strong>',
      text: 'Hey **Cool**',
    });
    return true;
  },
};

module.exports = email;
