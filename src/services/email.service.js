/* eslint-disable no-console */
const { SendMailClient } = require('zeptomail');
const config = require('../config/config');
const logger = require('../config/logger');

let client;

/* istanbul ignore next */
if (config.env !== 'test' && config.email.zeptomail.token) {
  try {
    const url = 'api.zeptomail.com/';
    client = new SendMailClient({ url, token: config.email.zeptomail.token });
    logger.info('ZeptoMail client initialized');
  } catch (error) {
    logger.warn('Unable to initialize ZeptoMail client. Make sure you have configured ZEPTOMAIL_TOKEN in .env', error);
  }
} else if (config.env !== 'test') {
  logger.warn('ZeptoMail token not configured. Email functionality will not work.');
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html - Optional HTML content
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    if (!client) {
      logger.error('ZeptoMail client not initialized');
      return;
    }

    const mailOptions = {
      from: {
        address: config.email.zeptomail.fromEmail,
        name: config.email.zeptomail.fromName || 'CarryGo',
      },
      to: [
        {
          email_address: {
            address: to,
          },
        },
      ],
      subject,
      textbody: text,
    };

    if (html) {
      mailOptions.htmlbody = html;
    }

    await client.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error('Error sending email:', error);
    console.log(error);
  }
};

const sendgridOtpEmail = async(to, code) => {
  try {
    const subject = 'Email Verification';
    const text = `Dear user,
Your Email authentication code is: ${code}`;
    const html = `<p>Dear user,<br>Your Email authentication code is: ${code}</p>`;
    await sendEmail(to, subject, text, html);
  } catch (error) {
    console.log(error);
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
  sendEmail,
  userVerified,
  sendOtpEmail,
  sendEmailToAdmin,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendgridOtpEmail
};
