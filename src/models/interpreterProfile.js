const mongoose = require('mongoose')
const validator = require('validator')
const User = require('./user')

//returns a model with overlapping schema with the user
const interpreter = User.discriminator('Interpreter', 
    new mongoose.Schema({
        location: {
            type: String,
            trim: true,
            required: true
        },
        // indigenous language fluency
        iLangFluencies: [{
            iLangFluency: {
                type: String,
                required: true,
                fluency:{
                    type: Number,
                    required: true,
                    trim: true,
                    min: 1,
                    max: 5
                },
            }
        }],
        // english language fluency
        englishFluency: {
            type: Number,
            trim: true,
            required: true,
            min: 1,
            max: 5
        },
        // certification
        certifications: [{
            certification: {
                type: String,
                required: true,
                file: {
                    type: String,
                    required: true
                },
                isValidated: {
                    type: Boolean,
                    default: false
                }
            }
        }]
    })
)

module.exports = interpreter