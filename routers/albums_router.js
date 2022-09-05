const express = require('express');
const router = express.Router();
const albums = require('../album_data.json');
const User = require('../models/user');

router.get('/', (req, res) => {
    res.send(albums);
})

router.get('/search', (req, res) => {
    const searchTerm = req.query.searchTerm.toLowerCase();
    if(searchTerm.length === 0) res.send(albums)
    const results = []
    albums.forEach(album => {
        if(album.name.toLowerCase().includes(searchTerm) || album.artist.toLowerCase().includes(searchTerm) || album.year.toLowerCase().includes(searchTerm)){
            results.push(album)
        }
    })
    if(results.length > 0){
        res.status(200).send(results)
    }
})

router.get('/all/:user', (req, res) => {
    User.findOne({username: req.params.user}, (err, user) =>{
        if(err){
            console.log(err + "err")
        } else if(user){
            results = []
            user.history.forEach(albums => {
                results.push(albums[album])
            })
            res.send(results)
        }
        res.status(404).send("not a valid user")
    })
})

router.get('/next/:user', (req, res) => {
    User.findOne({username: req.params.user}, (err, user) =>{
        if(err){
            console.log(err + "err")
        }
        if(user){
            res.status(200).send(user.genAlbum() + " current")
        }
        res.status(404).send("not a valid user")
    })
})

module.exports = router;