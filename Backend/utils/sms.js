const axios = require('axios');
require('dotenv').config();

const FAST2SMS_API = 'https://www.fast2sms.com/dev/bulkV2';
const API_KEY = process.env.FAST2SMS_API_KEY; // set in .env

async function sendSMS(phone, message) {
  try {
    const response = await axios.post(FAST2SMS_API, {
      route: 'v3',
      sender_id: 'FSTSMS', // default sender
      message: message,
      language: 'english',
      flash: 0,
      numbers: phone
    }, {
      headers: {
        'authorization': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📩 SMS sent to ${phone}:`, response.data);
    return response.data;
  } catch (err) {
    console.error(`✘ SMS failed for ${phone}:`, err.response?.data || err.message);
    throw err;
  }
}

module.exports = { sendSMS };