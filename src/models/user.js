const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    }, password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8
        //add validation
    }, username: {
        type: String,
        trim: true
    }, gender: {
        type: String,
        trim: true
    },  isAdmin: {
        type: Boolean,
        required: true
    }, 
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    discriminatorKey: 'kind'
})

// checks that the user exists in database
userSchema.statics.findByCredentials = async(email, password) =>{
    const user = await User.findOne({ email })

    if (!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }

    return user
}

// generates the auth token
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({_id: user.id.toString() }, 'thisismynewcourse')

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

// doesn't print password or tokens
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

// has the plain text pw before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User