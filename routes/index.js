const express       = require('express');
const models        = require('../models/index');
const passport      = require('passport');
const bcrypt        = require("bcrypt");
const jwt           = require('jsonwebtoken');
const BasicStrategy = require('passport-http').BasicStrategy;
const router        = express.Router();


passport.use(new BasicStrategy(
  function(username, password, done) {
    const userPassword = users[username];
    if (!userPassword) { return done(null, false); }
    if (userPassword !== password) { return done(null, false); }
    return done(null, username);
  }
));

// NOTE Allows CORS
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

// login route
router.post('/login', function(req, res) {
  if ((!req.body.email) || (!req.body.password)) {
    res.status(403).send({error: 'Fields must not be empty.'})
  } else {
    models.User.findOne({
      where: {
        email: req.body.email
      }
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

// signup route
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

  console.log(newUser);

// if preferences do something with the preferences

  if (password === confirmPassword) {
    models.User.create(newUser)
    .then(function(data) {

      models.Preference.create({userID: data.id, roundImage: roundImage, whiteText: whiteText})
      .then(function(preferences) {
        res.status('201').send({User: data, preferences: preferences});
      })
      
    })
    .catch(function(error) {
      res.status('400').send({error: error});
    });
  } else {
    res.status('403').send({error: "Passwords do not match.", body: req.body})
  }
});

// get all users
router.get('/user', function(req, res) {
  models.User.findAll({})
  .then(function(data) {
    res.status(200).json(data);
  })
  .catch(function(error) {
    res.status(500).json(error);
  })
})

// delete a user from the db
//in the future we must delete associated data first
router.delete('/user/:username', function(req, res) {
  models.User.destroy({
    where: {username: req.params.username}
  })
  .then(function(data) {
    res.status(200).send(req.params.username + " deleted.");
  })
  .catch(function(error) {
    res.status(500).send(error);
  });
})

// getting the entire cause list with * and *
// TODO change the models once we decide what they are
router.get('/causes', function(req, res) {
  models.Cause.findAll({
    include: [{
       model: models.Alternate,
       as: 'Variable',
       include: [{
         model: models.Like, as: "Likes"
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

module.exports = router;
