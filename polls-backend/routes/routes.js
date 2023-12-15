const express = require("express");
const router = express.Router();


//Authenticating user
const AuthenticationController=require('../controllers/AuthenticationControllers')
router.post('/register',AuthenticationController.Register)
router.post('/login',AuthenticationController.Login)
//polling controllers
const PollingControllers=require('../controllers/PollingControllers')
router.post('/polls',PollingControllers.createPolls)
router.get('/getAllpolls',PollingControllers.getAllPolls)
router.put('/polls/:poll_id',PollingControllers.updatePolls)
//polls analytics by poll id
router.get('/polls/:poll_id/analytics',PollingControllers.pollsAnalytics)
router.get('/polls/analytics',PollingControllers.getAllPollAnalytics)


//QuestionsControllers
// Route to create a question set
const QuestionsControllers=require('../controllers/QuestionsControllers')
router.post('/createQuestionSet',QuestionsControllers.createQuestionSet)
router.post('/createOption',QuestionsControllers.createOption)
router.put('/questionSets/:pollId/:questionSetId',QuestionsControllers.updateQuestionSet)
module.exports=router


