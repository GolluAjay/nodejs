const express = require('express');
const { RecipientController } = require('../controllers/recipient');
const authenticateToken = require('../middleWare/tokenVerification');
const { route } = require('./hospital');

const router = express.Router();

router.post('/signUp', RecipientController.signUp);
router.post('/signIn', RecipientController.signIn);
router.post("/editDetails",authenticateToken,RecipientController.editDetails);
router.post("/upload",authenticateToken,RecipientController.uploadEHR);
router.get("/recipientDetails",authenticateToken,RecipientController.getDetails);
// router.post("/match",authenticateToken,RecipientController.match);
router.get("/donor/match",authenticateToken,RecipientController.donorMatch);
// router.post("/matchOther",authenticateToken,RecipientController.matchOther);


module.exports = router;
