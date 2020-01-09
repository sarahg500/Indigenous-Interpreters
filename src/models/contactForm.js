const mongoose = require('mongoose')
const validator = require('validator')

const contactForm = mongoose.model('ContactForm', {
    name:{
        type: String,
        trim: true,
        required: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    reasonForContact:{
        type: String,
        required: true,
        maxlength: 500
    }
})

module.exports = contactForm