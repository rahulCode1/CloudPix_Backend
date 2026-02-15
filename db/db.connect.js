const mongoose = require("mongoose")

const MONGO_URI = process.env.MONGODB
const initializeDb = async () => {

    await mongoose.connect(MONGO_URI).then(() => {
        console.log(`Successfully connected to db.`)
    }).catch(err => console.log('Error to connect to db.', err))




}


module.exports = { initializeDb }