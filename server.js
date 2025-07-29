require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/user'));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
