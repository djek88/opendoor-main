const config = require('./app/config');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('cookie-session');
const busboy = require('connect-busboy');
const jade = require('jade');
const prerender = require('./app/prerenderservice');
const siteMap = require('./app/routes/sitemap');
const Place = require('./app/models/place.model');
// const sendPlaceReminder = require('./app/schedule/sendplacereminder');
// const schedule = require('node-schedule');

require('./assets/js/utils.js');
require('./app/date.min.js');

const app = express();

const server = http.createServer(app);

server.listen(config.port, config.hostname);
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof config.port === 'string'
    ? `Pipe ${config.port}`
    : `Port ${config.port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`;
  console.log(`Listening on ${bind}`);
});

global.appDir = path.dirname(require.main.filename);
global.imagesPath = '/photos/';

const siteconfig = {
  sitename: config.sitename,
  url: config.url,
  imagesPath: global.imagesPath,
  twitterAccount: config.social.twitterAccount,
  frontend: config.frontend,
  l10n: config.l10n,
  apiKeys: {
    stripePublic: config.apiKeys.stripePublic,
    googleMaps: config.apiKeys.googleMaps,
  },
};

if (config.prerenderService.enable) {
  prerender.runServer();
  app.use(prerender);
}

app.set('view options', { pretty: true });
app.use(cookieParser(config.cookieKeys));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy({ immediate: true }));
app.use(session({ secret: config.sessionSecret }));
app.use('/bower_components', express.static('bower_components'));
app.use('/assets', express.static('assets'));
app.use('/photos', express.static('photos'));
app.use('/favicon.ico', express.static('assets/img/favicon.ico'));
app.use('/robots.txt', express.static('robots.txt'));
app.use('/generateSitemap', siteMap());
app.use('/mailingList', require('./app/routes/mailinglist'));

app.use(config.staticFiles, (req, res) => {
  const filename = path.join(__dirname, 'static', req.baseUrl);

  fs.stat(filename, (err, stats) => {
    if (!stats) {
      return res.status(404).end();
    }

    if (filename.match(/\.xml$/)) {
      res.set('Content-Type', 'text/xml');
    }

    res.sendFile(filename);
  });
});
app.use((req, res, next) => {
  res.header('Expires', (new Date(0).toGMTString()));
  next();
});


app.get('/assets/templates/partials/:filename.html', (req, res) => {
  jade.renderFile(`${__dirname}/assets/templates/partials/${req.params.filename}.jade`, (err, html) => {
    if (err) return console.log(err);

    res.send(html);
  });
});

app.get('/siteconfig.js', require('./app/routes/siteconfig')(siteconfig));
app.post('/register', require('./app/routes/register'));
app.post('/login', require('./app/routes/login'));
app.get('/logout', require('./app/routes/logout'));

app.get('/ajax/users', require('./app/routes/ajax/users'));
app.get('/ajax/users/:id', require('./app/routes/ajax/findoneuser'));
app.get('/ajax/places/search', require('./app/routes/ajax/places/search'));
app.get('/ajax/places/geosearch', require('./app/routes/ajax/places/search'));
app.get('/ajax/places/searchbyip', require('./app/routes/ajax/places/search'));
app.get('/ajax/places/maintained', require('./app/routes/ajax/places/maintained'));
app.get('/ajax/places/maintained/:id', require('./app/routes/ajax/places/maintained'));
app.get('/ajax/places/last', require('./app/routes/ajax/places/last'));
app.get(/\/ajax\/places\/(.*)/, require('./app/routes/ajax/places/findone')); // keep this route at bottom of all other ones which are /ajax/places/* because this one is greedy
app.get(['/ajax/jobs/:id', '/ajax/jobs/search'], require('./app/routes/ajax/jobs'));
app.get(['/ajax/events/:id', '/ajax/events/search'], require('./app/routes/ajax/events'));
app.get('/ajax/placechanges', require('./app/routes/ajax/places/changes'));
app.get('/ajax/countries', require('./app/routes/ajax/countries'));
app.get('/ajax/localities', require('./app/routes/ajax/localities'));
app.get('/ajax/religionGroups', require('./app/routes/ajax/religionGroups'));
app.get('/ajax/denominations', require('./app/routes/ajax/denominations'));
app.get('/ajax/claims', require('./app/routes/ajax/claims'));

app.get('/subscriptions/confirm/:id', require('./app/routes/subscriptions/confirm'));
app.post(['/jobs/add', '/jobs/edit/:id'], require('./app/routes/jobs/edit'));
app.post('/jobs/fund/:id', require('./app/routes/jobs/fund'));
app.post('/jobs/:id', require('./app/routes/jobs/contact'));

app.get('/places/confirm/:id', require('./app/routes/places/confirm'));
app.post(['/places/add', '/places/edit/:id'], require('./app/routes/places/edit'));
app.post('/places/editorproposal/:id', require('./app/routes/places/editorproposal'));
app.post('/places/review/:id', require('./app/routes/places/addreview'));
app.post('/places/donate/:id', require('./app/routes/promotion'));
app.get('/places/uptodate/:id', require('./app/routes/places/uptodate'));
app.post('/places/message', require('./app/routes/places/message'));
app.post('/places/subscribe', require('./app/routes/subscriptions/subscribe'));

app.post(['/events/add', '/events/:id/edit'], require('./app/routes/places/upsertevent'));
app.post('/feedback', require('./app/routes/feedback'));
app.get('/claims/:id/add', require('./app/routes/claims/add'));
app.get('/claims/:id/accept', require('./app/routes/claims/accept'));
app.get('/claims/:id/deny', require('./app/routes/claims/deny'));
app.get('/placechanges/:id/accept', require('./app/routes/placechanges/accept'));
app.get('/placechanges/:id/deny', require('./app/routes/placechanges/deny'));
app.post('/subscribefornotification', require('./app/routes/subscribefornotification'));

app.get('/version', (req, res) => res.send('1.0.1'));

const frontendPages = [
  '/',
  '/login',
  '/tools',
  '/register',
  '/feedback',
  '/about',
  '/error',
  '/message',
  '/notfound',
  '/subscribefornotification',
  '/places/',
  '/places/list',
  '/places/last',
  '/places/add',
  '/places/claims',
  '/places/changes',
  '/places/edit/:id',
  '/users/list',
  '/users/:id',
  '/promotion/:id',

  '/places/by-group-name',

  '/places/maintained',
  '/places/:country/',
  '/places/:country/:locality/',
  '/places/review/:id',
  '/places/donate/:id',
  '/places/editorproposal/:id',
  // /\/places\/(.*)/,
  '/events/add',
  '/events/search',
  '/events/:id/edit',
  '/jobs/search',
  '/jobs/add',
  '/jobs/:id',
  '/jobs/edit/:id',
  '/jobs/fund/:id',
];

app.get(frontendPages, (req, res) => {
  const options = {
    apiKeys: config.apiKeys,
    pretty: true,
    currentYear: (new Date()).getFullYear(),
    originalCss: req.query.originalCss,
    twitterAccount: config.social.twitterAccount,
    userIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  };

  jade.renderFile(`${__dirname}/assets/templates/index.jade`, options, (err, content) => {
    if (err) return console.log(err);

    res.send(content);
  });
});

const placesFrontEndPages = [
  '/places/:id',
  '/places/:country/:region/:locality/:religion/:groupName/:name',
];

app.get(placesFrontEndPages, (req, res) => {
  const query = {};

  if (req.params.country) {
    query.uri = req.path.substr(8).toLowerCase();
  } else {
    query.id = req.params.id;
  }

  Place.findOne(query)
    .then((place) => {
      if (!place) return res.sendStatus(404);

      const options = {
        apiKeys: config.apiKeys,
        isPlace: true,
        place,
        siteconfig,
        pretty: true,
        currentYear: (new Date()).getFullYear(),
        originalCss: req.query.originalCss,
        twitterAccount: config.social.twitterAccount,
        userIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      };

      return jade.renderFile(`${__dirname}/assets/templates/index.jade`, options);
    })
    .then(content => res.send(content))
    .catch((err) => {
      console.log(err);
      res.sendStatus(404);
    });
});

// schedule.scheduleJob('* * 0 * * *', sendPlaceReminder(placeManager, global.email));
// schedule.scheduleJob('* * 0 * * *', setYear);
