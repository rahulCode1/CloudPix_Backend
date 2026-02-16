const multer = require("multer")
const path = require("path")




// Allowed MIME types
const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);
        cb(null, uniqueName);
    },
});

// File filter (type validation)
const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG, and GIF files are allowed"), false);
    }
};

// Multer instance
const upload = multer({
    storage: multer.diskStorage({}),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter,
});



module.exports = upload