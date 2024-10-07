const express = require("express");
const connectDB = require("./config/database")
const app = express();
const PORT = 7777;
const User = require("./models/user");
const { validateSignUpData } = require('./utils/validation');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { adminAuth, userAuth } = require('./middlewares/auth');

app.use(express.json());
app.use(cookieParser())

//POST request to create data in db
app.post('/signup', async (req, res) => {
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
//login API
app.post('/login', async (req, res) => {
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

app.get('/profile', userAuth, async (req, res) => {
    try {
        const user = req.user
        res.send(user);
    } catch (error) {
        res.status(400).send(`ERROR: ` + error.message)
    }
})

app.post('/sendConnectionRequest', userAuth, async (req, res) => {
    const user = req.user
    console.log('Sending connection request');

    res.send(`${user.firstName} sent the Connection request!`)
})

// ------------------------------------------------------------------------------------------------
//GET /feed - get all users from the database
app.get('/feed', userAuth, async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})
//GET user by emailId
app.get('/user/:emailId', userAuth, async (req, res) => {
    try {
        const user = await User.findOne({ emailId: req.params.emailId })
        if (!user) return res.status(404).send('User not found')
        res.json(user)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})
//DELETE /users
app.delete('/users/:_id', async (req, res) => {
    try {
        const userId = req.params._id
        const user = await User.findByIdAndDelete(userId);
        // const user = await User.findByIdAndDelete({_id: userId});
        if (!user) return res.status(404).send('User not found')
        res.send(`User with id: ${user._id} got deleted successfully`)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})
//UPDATE user
app.patch('/users/:_id', async (req, res) => {
    const userId = req.params._id
    const emailId = req.params.emailId
    const data = req.body


    try {
        const ALLOWED_UPDATES = [
            "photoURL",
            "about",
            "gender",
            "age",
            "skills"
        ]
        const isUpdateAllowed = Object.keys(data).forEach(k => ALLOWED_UPDATES.includes(k))
        if (!isUpdateAllowed) {
            throw new Error(`Update not allowed`)
        }
        const user = await User.findByIdAndUpdate(userId, data, {
            returnDocument: "after",
            runValidators: true
        });
        // const user = await User.findOneAndUpdate({emailId: emailId}, data, { returnDocument: "after" });        
        if (!user) return res.status(404).send('User not found')
        res.send(`user with id: ${user._id} updated`)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// DB connection should be established first after that start your server => which will be app.listen()
connectDB()
    .then(() => {
        console.log('DB connection established...');
        // here you should do app.listen
        app.listen(PORT, () => {
            console.log(`Server up and running on port ${PORT}`)
        });
    })
    .catch((err) => {
        console.error('DB connection error:', err.message)
    })

// --------------------------------------------------------------------------------------------------------------------
app.use('/hello', (req, res) => {
    res.send('Hi friends!!');
})
// this will match all the HTTP method API calls to /test
app.use('/test', (req, res) => {
    res.send('Test endpointtt')
})

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// order matters!
// app.use('/users', (req, res) => {
//     res.send('HAHAHAHAHA!');
// });
let users = [{
    id: 1,
    name: "Dinesh",
    age: 28
},
{
    id: 2,
    name: "Deepak",
    age: 25
}]

app.post('/users', (req, res) => {
    const user = req.body
    user.id = users.length + 1
    users = [...users, user]
    res.send(`User ${user.name} added to the db`)
})

app.put('/users/:id', (req, res) => {
    const id = req.params.id
    const user = users.find(user => user.id === parseInt(id))
    if (user) {
        const updatedUser = { ...user, ...req.body }
        users = users.map(u => u.id === parseInt(id) ? updatedUser : u)
        res.send(`User ${updatedUser.name} updated in the db`)
    }
    else {
        res.status(404).send('User not found')
    }
})

app.delete('/users/:id', (req, res) => {
    const id = req.params.id
    const index = users.findIndex(user => user.id === parseInt(id))
    if (index) {
        users = users.filter(user => user.id !== parseInt(id))
        res.send(`User with id ${id} deleted from the db`)
    }
    else {
        res.status(404).send('User not found')
    }
})

app.get('/users/:id?', (req, res) => {
    const id = req.params.id
    if (id) {
        const user = users.find(user => user.id === parseInt(id))
        if (user) res.send(user)
        else res.status(404).send('User not found')
    } else {
        res.send(users)
    }
    res.send()
})

app.get('/ab*cd', (req, res) => {
    res.send('Hello from ab?c')
})

// routing order matters
// http methods: CRUD operations -> GET, POST, DELETE, PUT, PATCH


// Advance routing patterns
// ab?c  -> ac or abc -> b is optional
// a(bc)?d -> ad or abcd -> bc is optional
// ab+c -> abc or abbbbbbbbc   -> a(as many b s as you like)c
// a(bc)+d -> abcd or abcbcbcbcd -> a(as many bc s as you like)d
// ab*cd -> abjkhvhkljcd    -> starts with ab and ends with cd

// users?id=123 -> id = req.query.id -> query parameters
// users?id=123&name=Dinesh -> id = req.query.id, name = req.query.name -> query parameters

// Dynamic routes(:)
//   /users/:id -> id = req.params.id -> path parameters
//   /users/:id/:name/:password -> id = req.params.id, name = req.params.name, password = req.params.password -> path parameters
//   /users/:id? -> optional path parameters


// regex routing patterns
// /a/ -> if a leter is there in the path, /gfgfgfgdfga -> this will work
// /.*fly$/ ->if endpoint starts with anything but ending with fly

app.get(/.*fly$/, (req, res) => {
    res.send('Hello from regex')
})

// One route can also have multiple route handlers(callback fn)
// next() and errors if we send headers to res multiple times
// app.use('/route', rH1, [rH2, rH3], rH4, rH5)
// this will work for any HTTP methods like app.get, post, put, patch, delete similar to app.use
app.get('/users123', (req, res, next) => {
    console.log('In 1st route handler');
    // res.send('1st response:: Get all users')   
    next()
}, (req, res, next) => {
    // it wont go here until you use next() which is passed as the 3rd argument in the prev route handler(cb function)
    console.log('In 2nd route handler');
    // res.send('2nd response!')
    next()
}, (req, res, next) => {
    console.log('In 3rd route handler');
    // res.send('3rd response!')
    next()
}, (req, res, next) => {
    console.log('In 4th route handler');
    // res.send('4th response!')
    next()
}, (req, res, next) => {
    console.log('In 5th route handler');
    res.send('5th response!')
})

// Independent route handler
app.use('/route', (req, res, next) => {
    console.log('1st rHandler');
    next()
})
app.use('/route', (req, res, next) => {
    console.log('2nd rHandler');
    res.send('from 2nd rHandler');
})


// handling middlewares
// What is a Middleware? Why do we need it?
//  - How express JS basically handles requests behind the scenes
//  - Difference app.use and app.all
//  - Write a dummy auth middleware for admin
//  - Write a dummy auth middleware for all user routes, except /user/login
// const { adminAuth, userAuth } = require('./middlewares/auth');
app.use('/admin', adminAuth);

app.post('/user/login', (req, res) => {
    res.send('User logged in successfully');
})

app.get('/user/data', userAuth, (req, res) => {
    res.send('User data fetched successfully');
})

app.get("/admin/getAllData", (req, res) => {
    res.send("All Data Sent");
});
app.get("/admin/deleteUser", (req, res) => {
    res.send("Deleted a user");
});

// - Error Handling using app.use("/", (err, req, res, next) = {});
app.use("/", (err, req, res, next) => {
    if (err) {
        // Log your error
        res.status(500).send("something went wrong");
    }
});

app.get("/getUserData", (err, req, res, next) => {
    try {
        // Logic of DB call and get user data
        if (err) throw new Error("dvbzhjf");
        res.send("User Data Sent");
    } catch (err) {
        res.status(500).send("Some Error contact support team");
    }
});
