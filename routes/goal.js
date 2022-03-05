const express = require('express')
const goalController = require ('../controllers/goalController')
const router = express.Router()


// new goal
router.get('/new/:id', goalController.addgoal)

//post new goal
router.post('/new/:id', goalController.create)

//priorities
router.get('/priorities/:id/:goalid', goalController.priorities)

//post priorities
router.post('/priorities/:id/:goalid', goalController.addpriorities)

//overview
router.get('/overview/:id/:goalid', goalController.goalplan)

//checkbox
router.get('/checked/:id/:goalid/:priorid', goalController.check)

//uncheckbox
router.get('/uncheck/:id/:goalid/:priorid', goalController.uncheck)

//progress
router.get('/progress', goalController.track)

//delete priority
router.get('/priority/:id/:goalid/:priorid', goalController.priority)

//delete priority from overview
router.get('/delprior/:id/:goalid/:priorid', goalController.delprior)

//delete goal
router.get('/delgoal/:id/:goalid', goalController.delgoal)

module.exports = router

