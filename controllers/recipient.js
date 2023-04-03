const Web3 = require('web3');
const jwt = require('jsonwebtoken');
const bytes = require('bytes');
const abi = require('../web3/ABI')
const bytes32 = require('bytes32'); 
const {getHospitalName} = require('../controllers/donor')
require('dotenv').config();
const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
const web3 = new Web3(provider);
const contract = new web3.eth.Contract(abi,process.env.contract);
const options = {
	gas: 500000, // or any higher value
	from: process.env.sender
};

const RecipientController = {};

RecipientController.signUp = async (req, res) => {
    const { email, password, hospitalName } = req.body;
  try {
    await contract.methods.registerRecipient(email,password,hospitalName).send(options);
    res.status(200).send({message:"Registered"});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

RecipientController.signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
      const value = await contract.methods.recipientSignIn(email,password).call();

  const token = jwt.sign({ userId: value },  process.env.JWT_SECRET, { expiresIn: '24h' });
      res.status(200).send({token:token,user:"recipient"});
    } catch (err) {
      res.status(400).send(err.message);
    }
  };

  RecipientController.getDetails = async (req,res) => {
    const {user} = req;
    const response = {};
    try {
      const {email,registered,authorised,ehrUploaded,matchFound,hospital} = await getRecipientMetaData(user);
      const {id,addr,contactNumber,ehrTxId,organ} = await contract.methods.recipientDetails(bytes32({  input: bytes32({ input: user.userId })})).call();
      response["id"] = id;
      response["registered"] = registered;
      response["authorised"] = authorised;
      response["ehrUploaded"] = ehrUploaded;
      response["hospital"] = await getHospitalName(hospital);
      response["addr"] = addr;
      response["email"] = email;
      response["contactNumber"] = contactNumber;
      response["ehrTxId"] = ehrTxId;
      response["organ"] = organ;
      response["matchFound"] = matchFound;
      res.status(200).send(value);
    } catch (err) {
      res.status(400).send(err.message);
    }
  };
  
  RecipientController.editDetails = async (req,res) => {
    const {user} = req;
    const { address,organ,number } = req.body;
    try {
      const value = await contract.methods.editRecipientDetails(user.userId,address,number,organ).send(options);
      console.log(value);
      res.status(200).send({message:"success"});
    } catch (err) {
      res.status(400).send(err.message);
      console.log(err);
    }
  }

  const getRecipientMetaData = (user) => {
    return contract.methods.recipients(bytes32({ input: bytes32({ input: user.userId })})).call();
  }

module.exports = RecipientController;