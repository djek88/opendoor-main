const ObjectId = require('mongoose').Types.ObjectId;
const email = require('../../lib/email');
const Place = require('../../models/place.model');

module.exports = (req, res) => {
  var id = req.params.id;
  var data = {
    text: req.body.text
    , id: id
  };

  if (req.session.user) {
    data.senderEmail = req.session.user.email;
    data.name = req.session.user.name;
  }
  else {
    data.senderEmail = req.body.email;
    data.name = req.body.name;
  }

  console.log({$match: {'jobs._id': ObjectId(id)}});

  Place.aggregate([
    {$match: {'jobs._id': ObjectId(id)}}
    , {$unwind: '$jobs'}
    , {$project: {_id: '$jobs._id', placeuri: '$uri', email: '$jobs.email'}}
  ], function(err, jobs){
    if (jobs.length) {
      var job = jobs[0];
      if (job && job.email) {
        data.recipientEmail = job.email;
        email.sendJobMessage(data, function(){
          res.redirect('/message?message=messagesent&back=' + encodeURIComponent('/places/' + job.placeuri));
        });
      }
      else {
        console.log(arguments);
        res.end();
      }
    }
    else res.end();
  });
};
