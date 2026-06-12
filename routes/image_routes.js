const {
  uploadImage,
  markFavoriteOrUnfavorite,
  imageDetails,
  addComments,
  deleteImage,
} = require("../controller/image_controller");

const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const auth_check = require("../middleware/auth_check");
const { body, param } = require("express-validator");

const imageUploadValidation = [
  body("name").trim().notEmpty().withMessage("Image name required."),
  body("person").trim().notEmpty().withMessage("Person name required."),
  param("albumId")
    .trim()
    .notEmpty()
    .withMessage("Album id is required")
    .bail()
    .isMongoId()
    .withMessage("Album id must be mongoose id."),
  body("tags").trim().notEmpty().withMessage("Tags are required."),
];

const albumAndImgIdValidation = [
  param("albumId")
    .trim()
    .notEmpty()
    .withMessage("Album id is required")
    .bail()
    .isMongoId()
    .withMessage("Album id must be mongoose id."),
];

const commentValidation = [
  body("comment").trim().notEmpty().withMessage("Comment text required."),
];

router.get(
  "/:albumId/images/:imageId/details",
  albumAndImgIdValidation,
  auth_check,
  imageDetails,
);

router.post(
  "/:albumId/addImage",
  auth_check,
  upload.single("image"),
  imageUploadValidation,
  uploadImage,
);

router.put(
  `/:albumId/images/:imageId/favorite`,
  albumAndImgIdValidation,
  auth_check,
  markFavoriteOrUnfavorite,
);

router.post("/:imageId/comments", commentValidation, auth_check, addComments);

router.delete(
  "/:albumId/images/:imageId/delete",
  albumAndImgIdValidation,
  auth_check,
  deleteImage,
);

module.exports = router;
