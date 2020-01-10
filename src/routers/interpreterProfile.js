const express = require('express')
const multer = require('multer')
const InterpreterProfile = require('../models/interpreterProfile')
const auth = require('../middleware/auth')
const router = new express.Router()

// UPDATE THESE ROUTES

// creating a profile
// idk on what screen this will live
router.post('/iProfile', async (req, res)=>{
    const iProfile = new InterpreterProfile ({
        ...req.body
    })

    try{
        await iProfile.save()
        res.status(201).send(iProfile)
    } catch(e){
        res.status(400).send(e)
    }
})

// interpreters can update their own profiles
router.patch('/iProfile/me',  auth, async (req, res) =>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['location', 'iLangFluency', 'eLangFluency', 'certification']
    const isValidOperation = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({ error: 'Invalid updates!'})
    }

    try{
        // from being logged in
        const profile = await InterpreterProfile.findOne({owner: req.user._id})

        updates.forEach((update) => profile[update] = req.body[update])

        await profile.save() // where middleware gets executed

        if (!profile){
            return res.status(404).send()
        }

        res.send(profile)
    }catch(e){
        res.status(400).send(e)
    }
})

// upload certification
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx|pdf)$/)) {
            return cb(new Error('Please upload a doc, docx, or pdf file'))
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