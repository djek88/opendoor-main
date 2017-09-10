const ObjectId = require('mongoose').Types.ObjectId;
const Place = require('../../models/place.model');

module.exports = (req, res) => {
  const getById = req.params.id && req.params.id.toString() !== 'search';
  let query;
  if (getById) {
    const id = req.params.id;
    query = { 'jobs._id': ObjectId(id) };
  } else {
    query = req.query;
    query['jobs.expireDate'] = { $gt: (new Date()).add(1).day() };
  }

  if (query.locality) {
    query['address.locality'] = query.locality;
    delete query.locality;
  }
  if (query.country) {
    query['address.country'] = query.country;
    delete query.country;
  }

  Place.aggregate([
    { $match: query },
    { $unwind: '$jobs' },
    { $project: { _id: '$jobs._id', title: '$jobs.title', expireDate: '$jobs.expireDate', type: '$jobs.type', place: '$name', description: '$jobs.description', placeuri: '$uri', country: '$address.country' } },
    { $match: { expireDate: { $gt: Date.now() } } },
  ], (err, jobs) => res.send(JSON.stringify(err || getById ? jobs[0] : jobs)));
};
