const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');

const app = express();

// Allow public files (e.g., frontend HTML/JS)
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// Use the router for API routes
app.use('/', indexRouter);

// 404 handler s
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server (Railway picks up PORT from env)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
