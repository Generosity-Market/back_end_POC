const express       = require('express');
const models        = require('../models/index');
const passport      = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const router        = express.Router();

const users = {'clinton':'test'};

passport.use(new BasicStrategy(
  function(username, password, done) {
    const userPassword = users[username];
    if (!userPassword) { return done(null, false); }
    if (userPassword !== password) { return done(null, false); }
    return done(null, username);
  }
));

router.get('/', passport.authenticate('basic', {session: false}), function(req, res) {
  res.status(200).send('This is where I will have my API documentation');
});



module.exports = router;
