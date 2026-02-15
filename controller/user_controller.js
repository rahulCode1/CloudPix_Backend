const axios = require("axios")
const HttpError = require("../model/http_error")
const User = require("../model/user_model")
const PORT = process.env.PORT
const jwt = require("jsonwebtoken")


const oauthLogin = async (req, res, next) => {
    try {

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth` +
            `?client_id=${process.env.GOOGLE_CLIENT_ID}` +
            `&redirect_uri=http://localhost:${PORT}/auth/google/callback` +
            `&response_type=code&scope=profile email`

        res.redirect(googleAuthUrl)
    } catch (error) { next(error) }
}

const oauthCallback = async (req, res, next) => {
    const { code } = req.query

    if (!code) {
        return next(new HttpError('Authorization code not found.', 400))
    }

    let accessToken

    try {
        const responseToken = await axios.post(`https://oauth2.googleapis.com/token`, {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: `http://localhost:${PORT}/auth/google/callback`
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })


        accessToken = responseToken.data.access_token

        const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        let user = await User.findOne({ email: userResponse.data.email })

        if (!user) {
            user = new User({ email: userResponse.data.email, name: userResponse.data.name })
            await user.save()

        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' })

        return res.redirect(`${process.env.FRONTEND_URL}/v1/profile/google?token=${token}`)

    } catch (error) {
        next(error)
    }


}


const loggedUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]



    if (!token) {
        return next(new HttpError("Token not found.", 404))
    }

    try {

        const decode = jwt.verify(token, process.env.JWT_SECRET)



        const userId = decode.userId
        const user = await User.findById(userId)

        if (!user) {
            return next(new HttpError("User not found.", 404))
        }

        res.status(200).json({ success: true, user: user.toObject({ getters: true }) })

    } catch (error) { next(error) }
}

const allUsers = async (req, res, next) => {
    try {
        const users = await User.find()

        res.status(201).json({
            success: true,
            message: "Users fetch successfully."
            ,
            users: users.map(user => user.toObject({ getters: true }))
        })
    } catch (error) {
        next(error)
    }
}


module.exports = { oauthLogin, oauthCallback, loggedUser, allUsers }