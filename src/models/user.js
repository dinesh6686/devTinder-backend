const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min:18
    },
    gender: {
        type: String,
        validate(value) {
            if (!['male', 'female', 'others'].includes(value)) {
                throw new Error('Invalid Gender data')
            }
        }
    },
    photoUrl: {
        type: String,
    },
    about: {
        type: String,
        default: 'This is a default info about the user',
    },
    skills: {
        type: [String],
    }
}, {
    timestamps: true
})

const user = mongoose.model('User', userSchema);

module.exports = user;