const mongoose = require('mongoose')
const validator = require('validator')
const User = require('./user')
const geocode = require('../../public/js/geocode')

// returns a model with overlapping schema with the user
const interpreterSchema = new mongoose.Schema({
        // location
        location: {
            locationString: {
                type: String,
                trim: true,
                required: true,
            },
            coordinates: {
                latitude: {
                    type: Number,
                    //required: true
                },
                longitude: {
                    type: Number,
                    //required: true
                }
                // call method to parse location to latitude and longitude ..?                
            }            
        },
        // indigenous language fluency
        iLangFluencies: [{
            iLangFluency: {
                type: String,
                required: true,
            },
            fluency:{
                type: Number,
                required: true,
                trim: true,
                min: 1,
                max: 5
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
    }
)

// generates the coordinates
// have to return a promise in order for await keyword to work
interpreterSchema.methods.generateCoordinates = async function(req) {

    let locationPromise = new Promise(function(resolve, reject) {
        if(req.body.location.locationString) {
            geocode(req.body.location.locationString, (error, { latitude, longitude, location } ) => {            
                // errors need to be done 
                if (error) {
                    return console.log(error)
                }         
                resolve({latitude, longitude})
            })
        } else {            
            // more correct way?
            resolve(0, 0)
        }           
    });

    // need to use arrow functionin order to use the this keyword
    locationPromise.then( (value) => {       
        if (value.latitude && value.longitude) {
            this.location.coordinates.latitude = value.longitude
            this.location.coordinates.longitude = value.latitude
        }
    }); 

    return locationPromise
}

module.exports = User.discriminator('Interpreter', interpreterSchema)