const ObjectId = require('mongoose').Types.ObjectId;
const email = require('../../lib/email');
const Place = require('../../models/place.model');

module.exports = (req, res) => {
  const user = req.session.user;
  const jobId = req.params.id;
  const options = {
    jobId,
    sender: user ? user.email : req.body.email,
    name: user ? user.name : req.body.name,
    message: req.body.text,
  };

  console.log({$match: {'jobs._id': ObjectId(id)}});

  Place.aggregate([
    {$match: {'jobs._id': ObjectId(id)}}
    , {$unwind: '$jobs'}
    , {$project: {_id: '$jobs._id', placeuri: '$uri', email: '$jobs.email'}}
  ], function(err, jobs){
    if (jobs.length) {
      const job = jobs[0];
      if (job && job.email) {
        options.recipientEmail = job.email;

        email.send('sendJobMessage', options)
          .then(() => res.redirect(`/message?message=messagesent&back=${encodeURIComponent(`/places/${job.placeuri}`)}`));
      } else {
        console.log(arguments);
        res.end();
      }
    }
    else res.end();
  });
};
