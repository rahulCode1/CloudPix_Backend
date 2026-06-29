const express = require("express");
const router = express.Router();
const {
  createAlbum,
  addUserToShareAlbum,
  deleteAlbum,
  updateAlbumDescription,
  getAllAlbums,
  getAllImageInAnAlbum,
  getAllFavoriteImageInAnAlbum,
  revokeAlbumAccess,
} = require("../controller/album_controller");
const { body, param } = require("express-validator");
const auth_check = require("../middleware/auth_check");

const addAlbumValidation = [
  body("name").trim().notEmpty().withMessage("Album name must be required."),
];

const albumIdValidation = [
  param("albumId")
    .trim()
    .notEmpty()
    .withMessage("Album id is required")
    .bail()
    .isMongoId()
    .withMessage("Album id must be mongoose id."),
];

const updateDescriptionValidation = [
  param("albumId")
    .trim()
    .notEmpty()
    .withMessage("Album id is required")
    .bail()
    .isMongoId()
    .withMessage("Album id must be mongoose id."),
];

const addPermission = [
  param("albumId")
    .trim()
    .notEmpty()
    .withMessage("Album id is required")
    .bail()
    .isMongoId()
    .withMessage("Album id must be mongoose id."),
  body("shareUserId")
    .trim()
    .notEmpty()
    .withMessage("User id required for give album access."),
];

const denyAccessValidation = [
  param("albumId")
    .trim()
    .notEmpty()
    .withMessage("Album id is required")
    .bail()
    .isMongoId()
    .withMessage("Album id must be mongoose id."),
  body("idForDenyAccess")
    .trim()
    .notEmpty()
    .withMessage("User id required for revoke access."),
];

router.get("/", getAllAlbums);
router.get(
  "/:albumId/images/favorites",
  albumIdValidation,
  auth_check,
  getAllFavoriteImageInAnAlbum,
);

router.get(
  "/:albumId/images",
  albumIdValidation,
  auth_check,
  getAllImageInAnAlbum,
);

router.post("/", addAlbumValidation, auth_check, createAlbum);

router.put(
  "/:albumId",
  updateDescriptionValidation,
  auth_check,
  updateAlbumDescription,
);

router.put("/:albumId/share", addPermission, auth_check, addUserToShareAlbum);

router.patch(
  `/:albumId/revokeAccess`,
  denyAccessValidation,
  auth_check,
  revokeAlbumAccess,
);

router.delete("/:albumId", albumIdValidation, auth_check, deleteAlbum);

module.exports = router;
