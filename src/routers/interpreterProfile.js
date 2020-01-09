const express = require('express')
const InterpreterProfile = require('../models/interpreterProfile')
const auth = require('../middleware/auth')
const router = new express.Router()

//UPDATE THESE ROUTES

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

module.exports = router