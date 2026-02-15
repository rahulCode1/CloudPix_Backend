const express = require("express")
const router = express.Router()
const { oauthLogin, oauthCallback, loggedUser, allUsers } = require("../controller/user_controller")

router.get("/google", oauthLogin)
router.get("/google/callback", oauthCallback)
router.get("/loggedUser", loggedUser)
router.get('/users', allUsers)

module.exports = router 