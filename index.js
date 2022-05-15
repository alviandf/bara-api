const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

app.set('view engine', 'ejs');
app.use(express.static("views"));

const globalErrHandler = require('./util/errorController');
const AppError = require('./util/appError');

// Import route
const authRoute = require('./routes/auth');
const pagesAuthRoute = require('./routes/pagesAuth');
const postRoute = require('./routes/posts');
const levelRoute = require('./routes/level');
const episodeRoute = require('./routes/episode');
const leaderboardRoute = require('./routes/leaderboard');

// Connect to MongoDB
mongoose.connect(
  process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  () => console.log('Connected to MongoDB')
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

// Route Middleware
app.use('/api/user', authRoute);
app.use('/user', pagesAuthRoute);
app.use('/api/posts', postRoute);
app.use('/api/level', levelRoute);
app.use('/api/episode', episodeRoute);
app.use('/api/leaderboard', leaderboardRoute);

app.use(globalErrHandler);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});