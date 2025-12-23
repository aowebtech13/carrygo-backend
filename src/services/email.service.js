/* eslint-disable no-console */
const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');

const ZEPTOMAIL_API_KEY = 'wSsVR61180GlDK10lTKodbtqkF0BBFL2EBl52VCp6XCoS63GoMdtlEDOVwH1HfYZEzVoHGNDprl/mR0I1DAJitt4w1gFXSiF9mqRe1U4J3x17qnvhDzMWWhUlRGJKoMLxwtsmWRoEcEm+g==';
const ZEPTOMAIL_API_URL = 'https://api.zeptomail.com/v1.1/email';
const FROM_EMAIL = '"CarryGo" <tech@carrygo.org>';

/* istanbul ignore next */
if (config.env !== 'test') {
  logger.info('ZeptoMail API configured successfully');
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const payload = {
      from: {
        address: 'tech@carrygo.org',
        name: 'CarryGo'
      },
      to: [
        {
          email_address: {
            address: to
          }
        }
      ],
      subject: subject,
      textbody: text,
      htmlbody: html || text
    };

    const response = await axios.post(ZEPTOMAIL_API_URL, payload, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': ZEPTOMAIL_API_KEY
      }
    });

    logger.info('Email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    logger.error('Error sending email:', error.response?.data || error.message);
    console.log(error.response?.data || error.message);
    throw error;
  }
};

const sendgridOtpEmail = async(to, code) => {
  try {
    const text = `Dear user,
    Your Email authentication code is: ${code}`;
    const html = `
    <p>Dear user,
    Your Email authentication code is: ${code}</p>
    `;
    await sendEmail(to, 'Email Verification', text, html);
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
  sendEmail,
  userVerified,
  sendOtpEmail,
  sendEmailToAdmin,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendgridOtpEmail
};
