module.exports = (req, res) => {
  delete req.session.user;
  res.clearCookie('_id');
  res.clearCookie('email');
  res.clearCookie('isAdmin');
  res.redirect('/');
};
