const express = require('express');
const router = express.Router();
const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData } = require('../utils/validation')

router.get('/view', userAuth, async (req, res) => {
    try {
        const user = req.user
        res.send(user);
    } catch (error) {
        res.status(400).send(`ERROR: ` + error.message)
    }
})

router.patch('/edit', userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error(`Invalid edit request`);
        }
        const loggedInUser = req.user
        Object.keys(req.body).forEach(key => loggedInUser[key] = req.body[key])
        await loggedInUser.save()
        res.json({
            message: `Profile updated successfully for the user with firstname: ${loggedInUser.firstName}`,
            data: loggedInUser
        })
    } catch (error) {
        res.status(400).send(`ERROR: ` + error.message)
    }
})
module.exports = router;
