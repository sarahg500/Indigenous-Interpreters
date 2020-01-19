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
        // interpreter coordinates are generated from location string
        await iProfile.generateCoordinates(req).then( async () => {
            await iProfile.save().then( () =>
                res.status(201).send(iProfile)
            )
        })
    } catch(e){
        console.log(e)
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
// test this part
const upload = multer({
    limits: {
        fileSize: 100000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx|pdf)$/)) {
            return cb(new Error('Please upload a doc, docx, or pdf file'))
        }

        cb(undefined, true)
    }
})

// TODO: make the files either pdf or doc/docx or both
router.post('/users/me/certificates', auth, upload.single('certificate'), async (req, res) => {
    const newCertificate = { 
        certificate: req.body.certificates.certificate, 
        file: req.file.buffer }
    req.user.certificates = req.user.certificates.concat(newCertificate)
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// TODO: delete only one certificate
router.delete('/users/me/certificates', auth, async (req, res) => {
    try {
        // deletes all for now
        req.user.certificates = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.send(500).send()
    }
})

// TODO: fix the context type thing
router.get('/users/:id/certificates', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || user.certificates.length === 0 ){
            throw new Error()
        }

        // res.set('Content-Type', 'application/pdf')
        res.send(user.certificates)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router