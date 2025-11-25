const express = require('express');
const cors = require('cors');
const setupRoutes = require('./routes/setup');
const setupV2Routes = require('./routes/setup-v2');
require('dotenv').config();

const app = express();

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
//

app.use(cors({
    origin: ['https://subtle-swan-ff6440.netlify.app', 'http://localhost:3000'],
    credentials: true
}));

app.get('/', (req, res) => {
  res.json({
    message: 'RCVJ COMPANY Backend API is Working!',
    status: 'Live 🚀',
    database: 'Connected ✅'
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/setup', setupV2Routes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/setup', setupRoutes);


// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Test routes


app.get('/api/test', (req, res) => {
    res.json({ message: 'RCVJ COMPANY API is working!' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error middleware
app.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    console.log('404 - Route not found:', req.originalUrl);
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Auth test: http://localhost:${PORT}/api/auth/test`);
    console.log(`📝 API test: http://localhost:${PORT}/api/test`);
});
