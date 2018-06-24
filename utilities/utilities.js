// Utility functions to be used throughout API
const bcrypt = require("bcrypt");

const Utils = {

  createNewObject: (obj, exclusions) => {
      const keys = Object.keys(obj);
      let updatedObject = new Object();

      for (var i = 0; i < keys.length; i++) {
          if ( !exclusions.includes(keys[i]) ) {
              updatedObject[keys[i]] = obj[keys[i]];
          };
      };

      return updatedObject;
  },

  hashPassword: (password) => {
      let salt = bcrypt.genSaltSync(10);
      let passwordHash = bcrypt.hashSync(password, salt);
      return passwordHash;
  },

  getExclusions: (excludes) => {
      switch (excludes) {
        case 'user':
          return ['name', 'email', 'password', 'street', 'city', 'state', 'zipcode', 'phone', 'backgroundImage', 'mainImage'];

        case 'preferences':
          return ['roundImage', 'whiteText'];

        case 'causes':
          return ['userID', 'orgID', 'name', 'type', 'amount', 'description', 'purpose', 'icon', 'featured', 'backgroundImage', 'mainImage'];

        case 'organizations':
          return ['userId', 'taxId', 'name', 'short_name', 'heading', 'mission', 'email', 'site_url', 'backgroundImage', 'mainImage'];

        case 'donations':
          return ['userID', 'causeID', 'amount'];

        default:
          return [];
      };
  },


};

module.exports = Utils;
