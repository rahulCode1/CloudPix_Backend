const Album = require("../model/album_model");
const HttpError = require("../model/http_error");
const User = require("../model/user_model");
const Image = require("../model/image_model");
const { validationResult } = require("express-validator");

const createAlbum = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(errors.array()[0].msg, 422));
  }

  const { name, description } = req.body;
  const ownerId = req.userId;
  try {
    const album = new Album({ name, description, ownerId });
    await album.save();

    res.status(201).json({
      message: "New album added.",
      album: album.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const getAllAlbums = async (req, res, next) => {
  try {
    const albums = await Album.find()
      .populate("ownerId")
      .sort({ createdAt: -1 });
    res.status(201).json({
      message: "Albums fetched successfully.",
      albums: albums.map((album) => album.toObject({ getters: true })),
    });
  } catch (error) {
    next(error);
  }
};

const updateAlbumDescription = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(errors.array()[0].msg, 404));
  }

  const albumId = req.params.albumId;
  const userId = req.userId;
  const { description } = req.body;

  try {
    const album = await Album.findById(albumId);

    if (!album) {
      return next(new HttpError(`No album find with that id.`, 404));
    }

    const albumOwnerId = album.ownerId.toString();
    if (userId === albumOwnerId) {
      album.description = description;

      await album.save();
    } else {
      return next(
        new HttpError(
          "You'r not owner of that album, Only owner can edit album",
          401,
        ),
      );
    }
    res.status(201).json({
      message: "Album updated.",
      album: album.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const addUserToShareAlbum = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(errors.array()[0].msg, 422));
  }
  const { albumId } = req.params;
  const { shareUserId } = req.body;
  const userId = req.userId;
  try {
    const album = await Album.findById(albumId);

    if (!album) {
      return next(new HttpError(`No album find with that id.`, 404));
    }

    if (userId !== album.ownerId.toString()) {
      return next(
        new HttpError(
          "You'r not owner of that album, Only owner can edit album",
          403,
        ),
      );
    }

    const existingUser = await User.findById(shareUserId);

    if (!existingUser) {
      return next(new HttpError("User not found.", 404));
    }

    const isAlbumAlreadyShared = album.sharedWith.some(
      (id) => id.toString() === shareUserId,
    );

    if (isAlbumAlreadyShared) {
      return next(new HttpError("Album already shared this user.", 409));
    }

    album.sharedWith.push(shareUserId);
    await album.save();

    res.status(200).json({
      message: "Permission allowed successfully.",
      album: album.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const revokeAlbumAccess = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(errors.array()[0].msg, 422));
  }
  const { albumId } = req.params;
  const { idForDenyAccess } = req.body;
  const userId = req.userId;

  try {
    const album = await Album.findById(albumId);

    if (!album) {
      return next(new HttpError(`No album find with that id.`, 404));
    }

    if (userId !== album.ownerId.toString()) {
      return next(
        new HttpError(
          "You'r not owner of that album, Only owner can revoke permission",
          403,
        ),
      );
    }

    const hasAccess = album.sharedWith.some(
      (user) => user.toString() === idForDenyAccess,
    );

    if (!hasAccess) {
      return next(new HttpError("User doesn't have access.", 404));
    }

    if (idForDenyAccess === album.ownerId.toString()) {
      return next(new HttpError("Owner access cannot be revoked.", 400));
    }

    album.sharedWith = album.sharedWith.filter(
      (user) => user.toString() !== idForDenyAccess,
    );
    await album.save();

    res.status(200).json({
      message: "Access revoked successfully.",
      album: album.toObject({ getters: true }),
    });
  } catch (error) {
    next(error);
  }
};

const deleteAlbum = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid album id.", 404, errors.array()));
  }

  const albumId = req.params.albumId;
  const userId = req.userId;

  try {
    const album = await Album.findById(albumId);

    if (!album) {
      return next(
        new HttpError(`No album find with that id.`, 404, errors.array()),
      );
    }

    if (userId !== album.ownerId.toString()) {
      return next(
        new HttpError(
          "You'r not owner of that album, Only owner can delete album",
          401,
        ),
      );
    }

    await Album.findByIdAndDelete(albumId);

    await Image.deleteMany({ albumId });
    res.status(200).json({
      success: true,
      message: `${album.name} deleted successfully.`,
      albumId,
    });
  } catch (error) {
    next(error);
  }
};

const getAllImageInAnAlbum = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid album id or album id not present.", 404),
    );
  }

  const { albumId } = req.params;
  const userId = req.userId;

  try {
    const album = await Album.findById(albumId).populate(
      "sharedWith",
      "_id email",
    );

    if (!album) {
      return next(new HttpError("No album exist with that id.", 404));
    }

    if (userId !== album.ownerId.toString()) {
      const allowedUser = album.sharedWith.some(
        (user) => user._id.toString() === userId,
      );

      if (!allowedUser) {
        return next(new HttpError("Yourn't allow to see that album.", 422));
      }
    }

    const images = await Image.find({ albumId }).sort({
      uploadedAt: -1,
    });

    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Album fetched successfully.",
      success: true,
      users: users.map((user) => user.toObject({ getters: true })),
      album: album.toObject({ getters: true }),
      images: images.map((image) => image.toObject({ getters: true })),
    });
  } catch (error) {
    next(error);
  }
};

const getAllFavoriteImageInAnAlbum = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid album id or album id not present.", 404),
    );
  }

  const albumId = req.params.albumId;
  const userId = req.userId;

  try {
    const album = await Album.findById(albumId);

    if (!album) {
      return next(
        new HttpError("No album exist with that id.", 404, errors.array()),
      );
    }

    if (req.userId !== album.ownerId.toString()) {
      const allowedUser = album.sharedWith.includes(userId);

      if (!allowedUser) {
        return next(new HttpError("Yourn't allow to see that album.", 422));
      }
    }

    const images = await Image.find({ albumId, isFavorite: true }).sort({
      uploadedAt: -1,
    });

    res.status(201).json({
      success: true,
      message: "Favorite album images fetched successfully.",
      images: images.map((image) => image.toObject({ getters: true })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAlbums,
  createAlbum,
  updateAlbumDescription,
  getAllImageInAnAlbum,
  addUserToShareAlbum,
  deleteAlbum,
  getAllFavoriteImageInAnAlbum,
  revokeAlbumAccess,
};
