const {response, request} = require('express');
const express = require('express');
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

const User = require('./models/user')

//routes
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/', express.static(path.resolve(__dirname, 'public')));
app.use('/login', express.static(path.resolve(__dirname, 'public/login.html')));
app.use('/albums/', albums_router);

//register
app.post('/register', function(req, res) {
    var new_user = new User({
      username: req.username,
    });
  
    new_user.password = new_user.generateHash(userInfo.password);
    new_user.save();
});

//login
app.post('/login', function(req, res) {
    User.findOne({username: req.body.username}, function(err, user) {
  
      if (!user.validPassword(req.body.password)) {
        //password did not match
      } else {
        // password matched. proceed forward
      }
    });
  });

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`server is live! http://localhost:${PORT}`);
});