const Web3 = require('web3');
const jwt = require('jsonwebtoken');
const bytes = require('bytes');
const abi = require('../web3/ABI')
const bytes32 = require('bytes32');
const fs = require('fs');
const path = require('path'); 
const { uploadToIpfs } = require('../ipfs/ipfs');
const { response } = require('express');
require('dotenv').config();
const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
const web3 = new Web3(provider);
const contract = new web3.eth.Contract(abi,process.env.contract);
const options = {
	gas: 500000, // or any higher value
	from: process.env.sender
};

const DonorController = {};

DonorController.signUp = async (req, res) => {
    const { email, password, hospitalName } = req.body;
  try {
    await contract.methods.registerDonor(email,password,hospitalName).send(options);
    res.status(200).send({message:"Registered"});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

DonorController.signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
      const value = await contract.methods.donorSignIn(email,password).call();

  const token = jwt.sign({ userId: value },  process.env.JWT_SECRET, { expiresIn: '24h' });
      res.status(200).send({token:token,user:"donor"});
    } catch (err) {
      res.status(400).send(err.message);
    }
  };

  DonorController.getDonorDetails = async (req, res) => {
    const {user} = req;
    const response = {};
    try {
      const {id,registered,authorised,ehrUploaded,hospital} = await getDonorMetaData(user.userId);
      const {addr,email,contactNumber,ehrTxId} = await contract.methods.DonorDetails(bytes32({  input: bytes32({ input: user.userId })})).call();
      const organList = await donorOrganList(user.userId);
      const matchOrgans = await matchOrganList(user.userId);
      response["id"] = id;
      response["registered"] = registered;
      response["authorised"] = authorised;
      response["ehrUploaded"] = ehrUploaded;
      response["hospital"] = hospital;
      response["addr"] = addr;
      response["email"] = email;
      response["contactNumber"] = contactNumber;
      response["ehrTxId"] = ehrTxId;
      response["organList"] = organList;
      response["matchOrgans"] = matchOrgans;
      res.status(200).send(response);
    } catch (err) {
      res.status(400).send(err.message);
    }
  };

  DonorController.uploadEHR = async (req, res) => {
    try {
      const { file } = req.files
      const { user } = req;
      console.log(user);
      const buffer = file.data
      const filename = file.name
      const filePath = `./uploads/${filename}`
      fs.writeFileSync(filePath, buffer)
      const response = await uploadToIpfs(filePath);
      const {path} = response;
      const value = await contract.methods.donorEHRAdd(path,bytes32({  input: bytes32({ input: user.userId })})).send(options);
      res.send(response)
    } catch (err) {
      console.error(err)
      res.status(500).send('Error uploading file')
    }
  };

  // DonorController.getDOwnloadLink = async (req, res) => {
  //   try {
      
  //   } catch (error) {
  //     console.error(err)
  //     res.status(500).send('Error while getting file')
  //   }
  // }

  DonorController.setDetails = async (req,res) => {
    const {user} = req;
    const { address,list,number } = req.body;
    try {
      const value = await contract.methods.editDonorDetails(user.userId,address,number,list).send(options);
      res.status(200).send({message:"success"});
    } catch (err) {
      res.status(400).send(err.message);
    }
  };
  
  const getDonorMetaData = (id) => {
    return contract.methods.donors(bytes32({  input: bytes32({ input: id })})).call();
  }

  const donorOrganList = (id) => {
    return contract.methods.getDonorOrganList(bytes32({  input: bytes32({ input: id })})).call();
  }
  
  const matchOrganList = (id) => {
    return contract.methods.getMatchedOrganList(bytes32({  input: bytes32({ input: id })})).call();
  }

module.exports ={ DonorController , getDonorMetaData, donorOrganList, matchOrganList};