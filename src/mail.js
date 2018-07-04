const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const mailTemplate = text => `
  <div className="email" style="
    border:1px solid black;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2;
    font-size: 20px;
  ">
    <h2>Hello There</h2>
    <p>${text}</p>
    <p>👋 Will King</p>
  </div>`;

const email = {
  async send(options) {
    console.log('email user ', options);
    const mailOptions = {
      from: 'William King <contact@wking.io>',
      to: options.user.email,
      subject: options.subject,
      html: mailTemplate(options.message),
    };

    return transport.sendMail(mailOptions);
  },
};

module.exports = email;
