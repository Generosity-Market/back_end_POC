const fetch = require('node-fetch');

const verificationURL = `https://projects.propublica.org/nonprofits/api/v2/organizations/${taxID}.json`;

const verifyNonProfitStatus = (URL, taxID) => {
    const fetchURL = `${URL}${taxID}.json`;
    fetch(fetchURL)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.log('Error: ', err));
};

const Fetchers = {
  verifyNonProfitStatus:
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
  }),

}

module.exports = Fetchers;
