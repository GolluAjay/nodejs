const express = require('express');
const recipientController = require('../controllers/recipient');
const authenticateToken = require('../middleWare/tokenVerification');

const router = express.Router();

router.post('/signUp', recipientController.signUp);
router.post('/signIn', recipientController.signIn);
router.get('/metaData',authenticateToken,recipientController.metaData)

module.exports = router;
