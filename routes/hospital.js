const express = require('express');
const authenticateToken = require('../middleWare/tokenVerification');
const hospitalController = require('../controllers/hospital');

const router = express.Router();

router.post('/signUp', hospitalController.signUp);
router.post('/signIn', hospitalController.signIn);
router.get('/Donors',authenticateToken,hospitalController.getDonors);
router.get('/authorize/:id',authenticateToken,hospitalController.authorize);
router.get('/hospitalNames', hospitalController.getHospitalNames);

module.exports = router;
