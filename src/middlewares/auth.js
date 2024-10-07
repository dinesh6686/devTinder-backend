const jwt = require('jsonwebtoken');
const User = require('../models/user');
// sample Authentication middleware
const adminAuth = (req, res, next) => {
    console.log("Admin auth is getting checked!!");
    const token = "xyz";
    const isAdminAuthorized = token === "xyz";
    if (!isAdminAuthorized) {
        res.status(401).send("Unauthorized request");
    } else {
        next();
    }
};

const userAuth = async (req, res, next) => {
    try {
        // Read token from req cookies
        const cookies = req.cookies
        // validate the token
        const { token } = cookies
        if(!token) throw new Error('token is not valid')
        const decodedObj = jwt.verify(token, "yoURsecretKEY")
        const { _id } = decodedObj
        // find the user
        const user = await User.findById(_id)
        if (!user) throw new Error(`User not found`)
        req.user = user
        next();
    } catch (error) {
        res.status(400).send('ERROR: '+ error.message)
    }
};
module.exports = {
    adminAuth,
    userAuth,
};