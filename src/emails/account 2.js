const sgMail = require('@sendgrid/mail')

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'mxthu@ucdavis.edu',
        subject: 'welcome to the app',
        text: `Welcome to the app, ${name}. Let me know how you get along`
    })
}

module.exports = {
    sendWelcomeEmail
}