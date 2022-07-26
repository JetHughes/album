const express = require('express');
const session = require('express-session');
const https = require('https');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

//database
const mongoose = require("mongoose");
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
app.use(express.static(path.join(__dirname, './public/')));

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
const user_router = require('./routers/user_router');
const api_router = require('./routers/api_router');
app.use('/user/', user_router);
app.use('/api/', api_router);

// main routes
app.get('/', function(req, res){ 
    if(req.session.user){
        console.log("already logged in as " + req.session.user.username)
        res.redirect(`user/${req.session.user.username}`);
    } else{
        res.render('index')
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
app.get('/logout', function(req, res){
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
//const PORT = 8000
//app.listen(8000, () => {
//    console.log(`Server is live: http://localhost:${PORT}`);
//});
const ssl = {
        key: fs.readFileSync('/etc/letsencrypt/live/www.albumgenerator.tech/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/www.albumgenerator.tech/fullchain.pem'),
        ca: fs.readFileSync('/etc/letsencrypt/live/www.albumgenerator.tech/chain.pem'),
}

//app.listen(8000, () => console.log("app running on port 8000"));
https.createServer(ssl, app).listen(8080, () => {console.log(`server is live ${process.env.PORT || 8080}`)});
