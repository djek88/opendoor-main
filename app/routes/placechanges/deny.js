module.exports = async (req, res, next) => {
  const placeChangeId = req.params.id;

  try {
    if (!req.session.user) throw new Error('Access denied');

    await global.placeChangeManager.removeChange(placeChangeId);

    res.redirect(`/message?message=changedenied&back=${encodeURIComponent('/places/changes')}`);
  } catch (err) {
    res.redirect(`/error&back=${encodeURIComponent('/places/changes')}`);
    next(err);
  }
};
