const express = require("express");
const app = express();
const PORT = 7777;

app.use(express.json());
app.use('/hello',(req, res) => { 
    res.send('Hi friends!!');
})
app.use('/test', (req, res) => { 
    res.send('Test endpointtt')
})

app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`)
});

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
