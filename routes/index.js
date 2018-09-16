require('dotenv').config();
const express       = require('express');
const models        = require('../models/index');
const bcrypt        = require("bcrypt");
const passport      = require('passport');
const fetch         = require('node-fetch');
const jwt           = require('jsonwebtoken');
const BasicStrategy = require('passport-http').BasicStrategy;
const Utils         = require('../utilities/utilities');
const AWS           = require('aws-sdk');
const fs            = require('fs');
const fileType      = require('file-type');
const bluebird      = require('bluebird');
const multiparty    = require('multiparty');
const router        = express.Router();

// configure the keys for accessing AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// configure AWS to work with promises
AWS.config.setPromisesDependency(bluebird);

// create S3 instance
const s3 = new AWS.S3({ region: 'us-east-1' });

const { getBucketName, createNewObject, hashPassword, getExclusions } = Utils;

// abstracts function to upload a file returning a promise
const uploadFile = (buffer, name, type, bucketName) => {
  const params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: getBucketName(bucketName),
    ContentType: type.mime,
    Key: `${name}.${type.ext}`
  };
  console.log("params: ", params);
  return s3.upload(params).promise();
};

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

//-----------------------
//  Documentation Route
//-----------------------

// Use this route for Api documentation
router.get("/", (req,res) => {
  res.status(200).send({status: "200", message: 'Everything is fine, we\'re fine', requestBody: req.body});
});

//-----------------------
//      User Routes
//-----------------------

// Signup a user
router.post('/signup', (req,res) => {

  const { name, email, password, confirmPassword, street, city, state, zipcode, phone, backgroundImage, mainImage, roundImage, whiteText } = req.body;

  if (!name || !password) {
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

  if (password === confirmPassword) {
      models.User.create(newUser)
      .then(data => {
          models.Preference.create({userID: data.id, roundImage: roundImage, whiteText: whiteText})
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

});

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

// Get all users w/Preferences
router.get('/user', (req,res) => {
  // TODO research why the include statement doesnt actually include the preferences only in this route
  models.User.findAll({
    include: [{
      model: models.Preference,
      as: 'Preferences'
    }]
  })
  .then(user => {
    res.status('200').json(user);
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

    // Updated objects minus the excluded properties.
    let updatedUser = createNewObject(req.body, getExclusions('preferences'));
    let updatedPrefs = createNewObject(req.body, getExclusions('user'));

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
            res.status('201').send(updatedUser);
          })
          .catch(err => {
            res.status('500').send(err);
          })
    })
    .catch(err => {
        res.status('500').send(err);
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
  .then(data => {
    res.status(200).send(req.params.username + " deleted.");
  })
  .catch(error => {
    res.status(500).send(error);
  });
});

//-----------------------
// Organizations Routes
//-----------------------

// WIP Create an organization
router.post('/organizations/new', (req,res) => {
  // NOTE Possibly do the verification on the front end, and only create the organization if verified??
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
              org['Preferences'] = preferences;
              res.status('201').send({Organization: org});
          })
      })

    } else {
      res.status(403).send({error: "Organization cannot be verified."})
    }
  })
  .catch(err => res.status(404).send({error: err, Message: "Not Found"}));
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
      res.status('200').send( { Organization: org } );
    })
    .catch(err => {
      res.status('500').send(err);
    })
})


//-----------------------
//     Cause Routes
//-----------------------

// Create a cause
router.post('/causes/new', (req,res) => {
  const form = new multiparty.Form();
  const { roundImage, whiteText } = req.body;
  // TODO Use the rest parameter (...rest) above to eliminate having to use the below statment???
  const newCause = Object.assign({}, req.body, { roundImage: undefined, whiteText: undefined });

  // models.Cause.create(newCause)
  // .then(cause => {
  //
  //     models.Preference.create({causeID: cause.id, roundImage: roundImage, whiteText: whiteText})
  //     .then(preferences => {
  //         cause['Preferences'] = preferences;
  //         res.status('201').send({Cause: cause});
  //     })
  //     .catch(err => {
  //       res.status('500').json(err);
  //     });
  //
  // })
  // .catch(err => {
  //   res.status('500').json(err);
  // });

  form.parse(req, async (error, fields, files) => {
    console.log("Fields: ", fields);
    const state = JSON.parse(fields.state);
    console.log("State: ", state);
    if (error) throw new Error(error);
    try {
      const path = files.profileImage[0].path;
      const bucketName =  fields.bucket[0];
      const buffer = fs.readFileSync(path);
      const type = fileType(buffer);
      const timestamp = Date.now().toString();
      const fileName = `${timestamp}-lg`;
      // const data = await uploadFile(buffer, fileName, type, bucketName);
      // console.log("Response: ", data);
      // TODO Upon receiving data back from S3 (Hopefull a url??), save that url string to our database

      res.status(200).send({ files: files, bucket: fields.bucket, state: JSON.parse(fields.state) });
    } catch (error) {
      res.status(400).send(error);
    }
  });

});

// Getting the entire cause list with Preferences, Donations and Comments
router.get('/causes', (req,res) => {

  models.Cause.findAll({
    include: [{
      model: models.Preference,
      as: 'Preferences'
    },
    {
      model: models.Donation,
      as: 'Donations',
      include: [{
        model: models.Comment,
        as: 'Comments'
      }]
    }]
  })
  .then(cause => {
    if (cause) {
      res.status(200).json(cause);
    } else {
      res.status(404).send({error: "No causes found"});
    }
  })
  .catch(err => {
    res.status(500).json(err);
  });

  // NOTE do this in the .then of the method above for each cause.
  // NOTE we can use the sum method to add all of the donations into a total. We can return this to the front end so it doesnt have to calculate it. It can just calculate once the result comes in...
  // Example below from 'http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-sum-sum-the-value-of-specific-attributes'

  // Let's assume 3 person objects with an attribute age.
  // The first one is 10 years old,
  // The second one is 5 years old,
  // The third one is 40 years old.
  // Select by the column name you want to total
  // Project.sum('age').then(sum => {
    // this will return 55
  // })

  // Project.sum('age', { where: { age: { [Op.gt]: 5 } } }).then(sum => {
    // will be 50
  // })

  // ORRRRRR use it as an attribute in the include statement....
  // attributes: [
  //    [sequelize.fn('SUM', sequelize.col('column')), 'sumOfColumn']
  // ]
});

// Get a cause by the id w/Preferences, Donations, and Comments
router.get('/causes/:id', (req,res) => {
  models.Cause.findOne({
    where: { id: req.params.id },
    include: [{
      model: models.Preference,
      as: 'Preferences'
    },
    {
      model: models.Donation,
      as: 'Donations',
      include: [{
        model: models.Comment,
        as: 'Comments'
      }]
    }]
  })
  .then(cause => {
    res.status(200).send(cause);
  })
  .catch(error => {
    res.status(500).send(error);
  });

  // NOTE we can use the sum method to add all of the donations into a total. We can return this to the front end so it doesnt have to calculate it. It can just calculate once the result comes in...
  // Example below from 'http://docs.sequelizejs.com/manual/tutorial/models-usage.html#-sum-sum-the-value-of-specific-attributes'

  // Let's assume 3 person objects with an attribute age.
  // The first one is 10 years old,
  // The second one is 5 years old,
  // The third one is 40 years old.
  // Select by the column name you want to total
  // Project.sum('age').then(sum => {
    // this will return 55
  // })

  // Project.sum('age', { where: { age: { [Op.gt]: 5 } } }).then(sum => {
    // will be 50
  // })

  // ORRRRRR use it as an attribute in the include statement....
  // attributes: [
  //    [sequelize.fn('SUM', sequelize.col('column')), 'sumOfColumn']
  // ]
});

// TODO Edit cause details
router.put('/edit/cause/:id', (req,res) => {

    // TODO first update the cause
    models.Cause.update()
    .then(cause => {

      // TODO then update preferences
      res.status('200').send(cause);
    })
    .catch(err => {
      res.status('500').send(err);
    });
});

//-----------------------
//    Donations Routes
//-----------------------

// NOTE WIP This route will also add comments (if applicable)
router.post('/causes/:causeID/donation/new', (req,res) => {
  const { userID, causeID, amount, public_comment, private_comment, imageURL } = req.body
  // NOTE userID and amount will be used in both donation and comment functions
  // NOTE In the callback of the donation function, use the returned id as the donationID for the comment function.
});

//-----------------------
//    Comments Routes
//-----------------------

// TODO Create new comment
router.post('/causes/:causeID/donation/:donationID', (req,res) => {
  // Logic for creating a comment on a donation
});

// TODO Edit a comment
router.put('/edit/comment/:id', (req,res) => {
  // Logic for editing a comment that's already been sent.
});

//-----------------------
//  Preferences Routes
//-----------------------

// NOTE WIP Update Preferences Route
// TODO Will we need this route if it's built in the others??
router.put('/edit/preferences/:id', (req,res) => {
    // TODO write update functions here. Remember we have many different data types that have preferences options, including Users, Causes, and Organizations.
    models.Preference.update({
        roundImage: req.body.roundImage,
        whiteText:  req.body.whiteText
      },{
        where: { id: req.params.id }
      })
    .then(preferences => {
      res.send(200).json(preferences);
    })
    .catch(err => {
      res.send(400).json(err);
    });

});


module.exports = router;
