const express = require('express');
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
const { callbackify } = require('util');

// setup pug as a view engine (SSR engine)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, '/public/')));
app.use('/album/', album_router);


// default route
app.get('/', function(req, res){
    res.render('login')
});

//user homepage
app.get('/user/:username', function(req, res){
    User.findOne({username: req.params.username}, function(err, user) {
        if(user){
            res.render('user', {user: user})
        } else {
            res.redirect('../404')
        }
    });
})

//login and register
app.get('/login', function(req, res){
    res.render('login')
})
app.get('/register', function(req, res){
    res.render('register')
})

//register
app.post('/submit_register', async function(req, res) {
    console.log(`\n\nattempt register: username=${req.body.username} pass=${req.body.password}`)

    User.findOne({username: req.body.username}, function(err, user){
        if(err){
            console.log(err,"err")
        }

        if(user){
            console.log('Username taken');
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


//login
app.post('/submit_login', function(req, res) {
    console.log(`\n\nattempt login: username=${req.body.username} pass=${req.body.password}`)
    User.findOne({username: req.body.username}, function(err, user) {
        if(err){
            console.log(err)
            res.render('login')
        } else {
            console.log("try validation")
            if (!user.validPassword("hello")) {
                console.log('password invalid!')
                res.render('login')
            } else {
                console.log('success!')
                res.redirect(`user/${user.username}`)
            }
        }
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