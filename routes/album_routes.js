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


} = require("../controller/album_controller")
const { body, param } = require("express-validator")
const auth_check = require("../middleware/auth_check")

const addAlbumValidation = [
    body("name").trim().notEmpty().withMessage("Album name must be required."),

]

const albumIdValidation = [
    param("albumId")
        .trim()
        .notEmpty()
        .withMessage("Album id is required")
        .bail()
        .isMongoId()
        .withMessage("Album id must be mongoose id.")
]

const updateDescriptionValidation = [
    body("description").trim().notEmpty().withMessage("Album description must be required."),
    param("albumId")
        .trim()
        .notEmpty()
        .withMessage("Album id is required")
        .bail()
        .isMongoId()
        .withMessage("Album id must be mongoose id.")

]

const emailTypeValidation = [
    body("emails").trim().notEmpty().
        withMessage("Emails required").isEmail().
        withMessage("Please enter a valid email address.")
]

router.get("/", getAllAlbums)
router.get("/:albumId/images/favorites",
    albumIdValidation,
    auth_check,
    getAllFavoriteImageInAnAlbum)

router.get('/:albumId/images',
    albumIdValidation,
    auth_check,
    getAllImageInAnAlbum)

router.post('/',
    addAlbumValidation,
   auth_check,
    createAlbum)

router.put('/:albumId',
    updateDescriptionValidation,
    auth_check,
    updateAlbumDescription)

router.put('/:albumId/share',
    emailTypeValidation,
    auth_check,
    addUserToShareAlbum)
    
router.delete('/:albumId',
    albumIdValidation,
    auth_check,
    deleteAlbum)



module.exports = router