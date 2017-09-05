const email = require('../../email');

module.exports = (req, res) => {
  if (req.session.user) {
    const options = {
      id: req.params.id,
      recipientEmail: req.body.email,
    };

    email.sendEditorProposal(options, () => {
      res.redirect(`/message?message=proposalsent&back=${encodeURIComponent(`/places/${place.uri}`)}`);
    });
  }
};
