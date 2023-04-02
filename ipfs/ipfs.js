const fs = require("fs");
const fetch = require("node-fetch");
const FormData = require('form-data');

const uploadToIpfs = async (filepath) => {
  const fileStream = fs.createReadStream(filepath);
  const formData = new FormData();

  formData.append("file", fileStream);

  const response = await fetch("http://localhost:3002/files", {
    method: "POST",
    body: formData,
  });

  return response.json();
};

// const downloadFromIpfs = async (path) => {
//   const response = await fetch(`http://localhost:3002/download/${path}`, {
//     method: "GET"
//   });
//   return response.json();
// };

module.exports = { uploadToIpfs };
