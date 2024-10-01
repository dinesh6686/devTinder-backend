const mongoose = require('mongoose')
const connectDB = async () => {
    await mongoose.connect('mongodb+srv://dinesh6686:uZpCAMDiZJFQbZwP@myclusterdinesh.4figb.mongodb.net/devTinder')
}

module.exports = connectDB; // for other files to use this connection
