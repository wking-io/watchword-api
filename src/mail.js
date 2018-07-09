const postmark = require('postmark');

var client = new postmark.Client(process.env.POSTMARK_KEY);

const email = {
  async send(options) {
    const mailOptions = {
      From: 'William King <contact@wking.io>',
      To: process.env.NOW ? options.user.email : 'contact@wking.io',
      TemplateId: 7503550,
      TemplateModel: {
        product_name: 'Watchword',
        product_url: 'https://www.watchword.app/',
        name: options.user.name,
        action_url: options.resetUrl,
        company_name: 'Watchword',
      },
    };

    return client.sendEmailWithTemplate(mailOptions, function(error, results) {
      if (error) {
        console.error('Unable to send via postmark: ' + error.message);
        return;
      } else {
        console.info('Messages sent to postmark');
      }
    });
  },
};

module.exports = email;
