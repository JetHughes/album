const {response, request} = require('express');
const express = require('express');
const path = require('path');


const app = express();

app.get('/', (request, response) => {
    const filePath = path.resolve(__dirname, 'public/index.html')
    response.sendFile(filePath);
});

app.get('/style.css', (request, response) => {
    const filePath = path.resolve(__dirname, 'public/style.css')
    response.sendFile(filePath);
})


const PORT = 8080;
app.listen(PORT, () => {
    console.log(`server is live! http://localhost:${PORT}`);
});