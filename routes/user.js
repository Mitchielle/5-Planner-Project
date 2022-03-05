const express = require('express')
const userController = require ('../controllers/userController')
const router = express.Router()

//create, find, update, delete query

//goals
router.get('/:id', userController.view)

//post login
router.post('/login', userController.access)

//post register
router.post('/register', userController.create)

//profile
router.get('/profile/:id', userController.profile)

//edit profile
router.get('/update/:id', userController.user)

//post edit profile
router.post('/update/:id', userController.edit)

//logout
router.get('/logout/:id', userController.end)



module.exports = router