const mongoose = require("mongoose")


const imageSchema = new mongoose.Schema({
    albumId: { type: mongoose.Types.ObjectId, ref: "Album" },
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    name: { type: String, required: true },
    tags: { type: [String], required: true },
    person: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
    comments: [{ type: String }],
    size: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true })

const Image = mongoose.model("Image", imageSchema)
module.exports = Image 