// ╔══════════════════════════════════════════════════════════════╗
// ║           CERTIFICATE GENERATOR — DROP-IN MODULE            ║
// ║                                                              ║
// ║  SETUP (do once):                                            ║
// ║    CertificateGenerator.loadTemplate('path/to/template.jpg') ║
// ║                                                              ║
// ║  GENERATE (call whenever you have student data):             ║
// ║    CertificateGenerator.download({ ...studentData })         ║
// ║    CertificateGenerator.preview({ ...studentData })  ← blob ║
// ║    CertificateGenerator.downloadAll([ ...students ])         ║
// ╚══════════════════════════════════════════════════════════════╝

// Prevent re-declaration if already defined
if (typeof CertificateGenerator !== 'undefined') {
  console.warn('CertificateGenerator already defined, skipping re-declaration');
} else {
var CertificateGenerator = (() => {

  // ─────────────────────────────────────────────
  // CONFIGURATION — adjust positions to your JPG
  // All positions are percentage of image width/height (0–100)
  // ─────────────────────────────────────────────
  const CONFIG = {
    templatePath: 'student-certificate-template.jpeg',   // ← path to your template (can be overridden)

    fields: {
      // { x, y } as % of image dimensions. font is px at full resolution.
      // Student photo field
      photo:              { x: 40, y: 30, width: 20, height: 14 },
      atcCode:             { x: 17,  y: 52.5, font: 'bold 150px serif',        color: '#000000', align: 'left' },
      studentNameCombined: { x: 50,  y: 49, font: 'bold 150px serif',      color: '#000000', align: 'center' },
      courseName:          { x: 50,  y: 59, font: 'bold 150px serif',      color: '#000000', align: 'center' },
      grade:               { x: 56,  y: 56, font: '200px serif',           color: '#000000', align: 'left' },
      gradeExtra:          { x: 79,  y: 76, font: '150px serif',         color: '#000000', align: 'left' },
      courseDuration:     { x: 54,  y: 61.5, font: '150px serif',         color: '#000000', align: 'left' },
      coursePeriodFrom:   { x: 41,  y: 64.3, font: '150px serif',         color: '#000000', align: 'left' },
      coursePeriodTo:      { x: 61,  y: 64.3, font: '150px serif',         color: '#000000', align: 'left' },
      certificateNumber:  { x: 24,  y: 93, font: 'bold 100px serif',       color: '#000000', align: 'left' },
      dateOfIssue:         { x: 55,  y: 93, font: '100px serif',           color: '#000000', align: 'left' },
    }
  };

  // ─────────────────────────────────────────────
  // Internal state
  // ─────────────────────────────────────────────
  let _templateImg = null;
  let _canvas = null;
  let _ctx = null;

  // ─────────────────────────────────────────────
  // Initialize canvas on load
  // ─────────────────────────────────────────────
  function _initCanvas() {
    if (!_canvas) {
      _canvas = document.getElementById('certCanvas');
      if (_canvas) {
        _ctx = _canvas.getContext('2d');
      }
    }
    return _canvas && _ctx;
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  function _fmtDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function _pct(val, total) { return (val / 100) * total; }

  // Helper to load an image from URL
  function _loadImage(src) {
    return new Promise((resolve, reject) => {
      if (!src) {
        resolve(null);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image: ' + src));
      img.src = src;
    });
  }

  function _drawField(field, text) {
    if (!text || !_ctx) return;
    const W = _canvas.width, H = _canvas.height;
    _ctx.save();
    _ctx.font      = field.font;
    _ctx.fillStyle = field.color;
    
    // Handle text alignment: center text should be drawn at the center point
    if (field.align === 'center') {
      _ctx.textAlign = 'center';
      _ctx.fillText(text, _pct(field.x, W), _pct(field.y, H));
    } else {
      _ctx.textAlign = field.align || 'left';
      _ctx.fillText(text, _pct(field.x, W), _pct(field.y, H));
    }
    _ctx.restore();
  }

  // ─────────────────────────────────────────────
  // Core render function
  // student = { studentNameCombined, courseName, grade, courseDuration, coursePeriodFrom, coursePeriodTo, certificateNumber, dateOfIssue, photo }
  // ─────────────────────────────────────────────
  async function _render(student) {
    console.log('_render called with student:', student);
    if (!_templateImg) {
      console.error('Template not loaded. Call CertificateGenerator.loadTemplate() first.');
      throw new Error('Template not loaded. Call CertificateGenerator.loadTemplate() first.');
    }
    if (!_initCanvas()) {
      console.error('Canvas not found. Make sure <canvas id="certCanvas"> exists.');
      throw new Error('Canvas not found. Make sure <canvas id="certCanvas"> exists.');
    }

    console.log('Canvas initialized, dimensions:', _canvas.width, 'x', _canvas.height);
    console.log('Template image dimensions:', _templateImg.naturalWidth, 'x', _templateImg.naturalHeight);
    
    _canvas.width  = _templateImg.naturalWidth;
    _canvas.height = _templateImg.naturalHeight;

    console.log('Canvas resized to:', _canvas.width, 'x', _canvas.height);

    // Draw template background
    _ctx.drawImage(_templateImg, 0, 0);
    console.log('Template background drawn');

    // Draw student photo if available
    if (student.photo) {
      console.log('Drawing student photo on certificate:', student.photo);
      try {
        const photoImg = await _loadImage(student.photo);
        if (photoImg) {
          console.log('Photo loaded successfully, dimensions:', photoImg.width, 'x', photoImg.height);
          const photoField = CONFIG.fields.photo;
          if (photoField) {
            const x = _pct(photoField.x, _canvas.width);
            const y = _pct(photoField.y, _canvas.height);
            const w = _pct(photoField.width, _canvas.width);
            const h = _pct(photoField.height, _canvas.height);
            console.log('Drawing photo at:', { x, y, w, h });
            _ctx.drawImage(photoImg, x, y, w, h);
          }
        } else {
          console.log('Photo image failed to load');
        }
      } catch (e) {
        console.warn('Could not load student photo:', e);
      }
    } else {
      console.log('No photo available in student data');
    }

    // Overlay fields
    _drawField(CONFIG.fields.atcCode,             student.atcCode);
    _drawField(CONFIG.fields.studentNameCombined, student.studentNameCombined);
    _drawField(CONFIG.fields.courseName,          student.courseName);
    _drawField(CONFIG.fields.grade,               student.grade);
    _drawField(CONFIG.fields.gradeExtra,           student.grade);
    _drawField(CONFIG.fields.courseDuration,     student.courseDuration);
    _drawField(CONFIG.fields.coursePeriodFrom,   student.coursePeriodFrom ? _fmtDate(student.coursePeriodFrom) : '');
    _drawField(CONFIG.fields.coursePeriodTo,      student.coursePeriodTo ? _fmtDate(student.coursePeriodTo) : '');
    _drawField(CONFIG.fields.certificateNumber,  student.certificateNumber);
    _drawField(CONFIG.fields.dateOfIssue,         _fmtDate(student.dateOfIssue));

    return _canvas;
  }

  function _canvasToPDF() {
    const { jsPDF } = window.jspdf;
    const W = _canvas.width, H = _canvas.height;
    const pdf = new jsPDF({
      orientation: W > H ? 'landscape' : 'portrait',
      unit: 'px',
      format: [W, H]
    });
    pdf.addImage(_canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, W, H);
    return pdf;
  }

  function _safeName(name) {
    return (name || 'certificate').replace(/[^a-z0-9_\-]/gi, '_');
  }

  // ─────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────
  return {

    /**
     * Load template image.
     * @param {string} pathOrDataURL  — URL or base64 data URL of your JPG
     * @returns {Promise}
     *
     * Example:
     *   await CertificateGenerator.loadTemplate('/assets/cert_template.jpg');
     */
    loadTemplate(pathOrDataURL) {
      return new Promise((resolve, reject) => {
        _initCanvas();
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => { 
          _templateImg = img; 
          console.log('Template loaded successfully, dimensions:', img.naturalWidth, 'x', img.naturalHeight);
          resolve(img); 
        };
        img.onerror = (e) => {
          console.error('Failed to load template:', pathOrDataURL, e);
          reject(new Error('Failed to load template: ' + pathOrDataURL));
        };
        img.src = pathOrDataURL || CONFIG.templatePath;
      });
    },

    /**
     * Download a single student's certificate as a PDF.
     * @param {Object} student — { studentNameCombined, courseName, grade, sessionFrom, sessionTo, courseDuration, coursePeriodFrom, coursePeriodTo, certificateNumber, dateOfIssue, photo }
     *
     * Example:
     *   CertificateGenerator.download({
     *     studentNameCombined: 'Ramesh Kumar S/O Suresh Kumar',
     *     courseName: 'Computer Science',
     *     grade: 'A+',
     *     sessionFrom: 2020,
     *     sessionTo: 2024,
     *     courseDuration: '4 Years',
     *     coursePeriodFrom: '2020-01-15',
     *     coursePeriodTo: '2024-01-15',
     *     certificateNumber: 'CERT-2024-001',
     *     dateOfIssue: '2024-01-15',
     *     photo: 'https://example.com/photo.jpg'
     *   });
     */
    async download(student) {
      console.log('CertificateGenerator.download called with:', student);
      try {
        await _render(student);
        console.log('_render completed, generating PDF');
        _canvasToPDF().save(`student_certificate_${_safeName(student.studentNameCombined)}.pdf`);
      } catch (err) {
        console.error('CertificateGenerator.download error:', err);
        alert('Failed to generate PDF: ' + err.message);
      }
    },

    /**
     * Get a Blob URL of the certificate (for <img> preview or custom handling).
     * @param {Object} student
     * @returns {string} blobURL — remember to URL.revokeObjectURL() when done
     *
     * Example:
     *   const url = await CertificateGenerator.getPreviewURL(student);
     *   document.getElementById('preview').src = url;
     */
    async getPreviewURL(student) {
      return new Promise(async (resolve, reject) => {
        try {
          await _render(student);
          _canvas.toBlob(blob => {
            resolve(URL.createObjectURL(blob));
          }, 'image/jpeg', 0.92);
        } catch (err) {
          reject(err);
        }
      });
    },

    /**
     * Get raw canvas data URL (e.g. for embedding in <img> directly).
     * @param {Object} student
     * @returns {string} dataURL
     */
    async getDataURL(student) {
      await _render(student);
      return _canvas.toDataURL('image/jpeg', 0.95);
    },

    /**
     * Download certificates for ALL students one by one.
     * @param {Array}    students          — array of student objects
     * @param {Function} [onProgress]      — optional callback(current, total)
     *
     * Example:
     *   await CertificateGenerator.downloadAll(students, (i, total) => {
     *     console.log(`${i} of ${total} done`);
     *   });
     */
    async downloadAll(students, onProgress) {
      for (let i = 0; i < students.length; i++) {
        this.download(students[i]);
        if (onProgress) onProgress(i + 1, students.length);
        await new Promise(r => setTimeout(r, 350)); // small gap between downloads
      }
    },

    /**
     * Update a field's position/style at runtime.
     * Useful if you need to adjust positions without editing this file.
     * @param {string} fieldName  — key from CONFIG.fields
     * @param {Object} overrides  — e.g. { x: 40, y: 53, font: 'bold 30px serif' }
     *
     * Example:
     *   CertificateGenerator.setField('applicantName', { x: 40, y: 53 });
     */
    setField(fieldName, overrides) {
      if (!CONFIG.fields[fieldName]) throw new Error('Unknown field: ' + fieldName);
      Object.assign(CONFIG.fields[fieldName], overrides);
    },

    /** Expose config for inspection */
    get config() { return CONFIG; }
  };

})();
}
