const User = require('../../models/user.model');

module.exports = (req, res) => {
  if (!req.session.user.isAdmin) return res.end();

  const data = req.query;
  // if (req.params.id) {
  //   query['_id'] = req.params.id;
  // }

  User.search(data, (err, users) => {
    if (!err) {
      res.send(JSON.stringify(users));
    } else {
      res.send(JSON.stringify(err));
    }
  });
};
