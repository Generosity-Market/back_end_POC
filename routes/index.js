const express       = require('express');
const models        = require('../models/index');
const bcrypt        = require("bcrypt");
const passport      = require('passport');
const fetch         = require('node-fetch');
const jwt           = require('jsonwebtoken');
const BasicStrategy = require('passport-http').BasicStrategy;
const Utils         = require('../utilities/utilities');
const router        = express.Router();

const { createNewObject, hashPassword, getExclusions } = Utils;

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
router.use((req,res,next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//---- Documentation Route ----//

// Use this route for Api documentation
router.get("/", (req,res) => {
  res.status(200).send({status: "200", message: 'Everything is fine, we\'re fine', requestBody: req.body});
});

//---- User Routes ----//

// Login route returns User data w/Preferences
router.post('/login', (req,res) => {

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

});

// Signup route
router.post('/signup', (req,res) => {

  const { name, email, password, confirmPassword, street, city, state, zipcode, phone, backgroundImage, mainImage, roundImage, whiteText } = req.body;

  if (!name || !password) {
    res.status(403).send({error: 'User name and password must not be blank.'})
  }

  let salt = bcrypt.genSaltSync(10);
  let passwordHash = bcrypt.hashSync(password, salt);

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
      .then(data => {
          models.Preference.create({userID: data.id, roundImage: roundImage, whiteText: whiteText})
          .then(preferences => {
              res.status('201').send({User: data, Preferences: preferences});
          })
      })
      .catch(error => {
        res.status('400').send({error: error});
      });
  } else {
      res.status('403').send({error: "Passwords do not match.", body: req.body})
  }

});

// Get all users w/Preferences
router.get('/user', (req,res) => {
  // TODO research why the include statement doesnt actually include the preferences only in this route
  models.User.findAll({
    include: [{
      model: models.Preference,
      as: 'Preferences'
    }]
  })
  .then(data => {
    res.status('200').json(data);
  })
  .catch(error => {
    res.status('500').json(error);
  })

});

// Get a user by id w/Preferences & Causes
router.get('/user/:id', (req,res) => {

  models.User.findOne({
    where: { id: req.params.id },
    include: [{
      model: models.Preference,
      as: 'Preferences'
    },{
      model: models.Cause,
      as: 'Causes',
      include: [{
        model: models.Preference,
        as: 'Preferences'
      },{
        model: models.Donation,
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

})

// Edit users details
router.put("/edit/user/:id", (req,res) => {
    // Getting the excluded properties. This will be passed as an argument in createNewObject();
    const excludePreferences = getExclusions('preferences');
    const excludeUser = getExclusions('user');

    // Updated objects minus the excluded properties.
    let updatedUser = createNewObject(req.body, excludePreferences);
    let updatedPrefs = createNewObject(req.body, excludeUser);

    // Changing the password to the hashed password
    updatedUser.password = hashPassword(req.body.password);

    models.User.update(updatedUser, {
      where: {
        id: req.params.id
      }
    })
    .then(user => {
          models.Preference.update(updatedPrefs, {
            where: {
              userID: req.params.id
            }
          })
          .then(prefs => {
            // Adding the id and Preferences to the user data returned to the front end
            updatedUser['Preferences'] = [updatedPrefs];
            updatedUser.id = Number(req.params.id);
            res.status('201').send({ User: updatedUser});
          })
          .catch(err => {
            res.status('500').send({ success: false, error: err });
          })
    })
    .catch(err => {
        res.status('500').send({ success: false, error: err });
    });

});

// Delete a user from the db
// NOTE In the future we must delete associated data first
router.delete('/user/:name', (req,res) => {
  models.User.destroy({
    where: {
      username: req.params.username
    }
  })
  .then(function(data) {
    res.status(200).send(req.params.username + " deleted.");
  })
  .catch(function(error) {
    res.status(500).send(error);
  });
});

//---- Organizations Routes ----//

// Create an organization
// NOTE Possibly do the verification on the front end, and only create the organization if verified??
router.post('/organizations/new', (req,res) => {
  const { roundImage, whiteText, taxID, director } = req.body;
  const newOrg = Object.assign({}, req.body, { roundImage: undefined, whiteText: undefined, director: undefined });
  const searchURL = `https://projects.propublica.org/nonprofits/api/v2/organizations/${taxID}.json`;

  fetch(searchURL)
  .then(response => response.json())
  .then(data => {

    if (data.organization.careofname.includes( director.toUpperCase() ) ) {

      models.Organization.create(newOrg)
      .then(org => {
          models.Preference.create({orgID: org.id, roundImage: roundImage, whiteText: whiteText})
          .then(preferences => {
              res.status('201').send({Organization: org, Preferences: preferences});
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
    },{
      model: models.Cause,
      as: 'Causes',
      include: [{
        model: models.Preference,
        as: 'Preferences'
      }]
    }]
  })
  .then(org => {
    res.status(200).json(org);
  })
  .catch(error => {
    res.status(500).json(error);
  })
});

// Get organization by id
router.get('/organizations/:id', (req,res) => {
  models.Organization.findOne({
    where: { id: req.params.id },
    include: [{
      model: models.Preference,
      as: 'Preferences'
    },{
      model: models.Cause,
      as: 'Causes',
      include: [{
        model: models.Preference,
        as: 'Preferences'
      }]
    }]
  })
  .then(org => {
    res.status(200).send(org);
  })
  .catch(error => {
    res.status(500).send(error);
  });
})

//TODO Edit organization details
router.put('/edit/organization/:id', (req,res) => {

    // TODO first update the organization
    models.Organization.update()
    .then(org => {

      //TODO then update Preferences
      res.status('200').send( { organization: org } );
    })
    .catch(err => {
      res.status('500').send( { success: false, error: err } );
    })
})


//----- Cause Routes -----//

// Create a cause
router.post('/causes/new', (req,res) => {

  const { roundImage, whiteText } = req.body;
  const newCause = Object.assign({}, req.body, { roundImage: undefined, whiteText: undefined });

  models.Cause.create(newCause)
  .then(cause => {

      models.Preference.create({causeID: cause.id, roundImage: roundImage, whiteText: whiteText})
      .then(preferences => {
          res.status('201').send({Cause: cause, Preferences: preferences});
      })
      .catch(err => {
        res.status('500').json(err);
      });

  })
  .catch(err => {
    res.status('500').json(err);
  });

});

// Getting the entire cause list with Preferences, Donations and Comments
router.get('/causes', (req,res) => {

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
  .then(data => {
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).send("No causes found")
    }
  })
  .catch(err => {
    res.status(500).json(err);
  });

});

// Get a cause by the id w/Preferences, Donations, and Comments
router.get('/causes/:id', (req,res) => {
  models.Cause.findOne({
    where: { id: req.params.id },
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
  .then(data => {
    res.status(200).send(data);
  })
  .catch(error => {
    res.status(500).send(error);
  });
})

// TODO Edit cause details
router.put('/edit/cause/:id', (req,res) => {

    // TODO first update the cause
    models.Cause.update()
    .then(cause => {

      // TODO then update preferences
      res.status('200').send( {cause: cause} );
    })
    .catch(err => {
      res.status('500').send( {success: false, error: err} );
    });
});

//---- Donations Routes ----//
// NOTE WIP This route will also add comments (if applicable)
router.post('/causes/:causeID/donation/new', (req,res) => {
  const { userID, causeID, amount, public_comment, private_comment, imageURL } = req.body
  // NOTE userID and amount will be used in both donation and comment functions
  // NOTE In the callback of the donation function, use the returned id as the donationID for the comment function.
});

//---- Comments Routes ----//

// TODO Create new comment route
router.post('/causes/:causeID/donation/:donationID', (req,res) => {
  // Logic for creating a comment on a donation
});

//---- Preferences Routes ----//

// NOTE WIP Update Preferences Route
router.post('/preferences/:id', (req,res) => {
  // TODO write update functions here. Remember we have many different data types that have preferences options, including Users, Causes, and Organizations.
  models.Preference.update({
      roundImage: req.body.roundImage,
      whiteText:  req.body.whiteText
    },{
      where: { id: req.params.id }
    })
  .then(data => {
    res.send(200).json(data);
  })
  .catch(err => {
    res.send(400).json(err);
  })
});


module.exports = router;
