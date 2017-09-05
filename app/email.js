const config = require('../app/config');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport(config.mailConfig, { from: config.mailConfig.from });

// verify transporter is connected success
if (process.env.NODE_ENV === 'production') {
  transporter.verify().catch((err) => {
    console.log(`Mail config error: ${err.message}`);
    process.exit(1);
  });
}

module.exports.sendNotificationAboutNewPlaceToAdmin = (id, callback) => {
  getAdminEmails(function(err, adminEmails) {
    var mailText = 'New place was added: ' +
      config.url + '/places/' + id;
    var mailOptions = {
      from: config.mailConfig.senderAddress,
      to: adminEmails,
      subject: 'New place notification',
      text: mailText
    };

    transporter.sendMail(mailOptions, callback);
  });
};

module.exports.sendNotificationAboutNewPlace = function(id, email, callback) {
  var mailText = 'New place near you was added: ' +
    config.url + '/places/' + id;
  var mailOptions = {
    from: config.mailConfig.senderAddress,
    to: email,
    subject: 'New place notification',
    text: mailText
  };

  transporter.sendMail(mailOptions, callback);
};

module.exports.sendConfirmationLink = function(id, email, callback) {
  var mailText = 'Thank you for adding a new place to opendoor.ooo. ' +
    'Before your place is published on the website you need to click the link below. ' +
    'If you find you can`t click the link then please copy it into your web browser.' +
    'Please confirm it by passing the link: ' +
    config.url + '/places/confirm/' + id;
  var mailOptions = {
    from: config.mailConfig.senderAddress,
    to: email,
    subject: 'One step away from your Place being published on opendoor.ooo',
    text: mailText
  };

  transporter.sendMail(mailOptions, callback);
};

module.exports.sendFeedback = function(options, callback) {
  getAdminEmails(function(err, adminEmails) {
    var mailText = 'User: ' + options.name +
      '\nEmail: ' + options.email +
      '\nTarget page: ' + options.target +
      '\nNote: ' + options.note;

    var mailOptions = {
      from: config.mailConfig.senderAddress,
      to: adminEmails.join(', '),
      subject: 'Feedback about OpenDoor',
      text: mailText
    };

    transporter.sendMail(mailOptions, callback);
  });
};

module.exports.sendMessage = function(options, callback) {
  var mailText = 'Sender: ' + options.senderEmail + '\n' +
    'Subject: ' + options.subject + '\n' +
    'Message: ' + options.text;
  var mailOptions = {
    from: config.mailConfig.senderAddress,
    to: options.recipientEmail,
    subject: 'Message from OpenDoor.ooo',
    text: mailText
  };

  transporter.sendMail(mailOptions, callback);
};

module.exports.sendJobMessage = function(options, callback) {
  var mailText = 'You got a message about job: ' + config.url + '/jobs/' + options.id + '\n' +
    'Sender: ' + options.senderEmail + '\n' +
    'Name: ' + options.name + '\n' +
    'Message: ' + options.text;
  var mailOptions = {
    from: config.mailConfig.senderAddress,
    to: options.recipientEmail,
    subject: 'Message from OpenDoor.ooo',
    text: mailText
  };

  transporter.sendMail(mailOptions, callback);
};

module.exports.sendEditorProposal = function(options, callback) {
    var mailText = 'Someone asked you to be an editor of place: ' + config.url + '/places/' + options.id + '\n' +
      'You can claim to be editor by passing by the link: ' + config.url + '/claims/' + options.id + '/add' + '\n';
    var mailOptions = {
      from: config.mailConfig.senderAddress,
      to: options.recipientEmail,
      subject: 'Message from OpenDoor.ooo',
      text: mailText
    };


    transporter.sendMail(mailOptions, callback);
  };

module.exports.sendPlaceChanges = function(options, callback) {
  var mailText = 'Someone suggested changes for place: ' + config.url + '/places/' + options.id + '\n' +
    'You can check them at ' + config.url + '/places/claims\n';
  var mailOptions = {
    from: config.mailConfig.senderAddress,
    to: options.recipientEmail,
    subject: 'Message from OpenDoor.ooo',
    text: mailText
  };


  transporter.sendMail(mailOptions, callback);
};

module.exports.notifyAboutAcceptedChanges = function(options, callback) {
  var mailText = 'Place maintainer accepted your suggested changes.\n' +
    'You can check them at ' + config.url + '/places/' + options.id + '\n';
  var mailOptions = {
    from: config.mailConfig.senderAddress,
    to: options.recipientEmail,
    subject: 'Message from OpenDoor.ooo',
    text: mailText
  };


  transporter.sendMail(mailOptions, callback);
};

module.exports.sendClaimConfirmation = function(options, callback) {
  var mailText = 'Your claim for editing place: ' + config.url + '/places/' + options.id + ' was accepted.\n' +
    'Now you will be able to edit the place.';
  var mailOptions = {
    from: config.mailConfig.senderAddress,
    to: options.recipientEmail,
    subject: 'Message from OpenDoor.ooo',
    text: mailText
  };


  transporter.sendMail(mailOptions, callback);
};

module.exports.sendPlaceReminder = function(options, callback) {
  var mailText = 'Place ' + config.url + '/places/' + options.id + ' was updated 3 months ago.\n' +
    'Please update information about it or press "Everything is up to date".';
  var mailOptions = {
    from: config.mailConfig.senderAddress,
    to: options.recipientEmail,
    subject: 'Message from OpenDoor.ooo',
    text: mailText
  };

  console.log(mailOptions);

  transporter.sendMail(mailOptions, callback);
};

module.exports.sendSubscriptionConfirmation = function(options, callback) {
  var mailText = 'Please confirm your subscription passing by link ' + config.url + '/subscriptions/confirm/' + options.id ;
  var mailOptions = {
    from: config.mailConfig.senderAddress,
    to: options.recipientEmail,
    subject: 'Message from OpenDoor.ooo',
    text: mailText
  };

  transporter.sendMail(mailOptions, callback);
};

function getAdminEmails(callback) {
  global.userManager.find({ isAdmin: true }, function (err, users) {
    if (err) {
      console.log(err);
    }
    else {
      var adminEmails = [];
      for (var i = 0; i < users.length; i++) {
        adminEmails.push(users[i].email);
      }
    }
    if (typeof callback == 'function') {
      callback(err, adminEmails);
    }
  })
}
