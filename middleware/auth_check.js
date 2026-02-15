const jwt = require("jsonwebtoken")
const HttpError = require("../model/http_error")



const auth_check = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
        return next(new HttpError("Authentication failed, Token not found", 401))
    }

    try {

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decodedToken.userId
        next()
    } catch (error) {
        next(new HttpError("Invalid token or Expired token", 401))
    }

}

module.exports = auth_check