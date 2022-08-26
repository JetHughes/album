const express = require('express'); // import express
const router = express.Router(); // create a router
const albums = require('./album_data.json');

/* we will code each individual route handler here */
router.get('/', (request, response) => {
    response.send(albums);
})

module.exports = router;