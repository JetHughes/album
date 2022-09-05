const express = require('express');
var session = require('express-session');
const path = require('path');
require('dotenv').config();

//database
const mongoose = require("mongoose");
const User = require('./models/user');
const Album = require('./models/album');
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

//routers
const album_router = require('./routers/albums_router');
app.use('/album/', album_router);

// setup pug as a view engine (SSR engine)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//middle ware
app.use(express.urlencoded({extended: false}))
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: process.env.SESSION_SECRET
}));

// default route
app.get('/', function(req, res){ 
    if(req.session.user){
        console.log("already logged in as " + req.session.user.username)
        res.render('user', {user: req.session.user})
    } else{
        res.render('landing')
    }
});

//pages
app.get('/user/:username', restrict, function(req, res){
    User.findOne({username: req.params.username}, async function(err, user) {
        const albums = await Album.find({})
        user.history = user.history.map(num => albums[num])
        if(user){
            res.render('user', {user: user})
        } else {
            res.redirect('../404')
        }
    });
})
app.get('/landing', function(req, res){
    res.render('landing')
})
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

//authorisation middleware
function restrict(req, res, next) {
    if(req.params.username){
        if(req.session.user){
            console.log("Attempt to authorise " + req.session.user.username + " to " + req.params.username)
            if (req.session.user.username === req.params.username) {
                console.log("success!")
                return next();
            }
        }
        req.session.error = 'Access denied!';
        console.log("Access denied!")
        return res.redirect('/login');
    }
    return next()
}

//authenticate
function authenticate(username, password, next){
    User.findOne({username: username}, function(err, user) {
        if(err){
            console.log("Failed to Authenticate " + username)
            return next(err, null)
        }
        if(user){
            if (user.validPassword(password)){
                console.log("Authenticated " + username)
                return next(null, user)
            }
        }
        return next(null, null)
    });
}

//register
app.post('/submit_register', async function(req, res) {
    console.log(`\n\nAttempt register: username=${req.body.username} pass=${req.body.password}`)

    //check if there is already a user with this name
    User.findOne({username: req.body.username}, async function(err, user){
        if(err){
            console.log(err)
            res.redirect('register');
        } else if(user){
            console.log('Username Taken');
            res.redirect('register?taken=true');
        } else {   
            //create new user
            let new_user = new User({
            username: req.body.username,
            history: [1,7,4],
            current: 3
            });
            
            //hash password
            new_user.password_hash = new_user.generateHash(req.body.password)
            const db_info = await User.create(new_user);
            console.log(db_info,"success\n")        

            //login
            authenticate(new_user.username, req.body.password, function(err, user){
                if(err) return next(err)
                if(user){
                    req.session.regenerate(function(){
                        req.session.user = user; //maybe only store an id?
                        res.redirect(`user/${user.username}`)
                    });
                } else {
                    res.redirect('login?failed=true')
                }
            })
        }
    })
});

//login
app.post('/submit_login', function(req, res) {
    console.log(`\n\nAttempt login: username=${req.body.username} pass=${req.body.password}`)
    authenticate(req.body.username, req.body.password, function(err, user){
        if(err) return next(err)
        if(user){
            req.session.regenerate(function(){
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