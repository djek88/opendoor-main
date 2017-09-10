const Denomination = require('../../models/denomination.model');

module.exports = (req, res) => {
  Denomination.find(req.query, (err, denomins) => res.send(JSON.stringify(err || denomins)));
};
