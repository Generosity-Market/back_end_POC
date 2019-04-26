const models = require('../models/index');

const { Preference } = models;

//-----------------------
//  Preferences Routes
//-----------------------

// NOTE WIP Update Preferences Route
// TODO Will we need this route if it's built in the others??
exports.updatePreferences = (req, res) => {
  // TODO write update functions here. Remember we have many different data types that have preferences options, including Users, Causes, and Organizations.
  Preference.update({
    roundImage: req.body.roundImage,
    whiteText: req.body.whiteText
  }, {
      where: { id: req.params.id }
    })
    .then(preferences => {
      res.send(200).json(preferences);
    })
    .catch(err => {
      res.send(400).json(err);
    });

};
