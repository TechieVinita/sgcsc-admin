// ╔══════════════════════════════════════════════════════════════╗
// ║           ADMIT CARD GENERATOR — DROP-IN MODULE              ║
// ║                                                              ║
// ║  SETUP (do once):                                            ║
// ║    AdmitCardGenerator.loadTemplate('path/to/template.jpg')  ║
// ║                                                              ║
// ║  GENERATE (call whenever you have student data):             ║
// ║    AdmitCardGenerator.download({ ...admitCardData })         ║
// ║    AdmitCardGenerator.preview({ ...admitCardData })  ← blob  ║
// ║    AdmitCardGenerator.downloadAll([ ...admitCards ])         ║
// ╚══════════════════════════════════════════════════════════════╝

// Prevent re-declaration if already defined
if (typeof AdmitCardGenerator !== 'undefined') {
  console.warn('AdmitCardGenerator already defined, skipping re-declaration');
} else {
var AdmitCardGenerator = (() => {

  // ─────────────────────────────────────────────
  // CONFIGURATION — adjust positions to your JPG
  // All positions are percentage of image width/height (0–100)
  // ─────────────────────────────────────────────
  const CONFIG = {
    templatePath: 'admit-card-template.jpeg',   // ← path to your template (can be overridden)

    fields: {
      // { x, y } as % of image dimensions. font is px at full resolution.
      photo:           { x: 74,  y: 25, width: 15, height: 10 },
      rollNumber:       { x: 30,  y: 28, font: 'bold 12px serif',      color: '#000000', align: 'left' },
      studentName:      { x: 30,  y: 30, font: 'bold 12px serif',      color: '#000000', align: 'left' },
      fatherName:       { x: 30,  y: 32, font: '12px serif',           color: '#000000', align: 'left' },
      motherName:       { x: 30,  y: 34, font: '12px serif',           color: '#000000', align: 'left' },
      courseName:       { x: 23,  y: 40.6, font: '12px serif',           color: '#000000', align: 'left' },
      instituteName:    { x: 23,  y: 47.5, font: '12px serif',           color: '#000000', align: 'left' },
      examCenterAddress:{ x: 28,  y: 52.5, font: '12px serif',           color: '#000000', align: 'left' },
      examDate:         { x: 43,  y: 57.8, font: 'bold 12px serif',      color: '#000000', align: 'left' },
      examTime:         { x: 43,  y: 59.8, font: 'bold 12px serif',      color: '#000000', align: 'left' },
      reportingTime:    { x: 43,  y: 61.8, font: '12px serif',           color: '#000000', align: 'left' },
      examDuration:     { x: 43,  y: 63.8, font: '12px serif',           color: '#000000', align: 'left' },
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
      _canvas = document.getElementById('admitCardCanvas');
      if (!_canvas) {
        // Create a hidden canvas dynamically if not found
        _canvas = document.createElement('canvas');
        _canvas.id = 'admitCardCanvas';
        _canvas.style.display = 'none';
        document.body.appendChild(_canvas);
      }
      if (_canvas) {
        _ctx = _canvas.getContext('2d');
      }
    }
    console.log('Canvas initialized:', { canvas: !!_canvas, ctx: !!_ctx });
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

  function _drawField(field, text) {
    if (!text || !_ctx) return;
    const W = _canvas.width, H = _canvas.height;
    _ctx.save();
    _ctx.font      = field.font;
    _ctx.fillStyle = field.color;
    _ctx.textAlign = field.align || 'left';
    _ctx.fillText(text, _pct(field.x, W), _pct(field.y, H));
    _ctx.restore();
  }

  // ─────────────────────────────────────────────
  // Core render function
  // admitCard = { rollNumber, studentName, fatherName, motherName, courseName, instituteName, examCenterAddress, examDate, examTime, reportingTime, examDuration }
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // Core render function
  // admitCard = { rollNumber, studentName, fatherName, motherName, courseName, instituteName, examCenterAddress, examDate, examTime, reportingTime, examDuration, photo }
  // ─────────────────────────────────────────────
  async function _render(admitCard) {
    if (!_templateImg) throw new Error('Template not loaded. Call AdmitCardGenerator.loadTemplate() first.');
    if (!_initCanvas()) throw new Error('Canvas not found. Make sure <canvas id="admitCardCanvas"> exists.');

    _canvas.width  = _templateImg.naturalWidth;
    _canvas.height = _templateImg.naturalHeight;

    // Draw template background
    _ctx.drawImage(_templateImg, 0, 0);

    // Draw student photo if available
    if (admitCard.photo) {
      try {
        const photoImg = await _loadImage(admitCard.photo);
        if (photoImg) {
          const photoField = CONFIG.fields.photo;
          if (photoField) {
            const x = _pct(photoField.x, _canvas.width);
            const y = _pct(photoField.y, _canvas.height);
            const w = _pct(photoField.width, _canvas.width);
            const h = _pct(photoField.height, _canvas.height);
            _ctx.drawImage(photoImg, x, y, w, h);
          }
        }
      } catch (e) {
        console.warn('Could not load student photo:', e);
      }
    }

    // Overlay fields
    _drawField(CONFIG.fields.rollNumber,       admitCard.rollNumber);
    _drawField(CONFIG.fields.studentName,      admitCard.studentName);
    _drawField(CONFIG.fields.fatherName,       admitCard.fatherName);
    _drawField(CONFIG.fields.motherName,       admitCard.motherName);
    _drawField(CONFIG.fields.courseName,       admitCard.courseName);
    _drawField(CONFIG.fields.instituteName,    admitCard.instituteName);
    _drawField(CONFIG.fields.examCenterAddress,admitCard.examCenterAddress);
    _drawField(CONFIG.fields.examDate,         _fmtDate(admitCard.examDate));
    _drawField(CONFIG.fields.examTime,         admitCard.examTime);
    _drawField(CONFIG.fields.reportingTime,    admitCard.reportingTime);
    _drawField(CONFIG.fields.examDuration,     admitCard.examDuration);

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
    return (name || 'admit-card').replace(/[^a-z0-9_\-]/gi, '_');
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
     *   await AdmitCardGenerator.loadTemplate('/assets/admit_template.jpg');
     */
    loadTemplate(pathOrDataURL) {
      return new Promise((resolve, reject) => {
        _initCanvas();
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => { _templateImg = img; resolve(img); };
        img.onerror = (e) => { console.error('Image load error:', e); reject(new Error('Failed to load template: ' + (pathOrDataURL || CONFIG.templatePath))); };
        const src = pathOrDataURL || CONFIG.templatePath;
        console.log('Loading image from:', src);
        img.src = src;
      });
    },

    /**
     * Download a single student's admit card as a PDF.
     * @param {Object} admitCard — { rollNumber, studentName, fatherName, motherName, courseName, instituteName, examCenterAddress, examDate, examTime, reportingTime, examDuration }
     *
     * Example:
     *   AdmitCardGenerator.download({
     *     rollNumber: 'R-2024-001',
     *     studentName: 'Ramesh Kumar',
     *     fatherName: 'Suresh Kumar',
     *     motherName: 'Kamla Devi',
     *     courseName: 'Diploma in Computer Application',
     *     instituteName: 'SGCSC Institute',
     *     examCenterAddress: 'SGCSC Exam Center, Delhi',
     *     examDate: '2024-04-15',
     *     examTime: '10:00 AM - 12:00 PM',
     *     reportingTime: '09:00 AM',
     *     examDuration: '2 Hours'
     *   });
     */
    async download(admitCard) {
      try {
        await _render(admitCard);
        const pdf = _canvasToPDF();
        pdf.save(`admit-card_${_safeName(admitCard.rollNumber || admitCard.studentName)}.pdf`);
      } catch (err) {
        console.error('AdmitCardGenerator.download error:', err);
        alert('Failed to generate PDF: ' + err.message);
      }
    },

    /**
     * Preview a single student's admit card, returns canvas blob.
     * @param {Object} admitCard — same as download()
     * @returns {Promise<Blob>}
     */
    async preview(admitCard) {
      return new Promise(async (resolve, reject) => {
        try {
          await _render(admitCard);
          _canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.95);
        } catch (err) {
          reject(err);
        }
      });
    },

    /**
     * Download multiple admit cards as PDFs (one by one).
     * @param {Array} admitCards — array of admit card objects
     * @param {number} delayMs — delay between downloads (default 500ms)
     */
    async downloadAll(admitCards, delayMs = 500) {
      if (!Array.isArray(admitCards) || admitCards.length === 0) {
        console.warn('No admit cards to download');
        return;
      }

      for (let i = 0; i < admitCards.length; i++) {
        try {
          _render(admitCards[i]);
          const pdf = _canvasToPDF();
          pdf.save(`admit-card_${_safeName(admitCards[i].rollNumber || admitCards[i].studentName || i)}.pdf`);
          // Small delay to prevent browser blocking multiple downloads
          if (i < admitCards.length - 1) {
            await new Promise(r => setTimeout(r, delayMs));
          }
        } catch (err) {
          console.error(`Error generating admit card ${i}:`, err);
        }
      }
    },

    /**
     * Update field position configuration.
     * @param {Object} newFields — partial fields object to override defaults
     *
     * Example:
     *   AdmitCardGenerator.updateConfig({
     *     fields: {
     *       studentName: { x: 30, y: 35, font: 'bold 24px serif', color: '#000000' }
     *     }
     *   });
     */
    updateConfig(newConfig) {
      if (newConfig && newConfig.fields) {
        Object.assign(CONFIG.fields, newConfig.fields);
      }
      if (newConfig && newConfig.templatePath) {
        CONFIG.templatePath = newConfig.templatePath;
      }
    },

    /**
     * Get current configuration (useful for debugging).
     */
    getConfig() {
      return JSON.parse(JSON.stringify(CONFIG));
    }
  };
})();
}
