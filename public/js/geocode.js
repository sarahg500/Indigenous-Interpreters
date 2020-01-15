const request = require('request')

const geocode = (address, callback) => {
    // This needs to be personalized more correctly
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json?access_token=pk.eyJ1IjoibWF4bW9sMSIsImEiOiJjazNzZW5xOG4wNmNyM2dtdTVqam50eGQ0In0.8jHlMzeKN7c1PCuiLkqH8Q&limit=1'

    request({ url, json:true }, (error, { body } ) => {
        if (error) {
            callback('Unable to connect to location services!')
        } else if (body.features.length === 0) {
            callback('Unable to find location. Try another search')
        } else {
            callback(undefined, {
                // returns latitude, longitude, location
                latitude: body.features[0].center[1],
                longitude: body.features[0].center[0],
                location: body.features[0].place_name
            })
        }
    })
}

module.exports = geocode