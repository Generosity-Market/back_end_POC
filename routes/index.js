require('dotenv').config();
const express       = require('express');
const models        = require('../models/index');
const passport      = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const Utils         = require('../utilities/utilities');

const router        = express.Router();

// NOTE Importing Controllers
const causeController = require('../controllers/causes');
const commentsController = require('../controllers/comments');
const donationController = require('../controllers/donations');
const orgController = require('../controllers/organizations');
const preferenceController = require('../controllers/preferences');
const userController = require('../controllers/users');

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


// ***** Documentation Route *****

// Use this route for Api documentation
router.get("/", (req,res) => {
  res.status(200).send({status: "200", message: 'Everything is fine, we\'re fine', requestBody: req.body});
});

// ***** User Routes *****

// Signup a user
router.post('/signup', userController.registerUser);

// Login route returns User data w/Preferences
router.post('/login', userController.loginUser);

// Get all users w/Preferences
router.get('/user', userController.getAllUsers);

// Get a user by id w/Preferences & Causes
router.get('/user/:id', userController.getUserById);

// Edit users details
router.put("/edit/user/:id", userController.editUser);

// Delete a user from the db
// NOTE In the future we must delete associated data first
router.delete('/user/:name', userController.deleteUser);

// ***** Organizations Routes *****

// WIP Create an organization
router.post('/organizations/new', orgController.createOrg);

// Get all organizations
router.get('/organizations', orgController.getAllOrgs);

// Get organization by id
router.get('/organizations/:id', orgController.getOrgById);

//TODO Edit organization details
router.put('/edit/organization/:id', orgController.editOrg);

// ***** Cause Routes *****

// Create a cause
router.post('/causes/new', causeController.createCause);

// Getting the entire cause list with Preferences, Donations and Comments
router.get('/causes', causeController.getCauses);

// Get a cause by the id w/Preferences, Donations, and Comments
router.get('/causes/:id', causeController.getCauseById);

// TODO Edit cause details
router.put('/causes/:id', causeController.editCauseById);

// ***** Donations Routes *****

// NOTE WIP This route will also add comments (if applicable)
router.post('/causes/:causeID/donation/new', donationController.createDonation);

// ***** Comments Routes *****

// TODO Create new comment
router.post('/causes/:causeID/donation/:donationID', commentsController.createComment);

// TODO Edit a comment
router.put('/edit/comment/:id', commentsController.editComment);

// ***** Preferences Routes *****

// NOTE WIP Update Preferences Route
router.put('/edit/preferences/:id', preferenceController.updatePreferences);


module.exports = router;
