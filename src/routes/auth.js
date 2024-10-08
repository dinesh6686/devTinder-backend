const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { validateSignUpData } = require('../utils/validation');
const User = require('../models/user')

router.post('/signup', async (req, res) => {
    try {
        // NEVER TRUST req.body
        //validation of data
        validateSignUpData(req)

        // encrypt the password -> encrypted hash password using bcrypt library
        const { firstName, lastName, emailId, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        console.log(passwordHash); //$2b$10$QXwW9eNsO7ByWFS1b5WyUOR.PZKennTpzu9fMUeTw2SeWysrI6pFS

        // Creating a new instance of the user model
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
        })

        // Saving the user to the database
        await user.save()
        res.status(201).json(user)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId });
        if (!user) throw new Error('Invalid credentials');

        const isPasswordValid = await user.validatePassword(password)
        if (!isPasswordValid) throw new Error('Invalid credentials');
        else {
            // Create a new JWT token
            const token = await user.getJWT()

            // Add the token to the cookie and send it to the user as response(res.cookie)
            res.cookie('token', token, { expires: new Date(Date.now() + 8 * 3600000) })
            res.status(200).send('Login Successful');
        }
    } catch (error) {
        res.status(400).send(`ERROR: ` + error.message)
    }
})

module.exports = router;