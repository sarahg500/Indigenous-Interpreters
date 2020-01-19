const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const bodyParser = require('body-parser')
const { sendWelcomeEmail} = require('../emails/account')
// this might be wrong path
const geocode = require('../../public/js/geocode')
const router = new express.Router()

var urlencodedParser = bodyParser.urlencoded({ extended: false })

// creating a user
router.post('/signup', urlencodedParser, async (req, res)=>{
    //console.log('signup post is used')
    const user = new User(req.body)

    try{
        await user.save()
        // sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch(e){
        res.status(400).send()
    }
})

// getting users by their credentials
router.post('/login', urlencodedParser, async (req, res) =>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        //res.send({ user, token })
        res.render('profile', {
            title: 'Make a Profile'
        })
    } catch (e){
        res.status(400).send()
    }
})

//logout of current session (deletes only current token)
router.post('/logout', auth, async( req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e){
        res.send(500).send()
    }
})

//logout of all sessions (deletes all tokens)
router.post('/users/logoutAll', auth, async( req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.send(500).send()
    }
})

//only allowed to see profile if logged in
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// gets multiple users (this is for the search page), no auth
router.get('/search', async (req, res)=>{    
    res.render('search', {
        title: 'Find Interpreters'
    })

    const match = {
        kind: "Interpreter"
    }

    if (req.query.language) {        
        match.language = req.query.language.trim().toLowerCase()
    }
    if (req.query.certification) {        
        match.certification = req.query.certification.trim().toLowerCase()  
    }
    if (req.query.service) {        
        match.service = req.query.service.trim().toLowerCase()
    }
    if (req.query.rating) {        
        match.rating = req.query.rating        
    }

    let locationPromise = new Promise(function(resolve, reject) {
        if(req.query.location) {
            geocode(req.query.location, (error, { latitude, longitude, location } ) => {            
                // TODO errors need to be done 
                if (error) {
                    return console.log(error)
                }                
                resolve({latitude, longitude})
            })
        } else {            
            // TODO more correct way?
            resolve(0, 0)
        }           
    });

    locationPromise.then(function(value) {       
        if (value.latitude && value.longitude) {
            match.latitude = value.latitude
            match.longitude = value.longitude        
        }
        // fetch user coordinates, distance formula with lat long < x miles returns true
        console.log(match)
    });    

    // TODO: this does not yet work
    /*try{
        await req.user.populate({
            path: 'users',
            match,
            options: {
                // TODO: query string must contain ?limit=VALUE&skip=VALUE
                // limit controls how many results per page
                // skips control page number 1, 2, 3, etc. To get page number 2 if limit is 10, then skip=10
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)                
            }
        }).execPopulate()
    
        // TODO: error
        res.send(req.user)
    } catch(e){
        res.status(500).send()
    }
    */
})

// user can update their own profiles
router.patch('/users/me',  auth, async (req, res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'username', 'password', 'gender']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    try{

        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save() // where middleware gets executed

        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

// upload profile pic
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Please upload an image file'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router