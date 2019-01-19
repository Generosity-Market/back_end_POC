const { Organization, Preference, Cause } = require('../models/index');
const multiparty = require('multiparty');
const awsUtils = require('../utilities/awsUploads');

//-----------------------
// Organizations Routes
//-----------------------

// WIP Create an organization
exports.createOrg = (req,res) => {
  // TODO can any of this logic be extracted in any way?? maybe getUploadParameters?
  const form = new multiparty.Form();

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
        backgroundImage: cover_response.Location,
        mainImage: profile_response.Location,
        roundImage: undefined,
        whiteText: undefined,
        cover_image: undefined,
        profile_image: undefined,
      }
      console.log("Changes: ", stateChanges);

      const newOrg = Object.assign({}, state, stateChanges);
      console.log("New Organization: ", newOrg);

      // NOTE Possibly do the verification on the front end, and only create the organization if verified??
      const searchURL = `https://projects.propublica.org/nonprofits/api/v2/organizations/${taxID}.json`;

      // TODO this should be extracted into fetchers.js...
      fetch(searchURL)
        .then(response => response.json())
        .then(data => {

          if (data.organization.careofname.includes(director.toUpperCase())) {

            Organization.create(newOrg)
              .then(org => {
                Preference.create({ orgID: org.id, roundImage: roundImage, whiteText: whiteText })
                  .then(preferences => {
                    org['Preferences'] = preferences;
                    res.status('201').send({ Organization: org });
                  })
              })

          } else {
            res.status(403).send({ error: "Organization cannot be verified." })
          }
        })
        .catch(err => res.status(404).send({ error: err, Message: "Not Found" }));
    } catch (error) {
      res.status(400).send(error);
    }
  })

};

// Get all organizations
exports.getAllOrgs = (req,res) => {
  Organization.findAll({
    include: [{
      model: Preference,
      as: 'Preferences'
    },{
      model: Cause,
      as: 'Causes',
      include: [{
        model: Preference,
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
};

// Get organization by id
exports.getOrgById = (req,res) => {
  Organization.findOne({
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
      }]
    }]
  })
  .then(org => {
    res.status(200).send(org);
  })
  .catch(error => {
    res.status(500).send(error);
  });
};

//TODO Edit organization details
exports.editOrg = (req,res) => {
    // TODO first update the organization
    Organization.update({
      // TODO Add params...
    })
    .then(org => {
      //TODO then update Preferences
      res.status('200').send( { Organization: org } );
    })
    .catch(err => {
      res.status('500').send(err);
    })
};
