const mongoose = require('mongoose')

// Not sure if this is set up correctly...
mongoose.connect('mongodb://127.0.0.1:27017/indigenous-interpreters', {
    useNewUrlParser: true,
    useCreateIndex: true
})