const express = require('express');
const upload = require('express-fileupload');
const hospitalRoutes = require('./routes/hospital');
const donorRoutes = require('./routes/donor');
const recipientRoutes = require('./routes/recipient');

const app = express();

app.use(upload());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.json());
app.use('/api/v1/hospital', hospitalRoutes);
app.use('/api/v1/donor', donorRoutes);
app.use('/api/v1/recipient', recipientRoutes);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
