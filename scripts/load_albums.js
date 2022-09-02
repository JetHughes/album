const albums = require('../album_data.json');
const Album = require('../models/album');

//connect to db
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

//load albums
let count = 0;
console.log("do stuff")
albums.forEach(async album => {
    const db_info = Album.updateOne({title: album.name}, {$set: {num: count}})
    console.log("insert album " + count + " info:" + db_info)
    count = count + 1;
})
