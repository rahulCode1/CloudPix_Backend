const Album = require("../model/album_model")
const HttpError = require("../model/http_error")
const User = require("../model/user_model")
const Image = require("../model/image_model")
const { validationResult } = require("express-validator")

const createAlbum = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty) {
        return next(new HttpError('Invalid album data.',
            422,
            errors.array()))
    }

    const { name, description } = req.body
    const ownerId = req.userId
    try {
        const album = new Album({ name, description, ownerId })
        await album.save()

        res.status(201).json({
            message: "New album added.",
            album: album.toObject({ getters: true })
        })
    } catch (error) {
        next(error)
    }

}

const getAllAlbums = async (req, res, next) => {


    try {
        const albums = await Album.find()


        res.status(201).json({
            message: "Albums fetched successfully.",
            albums: albums.map(album => album.toObject({ getters: true }))
        })
    } catch (error) {
        next(error)
    }
}

const updateAlbumDescription = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid data', 404, errors.array()))
    }

    const albumId = req.params.albumId
    const userId = req.userId
    const { description } = req.body



    try {
        const album = await Album.findById(albumId)

        if (!album) {
            return next(new HttpError(`No album find with that id.`, 404))
        }

        const albumOwnerId = album.ownerId.toString()
        if (userId === albumOwnerId) {

            album.description = description

            await album.save()

        } else {
            return next(new HttpError("You'r not owner of that album, Only owner can edit album", 401))
        }
        res.status(201).json({
            message: "Album updated.",
            album: album.toObject({ getters: true })
        })
    } catch (error) {
        next(error)
    }

}

const addUserToShareAlbum = async (req, res, next) => {
    const albumId = req.params.albumId
    const { emails } = req.body
    const userId = req.userId
    try {
        const album = await Album.findById(albumId)

        if (!album) {
            return next(new HttpError(`No album find with that id.`, 404))
        }

        if (userId !== album.ownerId.toString()) {
            return next(new HttpError("You'r not owner of that album, Only owner can edit album", 403))
        }


        const existingUsers = await User.find({ email: { $in: emails } })
        const existingEmails = existingUsers.map(user => user.email)
        const missingEmails = emails.filter(
            email => !existingEmails.includes(email)
        );

        if (missingEmails.length > 0) {
            return next(
                new HttpError(
                    `These users do not exist: ${missingEmails.join(", ")}`,
                    422
                )
            );
        }

        const existingUserUserIdsArr = existingUsers.map(user => user._id.toString())

        existingUserUserIdsArr.forEach(userId => {
            if (!album.sharedWith.includes(userId)) {
                album.sharedWith.push(userId)
            }
        })

        await album.save()

        res.status(201).json({
            message: "Permission allowed successfully.",
            album: album.toObject({ getters: true })
        })
    } catch (error) {
        next(error)
    }

}

const deleteAlbum = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid album id.', 404, errors.array()))
    }

    const albumId = req.params.albumId
    const userId = req.userId

    try {
        const album = await Album.findById(albumId)


        if (!album) {
            return next(new HttpError(`No album find with that id.`, 404))
        }

        if (userId !== album.ownerId.toString()) {
            return next(new HttpError("You'r not owner of that album, Only owner can delete album", 401))
        }

        await Album.findByIdAndDelete(albumId)

        await Image.deleteMany({ albumId })
        res.status(200).json({
            success: true,
            message: `${album.name} deleted successfully.`,
            albumId
        })
    } catch (error) { next(error) }
}


const getAllImageInAnAlbum = async (req, res, next) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid album id or album id not present.',
            404,
            errors.array()))
    }

    const albumId = req.params.albumId
    const { tags } = req.query

    // console.log(tags)

    let filter = {}

    if (tags) {
        const tagsArray = Array.isArray(tags) ? tags : [tags]
        filter.tags = { $all: tagsArray } 
    }

   
    try {
        const images = await Image.find({ albumId , ...filter})


   
        const album = await Album.findById(albumId)

        if (!album) {
            return next(new HttpError("No album exist with that id.", 404))
        }


        res.status(201).json({
            message: "Album fetched successfully.",
            album: album.toObject({ getters: true }),
            images: images.map(image => image.toObject({ getters: true }))
        })
    } catch (error) { next(error) }
}

const getAllFavoriteImageInAnAlbum = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid album id or album id not present.',
            404,
            errors.array()))
    }

    const albumId = req.params.albumId
    try {


        const album = await Album.findById(albumId)

        if (!album) {
            return next(new HttpError("No album exist with that id.", 404))
        }

        const images = await Image.find({ albumId, isFavorite: true })

        res.status(201).json({
            message: "Favorite album images fetched successfully.",
            images: images.map(image => image.toObject({ getters: true }))
        })
    } catch (error) { next(error) }
}




module.exports = {
    getAllAlbums,
    createAlbum,
    updateAlbumDescription
    , getAllImageInAnAlbum,
    addUserToShareAlbum,
    deleteAlbum,
    getAllFavoriteImageInAnAlbum,

}