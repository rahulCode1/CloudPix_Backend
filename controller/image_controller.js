const Image = require("../model/image_model");
const HttpError = require("../model/http_error");
const cloudinary = require("cloudinary");
const Album = require("../model/album_model");
const { validationResult } = require("express-validator");

const uploadImage = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid data", 404, errors.array()));
  }

  const albumId = req.params.albumId;
  const userId = req.userId;
  const file = req.file;

  const { name, person, tags } = req.body;

  if (!file) {
    return next(new HttpError("No file uploaded", 500, errors.array()));
  }

  const album = await Album.findById(albumId);

  if (!album) {
    return next(
      new HttpError("No album exist with that id", 404, errors.array()),
    );
  }
  const ownerId = album.ownerId.toString();

  if (userId !== ownerId) {
    return next(
      new HttpError(
        "Yourn't owner of that album, Only owner can add image on that album.",
        422,
        errors.array(),
      ),
    );
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "uploads",
    });

    const tagsArray = tags.split(",").map((tag) => tag.trim());

    const image = new Image({
      imageUrl: result.secure_url,
      publicId: result.public_id,
      name,
      person,
      albumId,
      tags: tagsArray,
      size: file.size,
    });

    if (!album.coverImage) {
      album.coverImage = result.secure_url;
      album.public_id = result.public_id;
      await album.save();
    }

    await image.save();
    res.status(201).json({
      message: "Image added successfully.",
      image: image.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const imageDetails = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid data", 404, errors.array()));
  }

  const imageId = req.params.imageId;
  const albumId = req.params.albumId;
  try {
    const image = await Image.findById(imageId);

    if (!image) {
      return next(
        new HttpError("No image exist with that id", 404, errors.array()),
      );
    }

    const album = await Album.findById(albumId);

    if (!album) {
      return next(
        new HttpError("No album exist with that id", 404, errors.array()),
      );
    }

    res.status(201).json({
      message: "Image find successfully.",
      image: image.toObject({ getters: true }),
      album: album.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const markFavoriteOrUnfavorite = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid data", 404, errors.array()));
  }

  const albumId = req.params.albumId;
  const imageId = req.params.imageId;

  try {
    const album = await Album.findById(albumId);

    if (!album) {
      return next(
        new HttpError(`Album not found with that id.`, 404, errors.array()),
      );
    }
    const image = await Image.findById(imageId);

    if (!image) {
      return next(
        new HttpError(`Image not found with that id.`, 404, errors.array()),
      );
    }

    image.isFavorite = !image.isFavorite;
    await image.save();

    res.status(201).json({
      success: true,
      message: `${image.isFavorite ? "Image marked as favorite" : "Remove favorite mark"}`,
      image,
    });
  } catch (error) {
    next(error);
  }
};

const addComments = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid data", 404, errors.array()));
  }

  const imageId = req.params.imageId;
  const { comment } = req.body;
  try {
    const image = await Image.findById(imageId);

    if (!image) {
      return next(
        new HttpError("No image found with that id.", 404, errors.array()),
      );
    }

    image.comments.push(comment);
    await image.save();

    res.status(201).json({
      success: true,
      message: "New comment added.",
    });
  } catch (error) {
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid data", 404, errors.array()));
  }

  const imageId = req.params.imageId;
  const albumId = req.params.albumId;
  const userId = req.userId;
  try {
    const image = await Image.findById(imageId);

    if (!image) {
      return next(
        new HttpError("No image exist with that id", 404, errors.array()),
      );
    }

    const album = await Album.findById(albumId);
    if (!album) {
      return next(
        new HttpError("No album exist with that id", 404, errors.array()),
      );
    }

    if (album.ownerId.toString() !== userId) {
      return next(
        new HttpError(
          "Yourn't owner of that album, Only owner can delete image",
          403,
          errors.array(),
        ),
      );
    }

    await cloudinary.uploader.destroy(image.publicId);

    await image.deleteOne();

    if (album.coverImage === image.imageUrl) {
      const otherImages = await Image.findOne({ albumId });

      if (otherImages) {
        album.coverImage = otherImages?.imageUrl;
        album.public_id = otherImages?.publicId;
      } else {
        album.coverImage = "";
        album.public_id = "";
      }
      await album.save();
    }

    res.status(201).json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  markFavoriteOrUnfavorite,
  addComments,
  imageDetails,
  deleteImage,
};
