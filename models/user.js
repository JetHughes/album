const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

// create a schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password_hash: { type: String, reqired: false },
    current: { type: Number, required: false },
    history: {type: Array, required: false}
})

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    console.log(`authenticating user: ${this.username} using pword: ${password}`)
    return bcrypt.compareSync(password, this.password_hash);
};

// compile the schema into a model (named 'message')
const User = mongoose.model('user', userSchema);

// export the model
module.exports = User;