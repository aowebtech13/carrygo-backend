/* eslint-disable no-console */
const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch((error) => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env',error));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  try {
    const msg = { from: config.email.from, to, subject, text };
    await transport.sendMail(msg);
  } catch (error) {
    console.log(error)
  }
};

const sendgridOtpEmail = async(to, code) => {
  try {
    const msg = {
      from: config.email.from,
      to: to,
      subject: 'Email Verification',
      text: `Dear user,
    Your Email authentication code is: ${code}`,
      html: `
    <p>Dear user,
    Your Email authentication code is: ${code}</p>
    `,
    };
    await transport.sendMail(msg);
  } catch (error) {
    console.error(error);
  }
}

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  try {
    const subject = 'Reset password';
    // replace this url with the link to the reset password page of your front-end app
    const resetPasswordUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;
    const text = `Dear user,
  To reset your password, click on this link: ${resetPasswordUrl}
  If you did not request any password resets, then ignore this email.`;
    await sendEmail(to, subject, text);
  } catch (error) {
    console.log(error)
  }
}

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendWelcomeEmail = async (to,message) => {
  try {
    const subject = 'CarryGo Welcome Email';
  
    await sendEmail(to, subject, message);
  } catch (error) {
    console.log(error)
  }
};

const sendOtpEmail = async (to, code) => {
  try {
    const subject = 'Email Verification';
    // replace this url with the link to the email verification page of your front-end app
    const text = `Dear user,
  Your Email authentication code is: ${code}`;
    await sendEmail(to, subject, text);
  } catch (error) {
    console.log(error)
  }
};

const userVerified = async (to, message, subject='Verification succesful') => {
  try {
    await sendEmail(to, subject, message);
  } catch (error) {
    console.log(error)
  }
};

const sendEmailToAdmin = async (to, name) => {
  try {
    const subject = 'CarryGo Admin Invitation';
    // const verificationEmailUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;
    const text = `Dear ${name},
    You have been invited as an admin to work with CarryGo
  If you did not create an account, then ignore this email.`;
    await sendEmail(to, subject, text);
  } catch (error) {
    console.log(error)
  }
};

module.exports = {
  transport,
  sendEmail,
  userVerified,
  sendOtpEmail,
  sendEmailToAdmin,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendgridOtpEmail
};
