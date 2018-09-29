const models = require('../models/index');

//-----------------------
// Organizations Routes
//-----------------------

const { Organization, Preference } = models;

// WIP Create an organization
exports.createOrg = (req,res) => {
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
};

// Get all organizations
exports.getAllOrgs = (req,res) => {
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
};

// Get organization by id
exports.getOrgById = (req,res) => {
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
};

//TODO Edit organization details
exports.editOrg = (req,res) => {

    // TODO first update the organization
    models.Organization.update()
    .then(org => {

      //TODO then update Preferences
      res.status('200').send( { Organization: org } );
    })
    .catch(err => {
      res.status('500').send(err);
    })
};
