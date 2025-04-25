module.exports = (pool) => {
    const router = require('express').Router();
  
    router.get('/email', async (req, res) => {
      try {
        const templateIdResult = await pool.query('SELECT value FROM settings WHERE key = $1', ['email_template_id']);
        const daysBeforeResult = await pool.query('SELECT value FROM settings WHERE key = $1', ['days_before_expiry']);
  
        const templateId = templateIdResult.rows.length ? templateIdResult.rows[0].value : null;
        const daysBefore = daysBeforeResult.rows.length ? daysBeforeResult.rows[0].value : null;
  
        res.json({ templateId, daysBefore });
      } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
    });
  
    router.put('/email', async (req, res) => {
      try {
        const { templateId, daysBefore } = req.body;
  
        await pool.query(
          'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
          ['email_template_id', templateId]
        );
  
        await pool.query(
          'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
          ['days_before_expiry', daysBefore]
        );
  
        res.json({ message: 'Email settings updated successfully' });
      } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
    });
  
    return router;
  };