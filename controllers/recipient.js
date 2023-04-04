const Web3 = require('web3');
const jwt = require('jsonwebtoken');
const bytes = require('bytes');
const fs = require('fs');
const { uploadToIpfs } = require('../ipfs/ipfs');
const abi = require('../web3/ABI')
const bytes32 = require('bytes32'); 
const {getHospitalName} = require('../controllers/donor');
const { response } = require('express');
const { getDonorMetaData, donorOrganList, matchOrganList } = require("./donor");
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
      const {id,email,registered,authorised,ehrUploaded,matchFound,hospital} = await getRecipientMetaData(user.userId);
      const {addr,contactNumber,ehrTxId,organ} = await contract.methods.recipientDetails(bytes32({  input: bytes32({ input: user.userId })})).call();
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
      res.status(200).send(response);
    } catch (err) {
      res.status(400).send(err.message);
    }
  };

  RecipientController.uploadEHR = async (req, res) => {
    try {
      const { file } = req.files
      const { user } = req;
      const buffer = file.data
      const filename = file.name
      const filePath = `./uploads/${filename}`
      fs.writeFileSync(filePath, buffer)
      const response = await uploadToIpfs(filePath);
      const {path} = response;
      const value = await contract.methods.recipientEHRAdd(path,bytes32({  input: bytes32({ input: user.userId })})).send(options);
      res.send(response)
    } catch (err) {
      console.error(err)
      res.status(500).send('Error uploading file')
    }
  };
  
  RecipientController.editDetails = async (req,res) => {
    const {user} = req;
    const { address,organ,number } = req.body;
    try {
      const value = await contract.methods.editRecipitentDetails(user.userId,address,number,organ).send(options);
      match(user.userId,organ);
      matchOther(user.userId,organ);
      console.log(value);
      res.status(200).send({message:"success"});
    } catch (err) {
      res.status(400).send(err.message);
      console.log(err);
    }
  }

  const match = async (id, organ) => {
    try {
      const value = await contract.methods.matchOrgans(bytes32({  input: bytes32({ input: id })}),organ).send(options);
      console.log(value);
    } catch (err) {
      console.log(err);
    }
  }

  RecipientController.donorMatch = async (req,res) => {
    const {user} = req;
    const response = {};
    try {
      const value = await contract.methods.recipientMatches(bytes32({  input: bytes32({ input: user.userId })})).call();
      
      const {id,registered,authorised,ehrUploaded,hospital} = await getDonorMetaData(value);
      const {addr,email,contactNumber,ehrTxId} = await contract.methods.DonorDetails(bytes32({  input: bytes32({ input: value })})).call();
      const organList = await donorOrganList(value);
      const matchOrgans = await matchOrganList(value);
      response["id"] = id;
      response["registered"] = registered;
      response["authorised"] = authorised;
      response["ehrUploaded"] = ehrUploaded;
      response["hospital"] = await getHospitalName(hospital);
      response["addr"] = addr;
      response["email"] = email;
      response["contactNumber"] = contactNumber;
      response["ehrTxId"] = ehrTxId;
      response["organList"] = organList;
      response["matchOrgans"] = matchOrgans;
      res.status(200).send(response);
    } catch (err) {
      res.status(400).send(err.message);
      console.log(err);
    }
  }

  const matchOther = async (id,organ) => {
    try {
      const value = await contract.methods.matchOthersOrgans(bytes32({  input: bytes32({ input: id })}),organ).send(options);
      console.log(value);
    } catch (err) {
      console.log(err);
    }
  }

  const getRecipientMetaData = (id) => {
    return contract.methods.recipients(bytes32({ input: bytes32({ input: id })})).call();
  }

module.exports = { RecipientController, getRecipientMetaData };