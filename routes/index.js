const express       = require('express');
const models        = require('../models/index');
const passport      = require('passport');
const bcrypt        = require("bcrypt");
const jwt           = require('jsonwebtoken');
const BasicStrategy = require('passport-http').BasicStrategy;
const fetch         = require('node-fetch');
const router        = express.Router();

// Passport Basic Authentication Strategy
passport.use(new BasicStrategy(
  function(username, password, done) {
    const userPassword = users[username];
    if (!userPassword) { return done(null, false); }
    if (userPassword !== password) { return done(null, false); }
    return done(null, username);
  }
));

// Allows CORS
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Use this route for Api documentation
router.get("/", function(req, res) {
  console.log('<----get @ /---->');
  console.log('req---> ', req);
  res.status(200).send({status: "200", message: 'Everything is fine, we\'re fine', requestBody: req.body});
});

////// User Routes //////

// Login route returns User data w/Preferences
router.post('/login', function(req, res) {
  if ((!req.body.email) || (!req.body.password)) {
    res.status(403).send({error: 'Fields must not be empty.'})
  } else {
    models.User.findOne({
      where: {
        email: req.body.email
      },
      include: [{
        model: models.Preference,
        as: 'Preferences',
      }]
    }).then(function(user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
        res.status(200).send({user: user, auth_token: token});
      } else {
        res.status(403).send({error: "Username or password does not match."})
      }
    }).catch(function(err) {
      res.status(404).send({error: err});
    })
  }
});

// Signup route
router.post('/signup', function(req, res) {
  const { name, email, password, confirmPassword, street, city, state, zipcode, phone, backgroundImage, mainImage, roundImage, whiteText } = req.body;

  if (!name || !password) {
    res.status(403).send({error: 'User name and password must not be blank.'})
  }

  let salt = bcrypt.genSaltSync(10)
  let passwordHash = bcrypt.hashSync(password, salt)

  let newUser = {
    name: name,
    email: email,
    salt: salt,
    password: passwordHash,
    street: street,
    city: city,
    state: state,
    zipcode: zipcode,
    phone: phone,
    backgroundImage: backgroundImage,
    mainImage: mainImage
  }

  if (password === confirmPassword) {
      models.User.create(newUser)
      .then(function(data) {
          models.Preference.create({userID: data.id, roundImage: roundImage, whiteText: whiteText})
          .then(function(preferences) {
              res.status('201').send({User: data, Preferences: preferences});
          })
      })
      .catch(function(error) {
        res.status('400').send({error: error});
      });
  } else {
      res.status('403').send({error: "Passwords do not match.", body: req.body})
  }
});

// Get all users w/Preferences
router.get('/user', function(req, res) {
  models.User.findAll({
    include: [{
      model: models.Preference,
      as: 'Preferences'
    }]
  })
  .then(function(data) {
    res.status(200).json(data);
  })
  .catch(function(error) {
    res.status(500).json(error);
  })
});

// Delete a user from the db
// NOTE In the future we must delete associated data first
router.delete('/user/:name', function(req, res) {
  models.User.destroy({
    where: {username: req.params.username}
  })
  .then(function(data) {
    res.status(200).send(req.params.username + " deleted.");
  })
  .catch(function(error) {
    res.status(500).send(error);
  });
});

////// Cause Routes //////

// Create a cause
router.post('/causes/new', function(req, res) {
  const { roundImage, whiteText } = req.body;
  const newCause = Object.assign({}, req.body, { roundImage: undefined, whiteText: undefined });

  models.Cause.create(newCause)
  .then(data => {
      models.Preference.create({causeID: data.id, roundImage: roundImage, whiteText: whiteText})
      .then(preferences => {
          res.status('201').send({Cause: data, Preferences: preferences});
      })
  })
});

// Getting the entire cause list with Preferences, Donations and Comments
router.get('/causes', function(req, res) {
  models.Cause.findAll({
    include: [{
      model: models.Preference,
      as: 'Preferences'
    },{
      model: models.Donation,
      as: 'Donations',
      include: [{
        model: models.Comment,
        as: 'Comments'
      }]
    }]
  })
  .then(function(data) {
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).send("No causes found")
    }
  })
  .catch(function(err) {
    res.status(500).json(err);
  })
});

////// Organizations Routes //////

// Create an organization
// NOTE Possibly do the verification on the front end, and only create the org if verified??
router.post('/organizations/new', (req, res) => {
  const { roundImage, whiteText, taxID, director } = req.body;
  const newOrg = Object.assign({}, req.body, { roundImage: undefined, whiteText: undefined, director: undefined });
  const searchURL = `https://projects.propublica.org/nonprofits/api/v2/organizations/${taxID}.json`;

  fetch(searchURL)
  .then(response => response.json())
  .then(data => {
    if (data.organization.careofname.includes(director.toUpperCase())) {
      models.Organization.create(newOrg)
      .then(data => {
          models.Preference.create({orgID: data.id, roundImage: roundImage, whiteText: whiteText})
          .then(preferences => {
              res.status('201').send({Organization: data, Preferences: preferences});
          })
      })
    } else {
      res.status(404).send({Error: "Organization cannot be verified."})
    }
  })
  .catch(err => console.log({Error: err, Message: "Not Found"}));
});

// Get all organizations
router.get('/organizations', (req,res) => {
  models.Organization.findAll({
    include: [{
      model: models.Preference,
      as: 'Preferences'
    }]
  })
  .then(function(data) {
    res.status(200).json(data);
  })
  .catch(function(error) {
    res.status(500).json(error);
  })
});

// Get organization by id
router.get('/organizations/:id', (req,res) => {
  models.Organization.findOne({
    where: { id: req.params.id }
  })
  .then(function(data) {
    res.status(200).send(data);
  })
  .catch(function(error) {
    res.status(500).send(error);
  });
})

////// Preferences Routes //////

////// Donations Routes //////

////// Comments Routes //////

module.exports = router;
