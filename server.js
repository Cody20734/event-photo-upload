const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Serve static files (the HTML form)
app.use(express.static('public'));

// Set up storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Handle upload
app.post('/upload', upload.single('photo'), (req, res) => {
  console.log(`✅ Received file: ${req.file.filename}`);
  res.send(`<h3>✅ Photo uploaded successfully!</h3><a href="/">Upload Another</a>`);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
