const path = require('path')
const express = require('express')
const hbs = require('hbs')
require('./db/mongoose')
const User = require('./models/user')

const app = express()

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const partialsDirectoryPath = path.join(__dirname, '../templates/partials')
const viewsDirectoryPath = path.join(__dirname, '../templates/views')

// Setup handlebars engine and views locations
app.set('view engine', 'hbs')
app.set('views', viewsDirectoryPath)
hbs.registerPartials(partialsDirectoryPath)

app.use(express.static(publicDirectoryPath))

// Request for home.html
app.get('/home', (req, res) => {
    res.render('home', {
        title: 'Our Charity'
    })
})

// Request for profile.html
app.get('/profile', (req, res) => {
    res.render('profile', {
        title: 'Make a Profile'
    })
})

// Request for contact.html
app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us'
    })
})

// Request for login.html
app.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login'
    })
})

// Resource Creation
app.use(express.json())

app.post('/signup', (req, res) => {
	const user = new User(req.body)
    
    // Make sure mongoose is setup correctly
	user.save().then(() => {
		// some code
	}).catch((e) => {
		res.status(400).send(e)
	})
})

// Webinar page
app.get('/webinar', (req, res) => {
    res.render('webinar', {
        title: 'Webinar'
    })
})

// Find Interpreters Pagee
app.get('/search', (req, res) => {
    res.render('search', {
        title: 'Find Interpreters'
    })
})

// 404 pages
app.get('*', (req, res) => {
    res.render('404', {
        title: '404 Page not found'        
    })
})

app.listen(3000, () => {
    
})

// Note for lab:
// Run npm i express@4.17.1
// Run npm i hbs
