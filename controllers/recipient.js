const Web3 = require('web3');
const jwt = require('jsonwebtoken');
const bytes = require('bytes');
const abi = require('../web3/ABI')
const bytes32 = require('bytes32'); 
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

  RecipientController.metaData = async (req, res) => {
    const {user} = req;
    try {
      const value = await getRecipientMetaData(user);
      res.status(200).send(value);
    } catch (err) {
      res.status(400).send(err.message);
    }
  };

  const getRecipientMetaData = (user) => {
    return contract.methods.recipients(bytes32({ input: bytes32({ input: user.userId })})).call();
  }

module.exports = RecipientController;