const express = require('express');
var session = require('express-session');
const path = require('path');
require('dotenv').config();

// Database
const mongoose = require("mongoose");
const user = process.env.ATLAS_USER;
const password = process.env.ATLAS_PASSWORD;
const db_url = `mongodb+srv://${user}:${password}@album.7wjpoha.mongodb.net/?retryWrites=true&w=majority`
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
mongoose.connect(db_url, options).then(() => {
    console.log('successfully connected!')
}).catch((e) => {
    console.error(e, 'could not connect!')
});

const User = require('./models/user');

// create express 'application'
const app = express();

//routers
const album_router = require('./routers/albums_router');
app.use('/album/', album_router);

// setup pug as a view engine (SSR engine)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//middle ware
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, '/public/')));
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: process.env.SESSION_SECRET
}));

// default route
app.get('/', function(req, res){    
    res.render('login')
});

//pages
app.get('/user/:username', restrict, function(req, res){
    User.findOne({username: req.params.username}, function(err, user) {
        if(user){
            res.render('user', {user: user})
        } else {
            res.redirect('../404')
        }
    });
})
app.get('/login', function(req, res){
    res.render('login')
})
app.get('/register', function(req, res){
    res.render('register')
})

//register
app.post('/submit_register', async function(req, res) {
    console.log(`\n\nattempt register: username=${req.body.username} pass=${req.body.password}`)

    User.findOne({username: req.body.username}, async function(err, user){
        if(err){
            console.log(err,"err")
            return res.redirect('register')
        }

        if(user){
            console.log('Username taken');
            return res.redirect('register')
        }

        let new_user = new User({
          username: req.body.username,
          history: [1,7,4],
          current: 3
        });
        
        new_user.password_hash = new_user.generateHash(req.body.password)
        const db_info = await User.create(new_user);
        console.log(db_info,"success\n")
        res.redirect(`user/${new_user.username}`)
    })
});

//authorisation middleware
function restrict(req, res, next) {
    if(req.params.username){
        if(req.session.user){
            console.log("attempt authorising " + req.session.user.username + " to " + req.params.username)
            if (req.session.user.username === req.params.username) {
                console.log("success!")
                return next();
            }
        }
        req.session.error = 'Access denied!';
        console.log("acces denied")
        return res.redirect('/login');
    }
    return next()
}

//authenticate
function authenticate(username, password, next){
    User.findOne({username: username}, function(err, user) {
        if(err){
            console.log("failed to authenticate " + username)
            return next(err, null)
        }
        if(user){
            if (user.validPassword(password)){
                console.log("authenticated " + username)
                return next(null, user)
            }
        }
        return next(null, null)
    });
}

//login
app.post('/submit_login', function(req, res) {
    console.log(`\n\nattempt login: username=${req.body.username} pass=${req.body.password}`)
    authenticate(req.body.username, req.body.password, function(err, user){
        if(err) return next(err)
        if(user){
            req.session.regenerate(function(){
                req.session.user = user; //maybe only store an id?
                res.redirect(`user/${user.username}`)
            });
        } else {
            res.redirect('login')
        }
    })
});

//logout
app.get('/logout', function(req, res){
    // destroy the user's session to log them out
    // will be re-created next request
    req.session.destroy(function(){
        res.redirect('login');
    });
});

//404
app.get('*', (req, res) => {
    res.status(404)
    res.render('404');
});

// start the server
const PORT = 8080
app.listen(8080, () => {
    console.log(`Server is live: http://localhost:${PORT}`);
});