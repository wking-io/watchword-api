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
  async send(options) {
    console.log('email user ', options);
    const mailOptions = {
      from: 'William King <contact@wking.io>',
      to: options.user.email,
      subject: options.subject,
      html: `Hey, you can reset you password here: <a href="${
        options.resetUrl
      }">Reset Password</a>`,
      text: `Hey, you can reset you password here: ${options.resetUrl}`,
    };

    return transport.sendMail(mailOptions);
  },
};

module.exports = email;
