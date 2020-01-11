const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const bodyParser = require('body-parser')
const router = new express.Router()

var urlencodedParser = bodyParser.urlencoded({ extended: false })

// creating a user
router.post('/signup', urlencodedParser, async (req, res)=>{
    //console.log('signup post is used')
    const user = new User(req.body)

    try{
        await user.save()
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
router.get('/users', async (req, res)=>{
    const match = {
        // TODO: this is irrelevant
        isInterpreter: true
    }
    
    // TODO: make sure querystrings in GET request are set up correctly in request firing function
    // TODO: customine search options and make sure this code works correctly
    // TODO: how should the data be sorted upon results showing up?
    if (req.query.language) {
        // parse into data format of language
        match.language = req.query.language
    }
    if (req.query.location) {
        // parse into data format of location
        match.location = req.query.location
    }
    if (req.query.service) {
        // parse into data format of service
        match.service = req.query.service
    }
    if (req.query.rating) {
        // parse into data format of rating
        match.rating = req.query.rating
    }
    if (req.query.certification) {
        // parse into data format of certification
        match.certification = req.query.certification
    }

    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                // query string must contain ?limit=VALUE&skip=VALUE
                // limit controls how many results per page
                // skips control page number 1, 2, 3, etc. To get page number 2 if limit is 10, then skip=10
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip)                
            }
        }).execPopulate()
    
        //gotta let users down more easily when no matches are found
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
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

module.exports = router