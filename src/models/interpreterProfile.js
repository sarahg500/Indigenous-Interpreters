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
interpreterSchema.methods.generateCoordinates = async function(req) {
    //console.log(req.body)
    //console.log(this)
    /* const interpreter = this
    const coors = await geocode(req.query.location, (error, { latitude, longitude, location } ) => {
        if (error) {
            return console.log(error)
        }

        return [latitude, longitude]
    })

    console.log(coors)

    interpreter.location.coodinates.latitude = coors[0]
    interpreter.location.coodinates.longitude = coor[1]
    await interpreter.save()

    return coordinates */
    var long  = 3;
    var lat = null;

    let locationPromise = new Promise(function(resolve, reject) {
        if(req.body.location.locationString) {
            geocode(req.body.location.locationString, (error, { latitude, longitude, location } ) => {            
                // errors need to be done 
                if (error) {
                    return console.log(error)
                }
                console.log(latitude, longitude)         
                resolve({latitude, longitude})
            })
        } else {            
            // more correct way?
            resolve(0, 0)
        }           
    });

    locationPromise.then( (value) => {       
        if (value.latitude && value.longitude) {
            //console.log(value.latitude, value.longitude)
            this.location.coordinates.latitude = value.longitude
            this.location.coordinates.longitude = value.latitude
            //long = value.longitude
            //lat = value.latitude
            //console.log(long, lat)
            console.log(this)
            //await this.save()
        }
    }); 

}

module.exports = User.discriminator('Interpreter', interpreterSchema)