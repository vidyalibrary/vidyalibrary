const brevo = require('@getbrevo/brevo');

const sendEmail = async (to, templateId, params) => {
  // Create a new ApiClient instance instead of using .instance
  let defaultClient = new brevo.ApiClient();
  defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not set in environment variables');
  }

  let apiInstance = new brevo.TransactionalEmailsApi();
  let sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.templateId = parseInt(templateId); // Ensure templateId is an integer
  sendSmtpEmail.params = params;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.text : error.message);
    throw error;
  }
};

module.exports = { sendEmail };