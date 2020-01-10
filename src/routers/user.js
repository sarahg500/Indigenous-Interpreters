const express = require('express')
const multer = require('multer')
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

// gets multiple users (this is for the search page)
// no auth
router.get('/users', async (req, res)=>{
    try{

        //change this to use different search criteria
        const users = await User.find({ isInterpreter: true})

        //gotta let users down more easily when no matches are found

        res.send(users)
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
    req.user.avatar = req.file.buffer
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