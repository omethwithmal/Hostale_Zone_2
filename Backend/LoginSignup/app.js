const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes');

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true
}));

app.use(cookieParser());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json({ limit: '10mb' })); // Increased limit for profile photos

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', userRoutes);

// Basic test route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;