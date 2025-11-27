const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use('/public', express.static(path.join(__dirname, 'public')));

app.post('/api/upload', authenticateAdminMiddleware, upload.single('file'), (req, res) => {
  const fileUrl = `${process.env.SERVER_URL || 'https://your-backend-url'}/public/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});
