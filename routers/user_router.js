const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Album = require('../models/album')
const authorise = require('../auth')

router.get('/', (req, res) => {
    res.redirect('/')
})

router.get('/:username', authorise, async function(req, res){
    User.findOne({username: req.params.username}, async function(err, user) {

        if(user.gen_day != 5){
            console.log("update album")
            const new_curr = user.genAlbum()
            const new_gen_day = new Date().getDate()
            const new_history = user.history
            new_history.push(user.current)
            console.log("new hist: " + new_history)
            User.updateOne({username: user.username}, {$set:{
                current: new_curr, 
                history: new_history, 
                gen_day: 5
            }}, function(err, docs){
                if(err) {
                    console.log(err)
                } else {
                    console.log("updated"+docs)
                }
            })            
        }

        const albums = await Album.find({})
        if(user){
            let info = {
                current: albums[user.current],
                history: user.history.map(num => albums[num])
            }
            res.render('user', {user: info})
        } else {
            res.redirect('../404')
        }
    });
})

module.exports = router;