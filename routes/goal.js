const express = require('express')
const goalController = require ('../controllers/goalController')
const router = express.Router()


// new goal
router.get('/new/:id', goalController.addgoal)

//post new goal
router.post('/new/:id', goalController.create)

//get goal
router.get('/edit/:id/:goalid', goalController.edit)

//update goal
router.post('/editgoal/:id/:goalid', goalController.editgoal)

//update priorities
router.post('/editprior/:id/:goalid/:priorid', goalController.editprior)

//priorities
router.get('/priorities/:id/:goalid', goalController.priorities)

//post priorities
router.post('/priorities/:id/:goalid', goalController.addpriorities)

//new priorities
router.post('/newprior/:id/:goalid', goalController.newprior)

//overview
router.get('/overview/:id/:goalid', goalController.goalplan)

//checkbox
router.get('/checked/:id/:goalid/:priorid', goalController.check)

//uncheckbox
router.get('/uncheck/:id/:goalid/:priorid', goalController.uncheck)

//complete
router.get('/complete/:id/:goalid', goalController.complete)

//progress
router.get('/progress/:id', goalController.track)

//delete priority from overview
router.get('/delprior/:id/:goalid/:priorid', goalController.delprior)

//delete goal
router.get('/delgoal/:id/:goalid', goalController.delgoal)

module.exports = router

