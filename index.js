const config = require('./app/config');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('cookie-session');
const busboy = require('connect-busboy');
const jade = require('jade');
const stripe = require('stripe')(config.apiKeys.stripeSecret);
// const schedule = require('node-schedule');
// const sendPlaceReminder = require('./app/schedule/sendplacereminder');
const prerender = require('./app/prerenderservice');
const mailingList = require('./app/routes/mailinglist');
const siteMap = require('./app/routes/sitemap');

require('./assets/js/utils.js');
require('./app/date.min.js');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoURI);

const app = express();
const transporter = nodemailer.createTransport(config.mailConfig, { from: config.mailConfig.from });

// verify transporter is connected success
if (process.env.NODE_ENV === 'production') {
  transporter.verify().catch((err) => {
    console.log(`Mail config error: ${err.message}`);
    process.exit(1);
  });
}

mongoose.connection
  .once('open', () => {
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
  })
  .on('error', console.error);


const Email = require('./app/email');

const email = new Email(config, transporter);

const UserManager = require('./app/usermanager')(mongoose);

const userManager = new UserManager();

const PlaceManager = require('./app/placemanager')(mongoose, email);

const placeManager = new PlaceManager();

const ReligionGroupManager = require('./app/religiongroupmanager')(mongoose);

const religionGroupManager = new ReligionGroupManager();

const DenominationManager = require('./app/denominationmanager')(mongoose);

const denominationManager = new DenominationManager();

const ClaimManager = require('./app/claimmanager')(mongoose, email);

const claimManager = new ClaimManager();

const PlaceChangeManager = require('./app/placechangemanager')(mongoose);

const placeChangeManager = new PlaceChangeManager();

const PlaceNotificationManager = require('./app/placenotificationmanager')(mongoose);

const placeNotificationManager = new PlaceNotificationManager();

const SubscriptionManager = require('./app/subscriptionmanager')(mongoose);

const subscriptionManager = new SubscriptionManager();

global.userManager = userManager;
global.placeManager = placeManager;
global.religionGroupManager = religionGroupManager;
global.denominationManager = denominationManager;
global.placeNotificationManager = placeNotificationManager;
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
app.use('/generateSitemap', siteMap(placeManager));
app.use('/mailingList', mailingList(subscriptionManager));
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

app.get('/siteconfig.js', require('./app/routes/siteconfig.js')(siteconfig));
app.post('/register', require('./app/routes/register.js')(userManager));
app.post('/login', require('./app/routes/login.js')(userManager));
app.get('/logout', require('./app/routes/logout.js')());

app.get('/ajax/users', require('./app/routes/ajax/users.js')(userManager));
app.get('/ajax/users/:id', require('./app/routes/ajax/findoneuser.js')(userManager));
app.get('/ajax/places/search', require('./app/routes/ajax/places/search.js')(config, placeManager));
app.get('/ajax/places/geosearch', require('./app/routes/ajax/places/search.js')(config, placeManager));
app.get('/ajax/places/searchbyip', require('./app/routes/ajax/places/search.js')(config, placeManager));
app.get('/ajax/places/maintained', require('./app/routes/ajax/places/maintained.js')(config, mongoose, placeManager));
app.get('/ajax/places/maintained/:id', require('./app/routes/ajax/places/maintained.js')(config, mongoose, placeManager));
app.get('/ajax/places/last', require('./app/routes/ajax/places/last.js')(config, placeManager));
app.get(/\/ajax\/places\/(.*)/, require('./app/routes/ajax/places/findone.js')(placeManager)); // keep this route at bottom of all other ones which are /ajax/places/* because this one is greedy
app.get(['/ajax/jobs/:id', '/ajax/jobs/search'], require('./app/routes/ajax/jobs.js')(mongoose, placeManager));
app.get(['/ajax/events/:id', '/ajax/events/search'], require('./app/routes/ajax/events.js')(mongoose, placeManager, config));
app.get('/ajax/placechanges', require('./app/routes/ajax/places/changes.js')(mongoose, placeManager, placeChangeManager));
app.get('/ajax/countries', require('./app/routes/ajax/countries.js')(placeManager));
app.get('/ajax/localities', require('./app/routes/ajax/localities.js')(placeManager));
app.get('/ajax/religionGroups', require('./app/routes/ajax/religionGroups.js')(religionGroupManager));
app.get('/ajax/denominations', require('./app/routes/ajax/denominations.js')(denominationManager));
app.get('/ajax/claims', require('./app/routes/ajax/claims.js')(claimManager));

app.get('/subscriptions/confirm/:id', require('./app/routes/subscriptions/confirm.js')(subscriptionManager));
app.post(['/jobs/add', '/jobs/edit/:id'], require('./app/routes/jobs/edit.js')(mongoose, placeManager, placeManager));
app.post('/jobs/fund/:id', require('./app/routes/jobs/fund.js')(placeManager, stripe));
app.post('/jobs/:id', require('./app/routes/jobs/contact.js')(mongoose, placeManager, email));

app.get('/places/confirm/:id', require('./app/routes/places/confirm.js')(placeManager));
app.post(['/places/add', '/places/edit/:id'], require('./app/routes/places/edit.js')(placeChangeManager, email, placeManager));
app.post('/places/editorproposal/:id', require('./app/routes/places/editorproposal.js')(email));
app.post('/places/review/:id', require('./app/routes/places/addreview.js')(placeManager));
app.post('/places/donate/:id', require('./app/routes/promotion.js')(placeManager, stripe));
app.get('/places/uptodate/:id', require('./app/routes/places/uptodate.js')(placeManager));
app.post('/places/message', require('./app/routes/places/message.js')(placeManager, email));
app.post('/places/subscribe', require('./app/routes/subscriptions/subscribe.js')(subscriptionManager, placeManager, email));

app.post(['/events/add', '/events/:id/edit'], require('./app/routes/places/upsertevent.js')(placeManager, mongoose));
app.post('/feedback', require('./app/routes/feedback.js')(userManager, config, email));
app.get('/claims/:id/add', require('./app/routes/claims/add.js')(mongoose, claimManager, placeManager));
app.get('/claims/:id/accept', require('./app/routes/claims/accept.js')(claimManager));
app.get('/claims/:id/deny', require('./app/routes/claims/deny.js')(claimManager));
app.get('/placechanges/:id/accept', require('./app/routes/placechanges/accept.js')(placeChangeManager, email));
app.get('/placechanges/:id/deny', require('./app/routes/placechanges/deny.js')(placeChangeManager, email));
app.post('/subscribefornotification', require('./app/routes/subscribefornotification.js')(placeNotificationManager));

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

  placeManager.findOne(query)
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

// schedule.scheduleJob('* * 0 * * *', sendPlaceReminder(placeManager, email));
// schedule.scheduleJob('* * 0 * * *', setYear);
