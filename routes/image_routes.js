const {
    uploadImage,
    markFavoriteOrUnfavorite,
    imageDetails,
    addComments,
    deleteImage

} = require("../controller/image_controller")

const express = require("express")
const router = express.Router()
const upload = require("../config/multer")
const auth_check = require("../middleware/auth_check")


router.get('/:albumId/images/:imageId/details',  imageDetails)
router.post("/:albumId/images", upload.single("image"), uploadImage)
router.put(`/:albumId/images/:imageId/favorite`, markFavoriteOrUnfavorite)
router.post("/images/:imageId/comments", addComments)
router.delete('/:albumId/images/:imageId/delete',auth_check, deleteImage)

module.exports = router 