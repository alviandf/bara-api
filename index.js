const express = require('express');
const app = express(); 
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const globalErrHandler = require('./util/errorController');
const AppError = require('./util/appError');

// Import route
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
const levelRoute = require('./routes/level');
const leaderboardRoute = require('./routes/leaderboard');

dotenv.config();

// Connect to MongoDB
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('Connected to MongoDB')
);

// Middleware
app.use(express.json());

// Route Middleware
app.use('/api/user', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/level', levelRoute);
app.use('/api/leaderboard', leaderboardRoute);

app.use(globalErrHandler);

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});