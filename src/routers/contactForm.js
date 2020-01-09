const express = require('express')
const ContactForm = require('../models/contactForm')
const router = new express.Router()

// creates a new contact form submission
router.post('/contactUs', async(req, res) => {
    const contactForm = new ContactForm(req.body)

    try {
        await contactForm.save()
        res.status(201).send(contactForm)
    } catch(e) {
        res.status(400).send(e)
    }
})

module.exports = router