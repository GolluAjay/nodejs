const express = require('express');
const { RecipientController } = require('../controllers/recipient');
const authenticateToken = require('../middleWare/tokenVerification');

const router = express.Router();

router.post('/signUp', RecipientController.signUp);
router.post('/signIn', RecipientController.signIn);
router.post("/editDetails",authenticateToken,RecipientController.editDetails);
router.post("/upload",authenticateToken,RecipientController.uploadEHR);
router.get("/recipientDetails",authenticateToken,RecipientController.getDetails);

module.exports = router;
