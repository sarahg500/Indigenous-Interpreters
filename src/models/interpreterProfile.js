const mongoose = require('mongoose')
const validator = require('validator')
const User = require('./user')

// returns a model with overlapping schema with the user
const interpreter = User.discriminator('Interpreter', 
    new mongoose.Schema({
        // location
        location: {
            type: String,
            trim: true,
            required: true,
            coordinates: {
                type: Number,
                required: true
                // call method to parse location to latitude and longitude ..?                
            }            
        },
        // indigenous language fluency
        iLangFluencies: [{
            iLangFluency: {
                type: String,
                trim: true,
                lowercase: true,
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
                trim: true,
                lowercase: true,
                required: true,
                file: {
                    type: Buffer,
                    required: true
                },
                isValidated: {
                    type: Boolean,
                    default: false
                }
            }
        }],
        // type of interpreting: simultaneous, etc
        service: {
            type: String,
            trim: true,
            lowercase: true
        },
        // rating
        rating: {
            type: Number,
            min: 1,
            max: 5
        }
    })
)

// generates the coordinates
interpreter.methods.generateCoordinates = async function() {
    const interpreter = this
    const coors = geocode(req.query.location, (error, { latitude, longitude, location } ) => {
        if (error) {
            return console.log(error)
        }
        return {latitude, longitude}
    })

    interpreter.location.coodinates = interpreter.location.coodinates.concat({ coors })
    await interpreter.save()

    return coordinates
}

module.exports = interpreter