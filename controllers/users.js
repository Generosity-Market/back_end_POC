const sequelize = require('sequelize');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;

const {
  User,
  Preference,
  Cause,
  Donation,
  Comment,
} = require('../models/index');

const {
  createNewObject,
  hashPassword,
  getExclusions,
} = require('../utilities/utilities');

//-----------------------
//      User Routes
//-----------------------

// Passport Basic Authentication Strategy
passport.use(new BasicStrategy(
  function (username, password, done) {
    const userPassword = users[username];
    if (!userPassword) { return done(null, false); }
    if (userPassword !== password) { return done(null, false); }
    return done(null, username);
  }
));


// Signup a user
exports.registerUser = (req, res) => {
  const { email, name = "", street = "", city = "", state = "", zipcode = "", password, confirmPassword = password, roundImage = true, whiteText = false, phone = "", ...rest } = req.body;

  if (!email || !password) {
    res.status(403).send({ error: 'email and password must not be blank.' })
  }

  let salt = bcrypt.genSaltSync(10);
  // let passwordHash = bcrypt.hashSync(password, salt);

  // TODO can this be done with the spread operator instead????
  let newUser = {
    ...rest,
    salt,
    phone,
    name,
    street,
    city,
    state,
    zipcode,
    email,
    password: hashPassword(password),
  }
  console.log('User: ', newUser);

  if (password === confirmPassword) {
    User.create(newUser)
      .then(user => {
        Preference.create({ userID: user.id, roundImage, whiteText })
          .then(preferences => {
            user['Preferences'] = preferences;
            res.status('201').send(user);
          })
      })
      .catch(error => {
        res.status('400').send(error);
      });
  } else {
    res.status('403').send({ error: "Passwords do not match.", body: req.body })
  }

};

// Login route returns User data w/Preferences
exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  console.log("Req: ", req);

  if ((!email) || (!password)) {
    res.status(403).send({ error: 'Fields must not be empty.' })
  } else {
    User.findOne({
      where: {
        email: email
      },
      include: [{
        model: Preference,
        as: 'Preferences'
      }]
    }).then(user => {
      if (bcrypt.compareSync(password, user.password)) {
        var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
        res.status(200).send({ user: user, auth_token: token });
      } else {
        res.status(403).send({ error: "Username or password does not match." })
      }
    }).catch(err => {
      res.status(404).send({ error: err });
    })
  };

};

// Get all users w/Preferences
exports.getAllUsers = (req, res) => {
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
exports.getUserById = (req, res) => {

  User.findOne({
    where: {
      id: req.params.id
    },
    include: [{
      model: Preference,
      as: 'Preferences'
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
exports.editUser = (req, res) => {

  let updatedUser = {
    ...req.body.address,
    phone: req.body.phone,
    name: req.body.name,
  };

  // // Changing the password to the hashed password
  // updatedUser.password = hashPassword(req.body.password);

  User.update(updatedUser, {
    where: {
      id: req.params.id
    },
    returning: true,
  })
    .then(user => {
      console.log("User: ", user[1]);
      res.status('201').send(user[1][0].dataValues); // Is good until we start updating preferences for the user

      //   Preference.update(updatedPrefs, {
      //     where: {
      //       userID: req.params.id
      //     }
      //   })
      //     .then(prefs => {
      //       // Adding the id and Preferences to the user data returned to the front end
      //       updatedUser['Preferences'] = [updatedPrefs];
      //       updatedUser.id = Number(req.params.id);
      //       res.status('201').send(updatedUser);
      //     })
      //     .catch(err => {
      //       res.status('500').send(err);
      //     })
      // })
    })
    .catch(err => {
      res.status('500').send(err);
    });

};

exports.getUserCauses = (req, res) => {
  // Get causes by the users id
  Cause.findAll({
    where: {
      userID: req.params.id
    },
    attributes: Object.keys(Cause.attributes).concat([
      [sequelize.literal('(SELECT SUM("Donations"."amount") FROM "Donations" WHERE "Donations"."causeID" = "Cause"."id")'),
        'totalRaised']
    ]),
    include: [{
      model: Preference,
      as: 'Preferences'
    }, {
      model: Donation,
      as: 'Donations',
      include: [{
        model: Comment,
        as: 'Comments'
      }]
    }],
  })
    .then(causes => {
      if (causes) {
        res.status(200).json(causes);
      } else {
        res.status(404).send({ error: "No causes found" });
      }
    })
    .catch(err => {
      console.log("Error: ", err)
      res.status(500).json(err);
    });
}

exports.getSupportedCauses = (req, res) => {
  // Get Causes that have Donations made by the user (Search by userID)
  Cause.findAll({
    // attributes: ['name', 'mainImage', 'id'],
    include: [{
      where: {
        userID: req.params.id,
      },
      model: Donation,
      as: 'Donations',
      attributes: ['amount', 'updatedAt', 'userID'],
    }]
  })
    .then(donations => {
      if (donations) {
        res.status(200).json(donations);
      } else {
        res.status(404).send({ error: "No Donations found" });
      }
    })
    .catch(err => {
      console.log("Error: ", err)
      res.status(500).json(err);
    });
}

// Delete a user from the db
// NOTE In the future we must delete associated data first
exports.deleteUser = (req, res) => {
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
