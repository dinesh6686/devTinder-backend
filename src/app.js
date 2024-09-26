const express = require("express");
const app = express();
const PORT = 7777;

app.use(express.json());
app.use('/hello',(req, res) => { 
    res.send('Hi friends!!');
})
// this will match all the HTTP method API calls to /test
app.use('/test', (req, res) => { 
    res.send('Test endpointtt')
})

app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`)
});

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
        const updatedUser = {...user,...req.body}
        users = users.map(u => u.id === parseInt(id)? updatedUser : u)
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