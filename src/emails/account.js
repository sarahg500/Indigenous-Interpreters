const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = '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'

sgMail.setApiKey(sendgridAPIKey)

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