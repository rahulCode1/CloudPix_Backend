require("dotenv").config()
const express = require("express")
const app = express()
const cors = require("cors")
const { initializeDb } = require("./db/db.connect")
const HttpError = require("./model/http_error")
const userRoutes = require("./routes/user_routes")
const albumRoutes = require("./routes/album_routes")
const imageRoutes = require("./routes/image_routes")
const cloudinary = require("cloudinary")
const multer = require("multer")

initializeDb()


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})


app.use("/auth", userRoutes)
app.use('/albums', albumRoutes)
app.use("/albums", imageRoutes)

app.use((req, res, next) => {
    return next(new HttpError("This route doesn't exist.", 404))
})

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next()
    }

    if (error instanceof multer.MulterError) {
        // File too large
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File size must be under 5MB" });
        }
    }

    if (error.message === "Only JPG, PNG, and GIF files are allowed") {
        return res.status(400).json({ message: error.message });
    }

    res.status(error.errorCode || 500).json({
        message: error.message || 'Internal server error',
        errors: error.errors || null
    })
})


const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})