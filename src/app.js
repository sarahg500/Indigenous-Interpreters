const path = require('path')
const express = require('express')
const hbs = require('hbs')
require('./db/mongoose')
const User = require('./models/user')
const ContactForm = require('./models/contactForm')
const iProfile = require('./models/interpreterProfile')
const userRouter = require('./routers/user')
const contactRouter = require('./routers/contactForm')
const iProfileRouter = require('./routers/interpreterProfile')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(contactRouter)
app.use(iProfileRouter)

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')
const partialsDirectoryPath = path.join(__dirname, '../templates/partials')
const viewsDirectoryPath = path.join(__dirname, '../templates/views')

// Setup handlebars engine and views locations
app.set('view engine', 'hbs')
app.set('views', viewsDirectoryPath)
hbs.registerPartials(partialsDirectoryPath)

app.use(express.static(publicDirectoryPath))

// Resource Creation
app.use(express.json())

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

/* app.post('/signup', (req, res) => {
	const user = new User(req.body)
    
    // Make sure mongoose is setup correctly
	user.save().then(() => {
		// some code
	}).catch((e) => {
		res.status(400).send(e)
	})
}) */

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

app.listen(PORT, () => {
    
})

// Note for lab:
// Run npm i express@4.17.1
// Run npm i hbs
