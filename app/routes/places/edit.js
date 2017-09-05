/* eslint no-underscore-dangle: "off" */
const email = require('../../email');

const fs = require('fs');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = (req, res, next) => {
  const isAdding = !req.params.id;
  const isLogged = req.session.user;

  if (!req.busboy || (!isAdding && !isLogged)) return res.end();

  const fields = {};
  const files = {};
  const allowedFileFields = ['leaderPhoto', 'bannerPhoto'];
  const allowedFileExtensions = ['jpg', 'png'];
  const placeId = isAdding ? ObjectId() : ObjectId(req.params.id);

  req.busboy.on('file', (fieldname, file, filename) => {
    if (filename.length) {
      const extension = filename.toLowerCase().split('.').pop();

      if (allowedFileFields.indexOf(fieldname) === -1
        && allowedFileExtensions.indexOf(extension) === -1) {
        console.warn('wrong extendion or field name:', fieldname, extension);
      }

      const imgFileName = `${placeId}_${fieldname}_${Date.now()}.${extension}`;
      const fstream = fs.createWriteStream(global.appDir + global.imagesPath + imgFileName);

      file.pipe(fstream);
      files[fieldname] = imgFileName;
    }

    file.resume();
  });

  req.busboy.on('field', (key, value) => {
    fields[key] = value;
  });

  req.busboy.on('finish', storePlace);

  function storePlace() {
    delete fields.isConfirmed;
    delete fields.maintainer;

    const place = Object.assign({}, fields, files);

    if (fields.location) {
      const locationAsString = fields.location.split(',');

      place.location = {
        type: 'Point',
        coordinates: [
          parseFloat(locationAsString[0]),
          parseFloat(locationAsString[1]),
        ],
      };
    }

    if (place.denominations && place.denominations.length) {
      place.denominations = place.denominations.split(',');
    } else {
      place.denominations = [];
    }

    if (place.mainMeetingTime) {
      place.mainMeetingTime = (new Date(`${place.mainMeetingTime} 01.01.1970`));
    }

    place.address = {
      line1: place.addressLine1,
      line2: place.addressLine2,
      locality: place.locality,
      region: place.region,
      country: place.country,
      postalCode: place.postalCode,
    };

    delete place.addressLine1;
    delete place.addressLine2;
    delete place.locality;
    delete place.region;
    delete place.country;
    delete place.postalCode;

    if (isAdding) {
      place._id = placeId;
      place.isConfirmed = false;

      if (isLogged) {
        delete place.addedByEmail;
        place.maintainer = ObjectId(req.session.user._id);
      } else {
        // trim spaces
        place.addedByEmail = place.addedByEmail.replace(/^\s+/, '').replace(/\s+$/, '');

        if (!isValidEmail(fields.addedByEmail)) {
          return next(new Error('Invalid email!'));
        }
      }

      global.placeManager.add(place, finishRequest);
    } else {
      debugger;
      global.placeManager.findById(req.params.id).populate('maintainer').lean().exec((err, currentPlace) => {
        if (currentPlace) {
          if (currentPlace.maintainer && currentPlace.maintainer._id.toString() === req.session.user._id) {
            global.placeManager.update(req.params.id, place, finishRequest);
          } else {
            Object.keys(place).forEach((key) => {
              if (!Object.prototype.hasOwnProperty.call(place, key)) return;

              if (place[key]
                && !equals(currentPlace[key], place[key])
                && (currentPlace[key] || place[key])) {
                global.placeChangeManager.add({
                  user: ObjectId(req.session.user._id),
                  place: ObjectId(req.params.id),
                  field: key,
                  value: place[key],
                }, () => {});
              }
            });

            finishRequest(err, currentPlace);
          }
        } else {
          res.send("Object wasn't found");
        }
      });
    }
  }

  function finishRequest(err, place) {
    console.log(err);

    if (err) return res.redirect('/error?message=placeaddederror');

    const placePage = encodeURIComponent(`/places/${place.uri}`);

    if (isAdding) {
      Promise.resolve()
        .then(() => {
          if (!place.maintainer) return place.addedByEmail;

          return new Promise((resolve, reject) => {
            global.userManager.findById(place.maintainer, (err, maintainer) => {
              if (err) return reject(err);
              if (!maintainer) return reject(new Error('Maintainer not found'));
              resolve(maintainer.email);
            });
          });
        })
        .then((recipientEmail) => {
          email.sendNotificationAboutNewPlaceToAdmin(place._id);
          email.sendConfirmationLink(place._id, recipientEmail);
          res.redirect('/message?message=placeadded');
        })
        .catch(console.log.bind(console));
    } else if (place.maintainer === req.session.user._id) {
      res.redirect(`/message?message=placesaved&back=${placePage}`);
    } else {
      email.sendPlaceChanges({ id: place._id, recipientEmail: place.maintainer.email });
      res.redirect(`/message?message=changesadded&back=${placePage}`);
    }
  }

  function equals(a, b) {
    let atype = typeof a;
    const btype = typeof b;

    if (atype !== btype) {
      return false;
    }

    if (Array.isArray(a)) {
      atype = 'array';
    }

    if (atype === 'array') {
      return JSON.stringify(a) === JSON.stringify(b);
    } else if (atype === 'object') {
      const aProps = Object.keys(a);
      const bProps = Object.keys(b);

      if (aProps.length !== bProps.length) {
        return false;
      }

      for (let i = 0; i < aProps.length; i += 1) {
        const propName = aProps[i];

        if (!equals(a[propName], b[propName])) {
          return false;
        }
      }

      return true;
    }

    return a === b;
  }

  function isValidEmail(emailString) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(emailString);
  }
};
