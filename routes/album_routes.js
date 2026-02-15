const express = require("express")
const router = express.Router()
const {
    createAlbum,
    addUserToShareAlbum,
    deleteAlbum,
    updateAlbumDescription,
    getAllAlbums,
    getAllImageInAnAlbum,
    getAllFavoriteImageInAnAlbum,
    getAllImagesViaTags

} = require("../controller/album_controller")
const { check } = require("express-validator")
const auth_check = require("../middleware/auth_check")

const addAlbumValidation = [
    check("name").trim().notEmpty().withMessage("Album name must be required."),

]


router.get("/", getAllAlbums)
router.get("/:albumId/images/favorites", getAllFavoriteImageInAnAlbum)
router.get('/:albumId/images', auth_check, getAllImageInAnAlbum)
router.post('/', addAlbumValidation, auth_check, createAlbum)
router.put('/:albumId', auth_check, updateAlbumDescription)
router.put('/:albumId/share', auth_check, addUserToShareAlbum)
router.delete('/:albumId', auth_check, deleteAlbum)



module.exports = router