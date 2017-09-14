const email = require('../lib/email');

module.exports = async (req, res, next) => {
  try {
    await email.send('sendFeedback', {
      userName: req.body.name,
      email: req.body.email,
      targetPage: req.body.target,
      note: req.body.note,
    });

    res.redirect('/message?message=feedbacksaved');
  } catch (err) {
    next(err);
  }
};
