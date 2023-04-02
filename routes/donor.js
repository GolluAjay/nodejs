const express = require('express');
const {DonorController} = require('../controllers/donor');
const authenticateToken = require('../middleWare/tokenVerification');

const router = express.Router();
router.post('/signUp', DonorController.signUp);
router.post('/signIn', DonorController.signIn);
router.post('/upload',authenticateToken,DonorController.uploadEHR);
router.post('/editDetails',authenticateToken,DonorController.setDetails);
router.get('/donorDetails',authenticateToken,DonorController.getDonorDetails);


module.exports = router;
