const bcrypt = require("bcrypt");
const jwt    = require('jsonwebtoken');
const models = require('../models/index');
const Utils  = require('../utilities/utilities');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const { createNewObject, hashPassword, getExclusions } = Utils;
const { User, Preference, Cause, Donation, Comment } = models;

//-----------------------
//      User Routes
//-----------------------

// Passport Basic Authentication Strategy
passport.use(new BasicStrategy(
  function(username, password, done) {
    const userPassword = users[username];
    if (!userPassword) { return done(null, false); }
    if (userPassword !== password) { return done(null, false); }
    return done(null, username);
  }
));


// Signup a user
exports.registerUser = (req,res) => {

  const { name, email, password, confirmPassword, street, city, state, zipcode, phone, backgroundImage, mainImage, roundImage, whiteText } = req.body;

  if (!rest.name || !password) {
    res.status(403).send({error: 'User name and password must not be blank.'})
  }

  // let salt = bcrypt.genSaltSync(10);
  // let passwordHash = bcrypt.hashSync(password, salt);


  let newUser = {
    name: name,
    email: email,
    salt: salt,
    password: hashPassword(req.body.password),
    street: street,
    city: city,
    state: state,
    zipcode: zipcode,
    phone: phone,
    backgroundImage: backgroundImage,
    mainImage: mainImage
  }

  if (password === rest.confirmPassword) {
      User.create(newUser)
      .then(user => {
          Preference.create({userID: user.id, roundImage: roundImage, whiteText: whiteText})
          .then(preferences => {
              user['Preferences'] = preferences;
              res.status('201').send(user);
          })
      })
      .catch(error => {
        res.status('400').send(error);
      });
  } else {
      res.status('403').send({error: "Passwords do not match.", body: req.body})
  }

};

// Login route returns User data w/Preferences
exports.loginUser = (req,res) => {

  if ((!req.body.email) || (!req.body.password)) {
    res.status(403).send({error: 'Fields must not be empty.'})
  } else {
    User.findOne({
        where: {
          email: req.body.email
        },
        include: [{
          model: Preference,
          as: 'Preferences',
        }]
    }).then(user => {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
          res.status(200).send({user: user, auth_token: token});
        } else {
          res.status(403).send({error: "Username or password does not match."})
        }
    }).catch(err => {
        res.status(404).send({error: err});
    })
  };

};

// Get all users w/Preferences
exports.getAllUsers = (req,res) => {
  // TODO research why the include statement doesnt actually include the preferences only in this route
  User.findAll({
    include: [{
      model: Preference,
      as: 'Preferences'
    }]
  })
  .then(user => {
    res.status('200').json(user);
  })
  .catch(error => {
    res.status('500').json(error);
  })

};

// Get a user by id w/Preferences & Causes
exports.getUserById = (req,res) => {

  User.findOne({
    where: { id: req.params.id },
    include: [{
      model: Preference,
      as: 'Preferences'
    },{
      model: Cause,
      as: 'Causes',
      include: [{
        model: Preference,
        as: 'Preferences'
      },{
        model: Donation,
        as: 'Donations'
      }]
    }]
  })
  .then(user => {
    res.status(200).send(user);
  })
  .catch(error => {
    res.status(500).send(error);
  });

};

// Edit users details
exports.editUser = (req,res) => {

    // Updated objects minus the excluded properties.
    let updatedUser = createNewObject(req.body, getExclusions('preferences'));
    let updatedPrefs = createNewObject(req.body, getExclusions('user'));

    // Changing the password to the hashed password
    updatedUser.password = hashPassword(req.body.password);

    User.update(updatedUser, {
      where: {
        id: req.params.id
      }
    })
    .then(user => {
          Preference.update(updatedPrefs, {
            where: {
              userID: req.params.id
            }
          })
          .then(prefs => {
            // Adding the id and Preferences to the user data returned to the front end
            updatedUser['Preferences'] = [updatedPrefs];
            updatedUser.id = Number(req.params.id);
            res.status('201').send(updatedUser);
          })
          .catch(err => {
            res.status('500').send(err);
          })
    })
    .catch(err => {
        res.status('500').send(err);
    });

};

// Delete a user from the db
// NOTE In the future we must delete associated data first
exports.deleteUser = (req,res) => {
  User.destroy({
    where: {
      username: req.params.username
    }
  })
  .then(data => {
    res.status(200).send(req.params.username + " deleted.");
  })
  .catch(error => {
    res.status(500).send(error);
  });
};
