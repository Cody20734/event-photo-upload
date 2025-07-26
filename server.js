const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');

const app = express();

// Serve uploaded files publicly
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Multer storage config
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

// Upload to Google Drive
async function uploadToDrive(filename, filepath) {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: filename,
    parents: ['1qwVYslvgA0yG4R26JdQ3TEzPgUNbK0tN']
  };

  const media = {
    mimeType: 'image/png',
    body: fs.createReadStream(filepath),
  };

  const result = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id',
  });

  console.log(`📁 Uploaded to Drive: ${filename} (file ID: ${result.data.id})`);
}

// Upload endpoint
app.post('/upload', upload.single('photo'), async (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.file.filename);
  try {
    await uploadToDrive(req.file.filename, filePath);
    console.log(`✅ Uploaded ${req.file.filename} to Google Drive`);
  } catch (err) {
    console.error(`❌ Failed to upload to Drive:`, err);
  }

  res.send(`<h3>✅ Photo uploaded and backed up to Drive!</h3><a href="/">Upload Another</a>`);
});

// Gallery endpoint
app.get('/gallery', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');

  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send('Unable to load images.');

    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => `/uploads/${file}`);

    const html = `
      <html>
        <head>
          <title>Event Gallery</title>
          <style>
            body {
              font-family: sans-serif;
              padding: 20px;
              background: #fafafa;
              color: #333;
            }
            h1 {
              text-align: center;
              margin-bottom: 30px;
            }
            .gallery {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              max-width: 1000px;
              margin: auto;
            }
            .gallery a {
              display: block;
              overflow: hidden;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              transition: transform 0.2s;
            }
            .gallery a:hover {
              transform: scale(1.05);
            }
            .gallery img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              display: block;
            }
          </style>
        </head>
        <body>
          <h1>📸 Event Photo Gallery</h1>
          <div class="gallery">
            ${images.map(img => `<a href="${img}" target="_blank"><img src="${img}" alt="Photo"></a>`).join('')}
          </div>
        </body>
      </html>
    `;
    res.send(html);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
