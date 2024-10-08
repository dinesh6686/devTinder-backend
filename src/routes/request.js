const express = require('express');
const router = express.Router()
const { userAuth } = require('../middlewares/auth');

router.post('/sendConnectionRequest', userAuth, async (req, res) => {
    const user = req.user
    console.log('Sending connection request');

    res.send(`${user.firstName} sent the Connection request!`)
})

module.exports = router;