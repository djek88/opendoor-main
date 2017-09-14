const email = require('../../lib/email');

module.exports = (req, res) => {
  if (req.session.user) {
    const options = {
      placeId: req.params.id,
      recipientEmail: req.body.email,
    };

    email.send('sendEditorProposal', options)
      .then(() => res.redirect(`/message?message=proposalsent&back=${encodeURIComponent(`/places/${place.uri}`)}`));
  }
};
