const Web3 = require("web3");
const jwt = require("jsonwebtoken");
const bytes = require("bytes");
const abi = require("../web3/ABI");
const bytes32 = require("bytes32");
const { response } = require("express");
const { getDonorMetaData, donorOrganList, matchOrganList } = require("./donor");
const { getRecipientMetaData  } = require("./recipient");
const Item = require("mock-fs/lib/item");
const { link } = require("graceful-fs");
require("dotenv").config();
const provider = new Web3.providers.HttpProvider("http://127.0.0.1:7545");
const web3 = new Web3(provider);
const contract = new web3.eth.Contract(abi, process.env.contract);
const options = {
  gas: 500000, // or any higher value
  from: process.env.sender,
};

const hospitalController = {};

hospitalController.signUp = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    await contract.methods
      .registerHospital(email, password, name)
      .send(options);
    res.status(200).send({message:"Registered"});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

hospitalController.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const value = await contract.methods.HospitalSignIn(email, password).call();

    const token = jwt.sign({ userId: value }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).send({token:token,user:"hospital"});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

hospitalController.getRecipients = async (req,res) => {
  const response = {};
  const { user } = req;
  try {
    const value = await getHospitalRecipientIds(user);
    response.count = value.length;
    const recipientsWithMetadata = await Promise.all(getRecipientMetadataList(value));
    response.list = await Promise.all(
      addDetailsToHospitalRecipients(recipientsWithMetadata)
    );
    res.status(200).send(response);
  } catch (err) {
    res.status(400).send(err.message);
  }
}

hospitalController.getDonors = async (req, res) => {
  const response = {};
  const { user } = req;
  try {
    const value = await getHospitalDonorsIds(user);
    response.count = value.length;
    const donorsWithMetadata = await Promise.all(getDonorMetadataList(value));
    response.list = await Promise.all(
      addDetailsToHospitalDonors(donorsWithMetadata)
    );
    res.status(200).send(response);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

hospitalController.authorize = async (req, res) => {
  const { user } = req;
  const donorId = req.params.id;
  try {
    await contract.methods.authoriseDonor(bytes32({ input: bytes32({ input: donorId }) }), bytes32({ input: bytes32({ input: user.userId }) })).send(options);
    res.status(200).send({"message":"authorize"});
  } catch (err) {
    res.status(400).send(err.message);
  }
}

hospitalController.unauthorize = async (req, res) => {
  const { user } = req;
  const donorId = req.params.id;
  try {
    await contract.methods.unauthoriseDonor(bytes32({ input: bytes32({ input: donorId }) })).send(options);
    res.status(200).send({"message":"unauthorize"});
  } catch (err) {
    res.status(400).send(err.message);
  }
}


hospitalController.getHospitalNames = async (req, res) => {
  try {
    const hospitalNames = await contract.methods.getHospitalNames().call();
    res.status(200).send({"list":hospitalNames});
  } catch (err) {
    res.status(400).send(err.message);
  }
}

const getHospitalDonorsIds = (user) => {
  return contract.methods
    .getHospitalDonors(bytes32({ input: bytes32({ input: user.userId }) }))
    .call();
};

const getHospitalRecipientIds = (user) => {
  return contract.methods
    .getHospitalRecipients(bytes32({ input: bytes32({ input: user.userId }) }))
    .call();
};

const addDetailsToHospitalRecipients = (list) => {
  return list.map(async (Item) => {
    const response = {};
    const details = await getHospitalRecipientsDetails(Item["id"]);
    const {addr,email,contactNumber,ehrTxId,organ} =details;
    const {id,registered,authorised,ehrUploaded,hospital,matchFound} = Item;
    try {
      response["id"] = id;
      response["registered"] = registered;
      response["authorised"] = authorised;
      response["ehrUploaded"] = ehrUploaded;
      response["hospital"] = hospital;
      response["addr"] = addr;
      response["email"] = email;
      response["contactNumber"] = contactNumber;
      response["ehrTxId"] = ehrTxId;
      response["organ"] = organ;
      response["matchFound"] = matchFound;
    } catch (error) {
      console.log(error.message)
    }
    // finally{
    //   Item.details = details;
    // }
    return response;
  });
};


const addDetailsToHospitalDonors = (list) => {
  return list.map(async (Item) => {
    const response = {};
    const details = await getHospitalDonorDetails(Item["id"]);
    const {addr,email,contactNumber,ehrTxId} =details;
    const {id,registered,authorised,ehrUploaded,hospital} = Item;
    try {
      const organList = await donorOrganList(Item["id"]);
      const matchList = await matchOrganList(Item["id"]);
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
      response["matchOrgans"] = matchList;
    } catch (error) {
      console.log(error.message)
    }
    // finally{
    //   Item.details = details;
    // }
    return response;
  });
};

// hospitalController.authorise = async (req,res) => {
//   const {user} = req;
//   const {donorId} = req.body;
//   try {
//     const value = await contract.methods.registerDonor(bytes32({  input: bytes32({ input: donorId })}),bytes32({  input: bytes32({ input: user.userId })})).send(options);
//     res.status(200).send({message:"authorised"});
//   } catch (err) {
//     res.status(400).send(err.message);
//   } 
// }

const getHospitalDonorDetails = (id) => {
  return contract.methods
    .DonorDetails(bytes32({ input: bytes32({ input: id }) }))
    .call();
};

const getHospitalRecipientsDetails = (id) => {
  return contract.methods
    .recipientDetails(bytes32({ input: bytes32({ input: id }) }))
    .call();
};

const getDonorMetadataList = (list) => {
  return list.map(async (id) => await getDonorMetaData(id));
};

const getRecipientMetadataList = (list) => {
  return list.map(async (id) => await getRecipientMetaData(id));
};



module.exports = hospitalController;