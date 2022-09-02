const mongoose = require("mongoose");

// create a schema
const albumSchema = new mongoose.Schema({
    num: {type: Number, required: true},
    title: { type: String, required: true },
    artist: { type: String, reqired: true },
    year: { type: String, required: true },
})

// compile the schema into a model (named 'message')
const Album = mongoose.model('album', albumSchema);

// export the model
module.exports = Album;