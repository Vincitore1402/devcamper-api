/* eslint-disable no-unused-vars */
const nodemailer = require('nodemailer');

const sendEmail = async (params = {}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: params.email,
    subject: params.subject,
    text: params.message
  };

  return transporter.sendMail(message);
};

const sendEmailMock = async (params = {}) => Promise.resolve(params);

module.exports = {
  sendEmail: sendEmailMock
};
