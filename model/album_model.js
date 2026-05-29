const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    sharedWith: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    coverImage: { type: String },
    public_id: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Album = mongoose.model("Album", albumSchema);
module.exports = Album;
