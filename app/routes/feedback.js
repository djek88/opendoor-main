const email = require('../lib/email');

module.exports = (req, res) => {
  email.sendFeedback({
    name: req.body.name,
    email: req.body.email,
    target: req.body.target,
    note: req.body.note,
  });

  res.redirect('/message?message=feedbacksaved');
};
