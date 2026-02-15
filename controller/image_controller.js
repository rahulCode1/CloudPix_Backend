const Image = require("../model/image_model")
const HttpError = require("../model/http_error")
const cloudinary = require("cloudinary")
const uuid = require("uuid")
const Album = require("../model/album_model")
const { validationResult } = require("express-validator")


const uploadImage = async (req, res, next) => {
    const file = req.file

    const { albumId, name, person, tags } = req.body
    if (!file) {
        return next(new HttpError("No file uploaded", 500))
    }

    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "uploads"
        })

        const image = new Image({
            imageId: uuid.v4,
            imageUrl: result.secure_url,
            publicId: result.public_id,
            name,
            person,
            albumId,
            tags,
            size: file.size,
            type: file.mimetype
        })

        await image.save()

        res.status(201).json({
            message: "Image added successfully.",
            image: image.toObject({ getters: true })
        })

    } catch (error) {
        next(error)
    }

}

const imageDetails = async (req, res, next) => {
    const imageId = req.params.imageId
    const albumId = req.params.albumId
    try {
        const image = await Image.findById(imageId)

        if (!image) {
            return next(new HttpError("No image exist with that id", 404))
        }

        const album = await Album.findById(albumId)

        if (!album) {
            return next(new HttpError("No album exist with that id", 404))
        }


        res.status(201).json({
            message: "Image find successfully.",
            image: image.toObject({ getters: true }),
            album: album.toObject({ getters: true })
        })
    } catch (error) { next(error) }
}

const updateImages = async (req, res, next) => {
    const imageId = req.params.id

    try {
        const image = await Image.findById(imageId)

        if (!image) {
            return next(new HttpError("No image found", 404))
        }



        await Image.findByIdAndUpdate(req.body)

        res.status(201).json({
            message: "Image updated successfully.",
            image: image.toObject({ getters: true })
        })
    } catch (error) { next(error) }
}

const markFavoriteOrUnfavorite = async (req, res, next) => {
    const albumId = req.params.albumId
    const imageId = req.params.imageId

    try {
        const album = await Album.findById(albumId)

        if (!album) {
            return next(new HttpError(`Album not found with that id.`, 404,))
        }
        const image = await Image.findById(imageId)

        if (!image) {
            return next(new HttpError(`Image not found with that id.`, 404,))
        }

        image.isFavorite = !image.isFavorite
        await image.save()


        res.status(201).json({
            success: true,
            message: `${image.isFavorite ? 'Image marked as favorite' : "Remove favorite mark"}`,
            image
        })
    } catch (error) { next(error) }


}

const addComments = async (req, res, next) => {
    const imageId = req.params.imageId
    const { comment } = req.body
    try {


        const image = await Image.findById(imageId)

        if (!image) {
            return next(new HttpError("No image found with that id.", 404))
        }

        image.comments.push(comment)
        await image.save()


        res.status(201).json({
            success: true,
            message: "New comment added.",
        })

    } catch (error) {
        next(error)
    }
}



const deleteImage = async (req, res, next) => {
    const imageId = req.params.imageId
    const albumId = req.params.albumId
    const userId = req.userId
    try {
        const image = await Image.findById(imageId)


        if (!image) {
            return next(new HttpError("No image exist with that id", 404))
        }

        const album = await Album.findById(albumId)
        if (!album) {
            return next(new HttpError("No album exist with that id", 404))
        }

        if (album.ownerId.toString() !== userId) {
            return next(new HttpError("Yourn't owner of that album, Only owner can delete image", 403))
        }

        await cloudinary.uploader.destroy(image.publicId)
        await image.deleteOne()


        res.status(201).json({
            success: true,
            message: "Image deleted successfully.",
        })
    } catch (error) { next(error) }
}

module.exports = {
    uploadImage,
    markFavoriteOrUnfavorite,
    addComments,
    imageDetails,
    deleteImage
}