const router = require('express').Router();

module.exports = (pool, bcrypt) => {
  // Login route
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      console.log('Session set:', req.session.user); // Debug
      return res.json({ message: 'Login successful', user: {
        id: user.id,
        username: user.username,
        role: user.role
      }});
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
  
  // Logout route
  router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Server error during logout' });
      }
      res.json({ message: 'Logout successful' });
    });
  });
  
  // Check auth status route
  router.get('/status', (req, res) => {
    if (req.session && req.session.user) {
      return res.json({ isAuthenticated: true, user: req.session.user });
    }
    return res.json({ isAuthenticated: false });
  });
  
  return router;
};