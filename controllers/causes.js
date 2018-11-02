const fs = require('fs');
const fileType = require('file-type');
const sequelize = require('sequelize');
const { User, Preference, Cause, Donation, Comment } = require('../models/index');
const multiparty = require('multiparty');
const awsUtils = require('../utilities/awsUploads');

// Create a cause
exports.createCause = (req,res) => {
  const form = new multiparty.Form();
  // NOTE parsing the form data
  // TODO extract this to utils??
  form.parse(req, async (error, fields, files) => {
    if (error) throw new Error(error);
    try {
      const bucketName = fields.bucket[0];
      const profile_params = awsUtils.getUploadParameters(files.profileImage[0], 'profileImages');
      const cover_params = awsUtils.getUploadParameters(files.coverImage[0], 'coverImages');

      // NOTE the return in this function does the uploading of the file to AWS S3 bucketName
      // TODO In the return of the async funtion put the returned url from S3 into our database.
      const profile_response = await awsUtils.uploadFile(profile_params, bucketName);
        console.log("Profile: ", profile_response);

      const cover_response = await awsUtils.uploadFile(cover_params, bucketName);
        console.log("Cover: ", cover_response);
      //////////////////////////////////////

      const state = JSON.parse(fields.state);
      console.log("State: ", state);

      const { roundImage, whiteText } = state;

      // TODO userId needs to come from the front end as part of the state...
      const stateChanges = {
          userID: 1,
          amount: Number(state.goal),
          taxId: state.taxId || undefined,
          backgroundImage: cover_response.Location,
          mainImage: profile_response.Location,
          featured: false,
          roundImage: undefined,
          whiteText: undefined,
          cover_image: undefined,
          profile_image: undefined,
      }
      console.log("Changes: ", stateChanges);


      const newCause = Object.assign({}, state, stateChanges);
      console.log("New Cause: ", newCause);
      const newPreferences = { roundImage, whiteText };

      Cause.create(newCause)
      .then(cause => {
        Preference.create({ causeID: cause.id, ...newPreferences })
          .then(preferences => {
            cause['Preferences'] = [{ roundImage: roundImage, whiteText: whiteText }];
              console.log("Preferences: ", preferences);
              console.log("Created Cause: ", cause);
              res.status('201').send({Cause: cause});
          })
          .catch(err => {
            res.status('500').json(err);
          });
      })
      .catch(err => {
        res.status('500').json(err);
      });

    } catch (error) {
      res.status(400).send(error);
    }
  });

};

// Getting the entire cause list w/ Preferences, Donations, totalRaised and Comments
// TODO create a way to change the sort on a property that's passed in the request
// TODO instead of creating multiple routes / controllers...
exports.getCauses = (req,res) => {
  Cause.findAll({
    attributes: Object.keys(Cause.attributes).concat([
      [sequelize.literal('(SELECT SUM("Donations"."amount") FROM "Donations" WHERE "Donations"."causeID" = "Cause"."id")'),
        'totalRaised']
    ]),
    include: [{
      model: Preference,
      as: 'Preferences'
    },
    {
      model: Donation,
      as: 'Donations',
      include: [{
        model: Comment,
        as: 'Comments'
      }]
    },
  ],
  })
  .then(causes => {
    if (causes) {
      res.status(200).json(causes);
    } else {
      res.status(404).send({error: "No causes found"});
    }
  })
  .catch(err => {
    console.log("Error: ", err)
    res.status(500).json(err);
  });

};

// Get a cause by the id w/Preferences, Donations, and Comments, and totalRaised
exports.getCauseById = (req,res) => {
  Cause.findOne({
    where: { id: req.params.id },
    attributes: Object.keys(Cause.attributes).concat([
      [sequelize.literal('(SELECT SUM("Donations"."amount") FROM "Donations" WHERE "Donations"."causeID" = "Cause"."id")'),
        'totalRaised']
    ]),
    include: [{
      model: Preference,
      as: 'Preferences'
    },
    {
      model: Donation,
      as: 'Donations',
      include: [{
        model: Comment,
        as: 'Comments'
      }]
    }],
  })
  .then(cause => {
    res.status(200).send(cause);
  })
  .catch(error => {
    res.status(500).send(error);
  });
};

// TODO Edit cause details
// NOTE will need to find out how to remove an image form Amazon S3 as well
exports.editCauseById = (req,res) => {

    // TODO first update the cause
    Cause.update()
    .then(cause => {

      // TODO then update preferences
      res.status('200').send(cause);
    })
    .catch(err => {
      res.status('500').send(err);
    });
};
