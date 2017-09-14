const nodemailer = require('nodemailer');
const config = require('../config');
const User = require('../models/user.model');

class Email {
  constructor() {
    this.transporter = nodemailer.createTransport(config.mailConfig, {
      from: config.mailConfig.from,
    });
  }

  checkConnection() {
    return this.transporter.verify();
  }

  async send(theme, opts) {
    // send email to admins
    if (!opts.recipientEmail) {
      opts.recipientEmail = await Email._getAdminEmails();
    }

    const mailOptions = Email._getOptionsByTheme(theme, opts);

    return this.transporter.sendMail(mailOptions);
  }

  static get THEMES() {
    return {
      sendNotificationAboutNewPlaceToAdmin: {
        text: `New place was added: ${config.url}/places/$placeId$`,
        subject: 'New place notification',
      },
      sendNotificationAboutNewPlace: {
        text: `New place near you was added: ${config.url}/places/$placeId$`,
        subject: 'New place notification',
      },
      sendConfirmationLink: {
        text: `Thank you for adding a new place to opendoor.ooo.
          Before your place is published on the website you need to click the link below.
          If you find you can\`t click the link then please copy it into your web browser.
          Please confirm it by passing the link: ${config.url}/places/confirm/$placeId$`,
        subject: 'One step away from your Place being published on opendoor.ooo',
      },
      sendFeedback: {
        text: `User: $userName$
          Email: $email$
          Target page: $targetPage$
          Note: $note$`,
      },
      sendMessage: {
        text: `Sender: $senderEmail$
          Subject: $subject$
          Message: message`,
      },
      sendEditorProposal: {
        text: `Someone asked you to be an editor of place: ${config.url}/places/$placeId$
          You can claim to be editor by passing by the link: ${config.url}/claims/$placeId$/add`,
      },
      sendPlaceChanges: {
        text: `Someone suggested changes for place: ${config.url}/places/$placeId$
          You can check them at ${config.url}/places/claims`,
      },
      notifyAboutAcceptedChanges: {
        text: `Place maintainer accepted your suggested changes.
          You can check them at ${config.url}/places/$placeId$`,
      },
      sendClaimConfirmation: {
        text: `Your claim for editing place: ${config.url}/places/$placeId$ was accepted.
          Now you will be able to edit the place.`,
      },
      sendPlaceReminder: {
        text: `Place ${config.url}/places/$placeId$ was updated 3 months ago.
          Please update information about it or press "Everything is up to date".`,
      },
      sendSubscriptionConfirmation: {
        text: `Please confirm your subscription passing by link ${config.url}/subscriptions/confirm/$subscriptionId$`,
      },
    };
  }

  static async _getAdminEmails() {
    const admins = await User.find({
      isAdmin: true,
    }).exec();
    if (!admins.length) throw new Error('No admin users presence!');

    return admins.map(admin => admin.email);
  }

  static _getOptionsByTheme(themeName, opts) {
    const optsPattern = {
      from: config.mailConfig.senderAddress,
      to: opts.recipientEmail,
      subject: 'Message from OpenDoor.ooo',
      text: '',
    };
    const themeOpts = Email.THEMES[themeName];
    themeOpts.text = Email._handleMessage(themeOpts.text, opts);

    return Object.assign(optsPattern, themeOpts);
  }

  static _handleMessage(msg, args) {
    Object.keys(args).forEach(key => {
      const re = new RegExp(`\\$${key}\\$`, 'g');
      msg = msg.replace(re, args[key]);
    });
    return msg;
  }
}

const email = new Email();

if (process.env.NODE_ENV === 'production') {
  email.checkConnection().catch(err => {
    console.log(`Mail config error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = email;
