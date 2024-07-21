require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', express.static('public')); // T

const port = process.env.PORT || 3000;

app.get('/api', (req, res) => {
  res.json({
    message: "Welcome to the MapsNotIncluded API"
  });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});