const ReligionGroup = require('../../models/religion.group.model');

module.exports = (req, res) => {
  const query = Object.assign({}, req.query);

  ReligionGroup.find(query, (err, groups) => res.send(JSON.stringify(err || groups)));
};
