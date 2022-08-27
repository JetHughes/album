const {response, request} = require('express');
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const albums_router = require('./albums_router');
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
const { resolve } = require('dns');

//routes
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/', express.static(path.resolve(__dirname, 'public')));
app.use('/login', express.static(path.resolve(__dirname, 'public/login.html')));
app.use('/register', express.static(path.resolve(__dirname, 'public/register.html')));
app.use('/albums/', albums_router);

//register
app.post('/register', async function(req, res) {
    console.log(`\n\nattempt register: username=${req.body.username} pass=${req.body.password}`)
    let new_user = new User({
      username: req.body.username,
    });
    
    new_user.password_hash = new_user.generateHash(req.body.password)
    const db_info = await User.create(new_user);
    console.log(db_info,"success\n")
    
    res.status(200).redirect("/");
});

//login
app.post('/login', function(req, res) {
    console.log(`\n\nattempt login: username=${req.body.username} pass=${req.body.password}`)
    User.findOne({username: req.body.username}, function(err, user) {
        if(err){
            console.log(err)
        } else {
            console.log(user.username) 
            if (!user.validPassword(req.body.password)) {
                console.log('password invalid!')
                res.redirect('/login')
            } else {
                console.log('success!')
                res.redirect('/')        
            }
        }
    });
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`server is live! http://localhost:${PORT}`);
});