const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const tasksRouter = require('./routes/tasks');

const app = express();

// Middleware
app.use(express.json());
app.use(logger);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/tasks', tasksRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
