const express = require('express');
const authenticateToken = require('../middleWare/tokenVerification');
const hospitalController = require('../controllers/hospital');

const router = express.Router();

router.post('/signUp', hospitalController.signUp);
router.post('/signIn', hospitalController.signIn);
router.get('/donors',authenticateToken,hospitalController.getDonors);
router.get('/recipients',authenticateToken,hospitalController.getRecipients);
router.get('/donor/authorize/:id',authenticateToken,hospitalController.donorAuthorize);
router.get('/donor/unauthorize/:id',authenticateToken,hospitalController.donorUnauthorize);
router.get('/hospitalNames', hospitalController.getHospitalNames);
router.get('/recipient/authorize/:id',authenticateToken,hospitalController.recipientAuthorize);
router.get('/recipient/unauthorize/:id',authenticateToken,hospitalController.recipientUnauthorize);
router.get('/donor/matches',authenticateToken,hospitalController.donorMatches);
router.get('/recipient/matches',authenticateToken,hospitalController.recipientMatches);

module.exports = router;
