const express       = require('express');
const path          = require('path');
const morgan        = require('morgan');
const routes        = require('./routes/index');
const passport      = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const bodyParser    = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(morgan('dev'));


app.use('/api', routes);

app.use(routes);

app.listen(3000, function() {
  console.log("App is running on localhost:3000");
});
