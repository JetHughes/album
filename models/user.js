const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
// create a schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password_hash: { type: String, reqired: false },
    current: { type: Number, required: false },
    history: {type: Array, required: false},
    gen_day: {type: Number,required: false}
})

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    console.log(`authenticating user: ${this.username} using pword: ${password}`)
    return bcrypt.compareSync(password, this.password_hash);
};

userSchema.methods.genAlbum = function(){
    let newAlbum;
    do {
        newAlbum = Math.floor(Math.random() * 13);
    } while (this.history.includes(newAlbum))    
    console.log(`Generated album: ${newAlbum} which is not in ${this.history}`);
    
    const new_gen_day = new Date().getDate()
    const new_history = this.history
    new_history.push(this.current)
    User.updateOne({username: this.username}, {$set:{
        current: newAlbum, 
        history: new_history, 
        gen_day: new_gen_day
    }}, function(err, docs){
        if(err) {
            console.log(err)
        } else {
            console.log("updated"+docs)
        }
    })   
}

userSchema.statics.authenticate = function(username, password, next){
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

userSchema.statics.new = function(username, password, next){
    User.findOne({username: username}, async function(err, user){
        if(err){
            return next(err, null)
        } else if(user){
            return next(new Error("Username taken"), null);
        } else {   
            //create new user
            let new_user = new User({
                username: username,
                history: [],
            });
            
            //hash password
            new_user.password_hash = new_user.generateHash(password)
            new_user.current = Math.floor(Math.random() * 13)
            console.log(new Date().getDate())
            new_user.gen_day = new Date().getDate()
            await User.create(new_user);
            return next(null, new_user)
        }
    });
}

// compile the schema into a model (named 'User')
const User = mongoose.model('user', userSchema);

// export the model
module.exports = User;