const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// ✅ Serve uploaded files publicly
app.use('/uploads', express.static('uploads'));

// ✅ Serve static files (like your HTML form in /public)
app.use(express.static('public'));

// ✅ Multer storage config
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

// ✅ File upload endpoint
app.post('/upload', upload.single('photo'), (req, res) => {
  console.log(`✅ Received file: ${req.file.filename}`);
  res.send(`<h3>✅ Photo uploaded successfully!</h3><a href="/">Upload Another</a>`);
});

// ✅ Gallery route
app.get('/gallery', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to load images.');
    }

    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => `/uploads/${file}`);

    const html = `
      <html>
        <head>
          <title>Event Gallery</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { text-align: center; }
            .gallery { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
            .gallery img { height: 200px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
          </style>
        </head>
        <body>
          <h1>📸 Event Photo Gallery</h1>
          <div class="gallery">
            ${images.map(img => `<img src="${img}" alt="">`).join('')}
          </div>
        </body>
      </html>
    `;

    res.send(html);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
