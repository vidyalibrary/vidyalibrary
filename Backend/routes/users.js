module.exports = (pool, bcrypt) => {
  const router = require('express').Router();
  
  // Get current user profile
  router.get('/profile', async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const result = await pool.query(
        'SELECT id, username, full_name, email, role FROM users WHERE id = $1',
        [req.session.user.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ user: result.rows[0] });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
  // Update user profile
  router.put('/profile', async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { full_name, email, current_password, new_password } = req.body;
      
      // Check if email exists for another user
      if (email) {
        const emailCheck = await pool.query(
          'SELECT * FROM users WHERE email = $1 AND id != $2',
          [email, req.session.user.id]
        );
        
        if (emailCheck.rows.length > 0) {
          return res.status(400).json({ message: 'Email already in use by another user' });
        }
      }
      
      // If password change is requested
      if (current_password && new_password) {
        // Verify current password
        const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [req.session.user.id]);
        const isPasswordValid = await bcrypt.compare(current_password, userResult.rows[0].password);
        
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        // Update user with new password
        const result = await pool.query(
          `UPDATE users SET 
           full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           password = $3
           WHERE id = $4 RETURNING id, username, full_name, email, role`,
          [full_name, email, hashedPassword, req.session.user.id]
        );
        
        return res.json({ 
          message: 'Profile updated successfully', 
          user: result.rows[0] 
        });
      } else {
        // Update without changing password
        const result = await pool.query(
          `UPDATE users SET 
           full_name = COALESCE($1, full_name),
           email = COALESCE($2, email)
           WHERE id = $3 RETURNING id, username, full_name, email, role`,
          [full_name, email, req.session.user.id]
        );
        
        return res.json({ 
          message: 'Profile updated successfully', 
          user: result.rows[0] 
        });
      }
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
  return router;
};