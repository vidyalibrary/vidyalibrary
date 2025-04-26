const cron = require('node-cron');
const Brevo = require('@getbrevo/brevo');

const setupCronJobs = (pool) => {
  const sendExpiryReminders = async () => {
    try {
      console.log('Running sendExpiryReminders...');

      // 1) Load email template ID and days-before-expiry from settings table
      const tplRes = await pool.query(
        `SELECT key, value FROM settings WHERE key IN ('email_template_id','days_before_expiry')`
      );
      const settings = {};
      tplRes.rows.forEach(row => { settings[row.key] = row.value; });
      const templateId = parseInt(settings.email_template_id, 10) || 1;
      const daysBefore = parseInt(settings.days_before_expiry, 10) || 7;

      // 2) Compute the target expiry date
      const now = new Date();
      const target = new Date(now);
      target.setDate(now.getDate() + daysBefore);
      const targetDateStr = target.toISOString().split('T')[0];
      console.log(`Target expiry date: ${targetDateStr}`);

      // 3) Query students whose membership_end is on or before target date
      const students = await pool.query(
        'SELECT id, name, email, membership_end FROM students WHERE membership_end <= $1',
        [targetDateStr]
      );
      console.log(`Found ${students.rows.length} students to notify`);
      if (students.rows.length === 0) return;

      // 4) Verify API key
      if (!process.env.BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY is not set in environment variables');
      }

      // 5) Instantiate Brevo API and set the key
      const apiInstance = new Brevo.TransactionalEmailsApi();
      apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

      // 6) Send transactional email to each student
      for (const student of students.rows) {
        console.log(`Sending email to ${student.email}`);
        const mail = new Brevo.SendSmtpEmail();
        mail.templateId = templateId;
        mail.sender = { email: 'vidyalibrary33@gmail.com', name: 'Library Admin' };
        mail.to = [{ email: student.email, name: student.name }];
        mail.params = {
          NAME: student.name,
          EXPIRY_DATE: new Date(student.membership_end).toISOString().split('T')[0]
        };
        try {
          await apiInstance.sendTransacEmail(mail);
          console.log(`✔ Email sent to ${student.email}`);
        } catch (err) {
          console.error(`✘ Failed for ${student.email}:`, err.response?.text || err.message);
        }
      }
    } catch (err) {
      console.error('sendExpiryReminders error:', err.stack || err);
    }
  };

  // Run immediately on startup
  sendExpiryReminders().catch(console.error);

  // Schedule to run daily at midnight server time
  cron.schedule('*/1 12 * * *', () => {
    console.log('Cron job triggered at midnight');
    sendExpiryReminders().catch(err => console.error('Cron error:', err.stack || err));
  });

  return { sendExpiryReminders };
};

module.exports = setupCronJobs;
