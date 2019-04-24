const nodemailer = require('nodemailer');
const templates = require('./templates');

// TODO Determine what other types of emails we need to send and customize this service

const transporter = nodemailer.createTransport({
    service: 'gmail',
    // port: 993,
    // secure: false,
    auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PW,
    }
});

const getMailOptions = (type, mailData) => {

    const { subject, html } = templates[type](mailData);

    return {
        from: process.env.APP_EMAIL,
        to: mailData.email,
        subject,
        html,
    }
};

exports.sendEmail = (type, mailData) => {

    const options = getMailOptions(type, mailData);

    transporter.sendMail(options, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};
