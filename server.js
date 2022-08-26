const {response, request} = require('express');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const albums_router = require('./albums_router');

app.use(bodyParser.urlencoded({ extended: false }))
app.use('/', express.static(path.resolve(__dirname, 'public')));
app.use('/albums/', albums_router);

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`server is live! http://localhost:${PORT}`);
});