const express = require('express');
const router = express.Router();
const User = require('../models/user');

//register
router.post('/submit_register', async function(req, res) {
    console.log(`\n\nAttempt register: username=${req.body.username} pass=${req.body.password}`)

    User.new(req.body.username, req.body.password, function(err, user){   
        if(err){
            console.log(err)
            res.redirect('register?taken=true')
        } else if (user) {
            //login            
            User.authenticate(user.username, req.body.password, function(err, user){
                if(err) {
                    console.log("authenticate error: " + err)
                }
                if(user){
                    req.session.regenerate(function(){
                        req.session.user = user; //maybe only store an id?
                        res.redirect(`/user/${user.username}`)
                    });
                } else {
                    res.redirect('login?failed=true')
                }
            });
        }
    });
});

//login
router.post('/submit_login', function(req, res) {
    console.log(`\n\nAttempt login: username=${req.body.username} pass=${req.body.password}`)
    User.authenticate(req.body.username, req.body.password, function(err, user){
        if(err) {
            console.log("authenticate error: " + err)
        }
        if(user){
            req.session.regenerate(function(){
                console.log("authenticate" + user.username)
                req.session.user = user; //maybe only store an id?
                res.redirect(`/user/${user.username}`)
            });
        } else {
            res.redirect('login?failed=true')
        }
    })
});

router.post('*', function(req, res) {
    res.status(404).send("404")
})

module.exports = router;