const express = require('express')
const validateController = require ('../controllers/validateController')
const router = express.Router()

//login
router.get('/login', validateController.view)


//register
router.get('/register', validateController.signup)


module.exports = router