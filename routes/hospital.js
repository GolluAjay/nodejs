const express = require('express');
const authenticateToken = require('../middleWare/tokenVerification');
const hospitalController = require('../controllers/hospital');

const router = express.Router();

router.post('/signUp', hospitalController.signUp);
router.post('/signIn', hospitalController.signIn);
router.get('/donors',authenticateToken,hospitalController.getDonors);
router.get('/recipients',authenticateToken,hospitalController.getRecipients);
router.get('/donor/authorize/:id',authenticateToken,hospitalController.authorize);
router.get('/donor/unauthorize/:id',authenticateToken,hospitalController.unauthorize);
router.get('/hospitalNames', hospitalController.getHospitalNames);

module.exports = router;
