//Needs to run once per day to generate the albums

const mongoose = require("mongoose");
require('dotenv').config();

//database
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

const User = require('../models/user');

User.find({}, async function(err, docs){

    docs.forEach(async function(user) {
        //move the current album to the history
        user.history.push(user.current)

        //generate another album without duplicates
        let next = Math.floor(Math.random() * 13);
        while (user.history.includes(next)) {
            next = Math.floor(Math.random() * 13);
        }

        //logging
        console.log("\n" + user.username + " " + user._id)
        console.log("next: " + next)
        user.history.forEach(item => {
            console.log(item)
        })

        //update the user
        const db_info = await User.updateOne({_id: user._id}, {$set: {current: next, history: user.history}})
        console.log(db_info)
    });
})

