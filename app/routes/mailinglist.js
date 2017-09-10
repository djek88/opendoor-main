const json2csv = require('json2csv');
const Subscription = require('../models/subscription.model');

module.exports = (req, res, next) => {
  if (!req.session.user && !req.session.user.isAdmin) return res.redirect('/error');

  const fields = [
    {
      label: 'Email',
      value: 'email',
    }, {
      label: 'Place ID',
      value: 'place.name',
    }, {
      label: 'Place URI',
      value: 'place.uri',
    }, {
      label: 'Place religion',
      value: 'place.religion',
    }, {
      label: 'Group name',
      value: 'place.groupName',
    },
    // {
    //  label: 'Place ID',
    //  value: 'place._id'
    //  // default: 'NULL'
    // }
  ];

  Subscription
    .find()
    .populate('place', { name: 1, uri: 1, religion: 1, groupName: 1 })
    .exec((err, subscriptions) => {
      if (err) return next(err);

      json2csv({ data: subscriptions, fields }, (err, csv) => {
        if (err) return next(err);

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=mailing_list.csv');
        res.send(csv);
      });
    });
};
