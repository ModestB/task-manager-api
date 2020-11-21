const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'mbujanauskas@gmail.com',
    subject: 'Thanks for joining!',
    text: `Welcome ${name}`
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'mbujanauskas@gmail.com',
    subject: 'Why cancel ?',
    text: `Why cancel ${name}`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}