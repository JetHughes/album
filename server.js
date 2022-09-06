const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

//database
const mongoose = require("mongoose");
const User = require('./models/user');
const user = process.env.ATLAS_USER;
const password = process.env.ATLAS_PASSWORD;
const db_url = `mongodb+srv://${user}:${password}@album.7wjpoha.mongodb.net/?retryWrites=true&w=majority`
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
mongoose.connect(db_url, options).then(() => {
    console.log('Successfully connected!')
}).catch((e) => {
    console.error(e, 'Could not connect!')
});

// create express 'application'
const app = express();
app.use(express.static(path.join(__dirname, '/public/')));

//middle ware
app.use(express.urlencoded({extended: false}))
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: process.env.SESSION_SECRET
}));

// setup pug as a view engine (SSR engine)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//routers
const album_router = require('./routers/albums_router');
app.use('/album/', album_router);
const user_router = require('./routers/user_router');
app.use('/user/', user_router);

// default route
app.get('/', function(req, res){ 
    if(req.session.user){
        console.log("already logged in as " + req.session.user.username)
        res.render('user', {user: req.session.user})
    } else{
        res.render('landing')
    }
});

app.get('/login', function(req, res){
    if(req.query.failed)
        res.render('login', {failed: true})
    else 
        res.render('login')
})
app.get('/register', function(req, res){
    if(req.query.taken)
        res.render('register', {taken: true})
    else 
        res.render('register')
})

//register
app.post('/submit_register', async function(req, res) {
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
                        res.redirect(`user/${user.username}`)
                    });
                } else {
                    res.redirect('login?failed=true')
                }
            });
        }
    });
});

//login
app.post('/submit_login', function(req, res) {
    console.log(`\n\nAttempt login: username=${req.body.username} pass=${req.body.password}`)
    User.authenticate(req.body.username, req.body.password, function(err, user){
        if(err) {
            console.log("authenticate error: " + err)
        }
        if(user){
            req.session.regenerate(function(){
                console.log("authenticate" + user.username)
                req.session.user = user; //maybe only store an id?
                res.redirect(`user/${user.username}`)
            });
        } else {
            res.redirect('login?failed=true')
        }
    })
});

//logout
app.get('/logout', function(req, res){
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function(){
        res.redirect('/');
    });
});

//404
app.get('*', (req, res) => {
    res.status(404)
    res.render('404');
});

// start the server
// module.exports = app;
const PORT = 8000
app.listen(8000, () => {
    console.log(`Server is live: http://localhost:${PORT}`);
});