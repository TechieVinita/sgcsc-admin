/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ID CARD GENERATOR
 *  Generates ID Card PDFs from a JPG template
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * HOW TO USE:
 *   1. Load template:   await IDCardGenerator.loadTemplate('/id-card-template.jpeg')
 *   2. Download PDF:   IDCardGenerator.download({ ...idCardData })
 *   3. Preview:        IDCardGenerator.preview({ ...idCardData })  ← blob
 *   4. Update config:  IDCardGenerator.updateConfig({ fields: { ... } })
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // CONFIGURATION — adjust positions to your JPG
  // All positions are percentage of image width/height (0–100)
  // ─────────────────────────────────────────────
  const CONFIG = {
    templatePath: 'id-card-template.jpeg',   // ← path to your template (can be overridden)

    fields: {
      // { x, y } as % of image dimensions. font is px at full resolution.
      // studentName at coordinates (45,49) - center aligned
      studentName:       { x: 49, y: 49, font: '80px serif', color: '#000000', align: 'center' },
      // Session fields - from at (48,28), to at (60,28) with font size 60
      sessionFrom:       { x: 48, y: 28, font: '60px serif', color: '#000000', align: 'left' },
      sessionTo:         { x: 60, y: 28, font: '60px serif', color: '#000000', align: 'left' },
      // Student photo field
      photo:            { x: 35, y: 30, width: 30, height: 17 },
      // Note: No photo field by default - add if needed
      fatherName:        { x: 51, y: 55.5, font: '80px serif', color: '#000000', align: 'left' },
      motherName:        { x: 51, y: 59.5, font: '80px serif', color: '#000000', align: 'left' },
      enrollmentNo:      { x: 51, y: 63, font: '80px serif', color: '#000000', align: 'left' },
      dateOfBirth:       { x: 51, y: 67, font: '80px serif', color: '#000000', align: 'left' },
      contactNo:         { x: 51, y: 71, font: '80px serif', color: '#000000', align: 'left' },
      address:           { x: 51, y: 74.5, font: '60px serif', color: '#000000', align: 'left', maxWidth: 35, lineHeight: 2.0 },
      mobileNo:          { x: 51, y: 82.5, font: '80px serif', color: '#000000', align: 'left' },
      centerMobileNo:    { x: 51, y: 86.5, font: '80px serif', color: '#000000', align: 'left' },
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
      _canvas = document.getElementById('idCardCanvas');
      if (!_canvas) {
        // Create a hidden canvas dynamically if not found
        _canvas = document.createElement('canvas');
        _canvas.id = 'idCardCanvas';
        _canvas.style.display = 'none';
        document.body.appendChild(_canvas);
      }
      if (_canvas) {
        _ctx = _canvas.getContext('2d');
      }
    }
    console.log('ID Card Canvas initialized:', { canvas: !!_canvas, ctx: !!_ctx });
    return _canvas && _ctx;
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  function _fmtDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
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

  function _drawWrappedText(field, text) {
    if (!text || !_ctx) return;
    const W = _canvas.width, H = _canvas.height;
    const maxWidth = _pct(field.maxWidth || 40, W); // Default max width of 40% if not specified
    const lineHeight = _pct(field.lineHeight || 3, H); // Default line height of 3% if not specified
    const x = _pct(field.x, W);
    const y = _pct(field.y, H);

    _ctx.save();
    _ctx.font = field.font;
    _ctx.fillStyle = field.color;
    _ctx.textAlign = field.align || 'left';

    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = _ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        _ctx.fillText(line, x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    _ctx.fillText(line, x, currentY);
    _ctx.restore();
  }

  // ─────────────────────────────────────────────
  // Core render function
  // idCard = { fatherName, motherName, enrollmentNo, dateOfBirth, contactNo, address, mobileNo, centerMobileNo }
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
  // idCard = { fatherName, motherName, enrollmentNo, dateOfBirth, contactNo, address, mobileNo, centerMobileNo, photo }
  // ─────────────────────────────────────────────
  async function _render(idCard) {
    if (!_templateImg) throw new Error('Template not loaded. Call IDCardGenerator.loadTemplate() first.');
    if (!_initCanvas()) throw new Error('Canvas not found. Make sure <canvas id="idCardCanvas"> exists.');

    _canvas.width  = _templateImg.naturalWidth;
    _canvas.height = _templateImg.naturalHeight;

    // Draw template background
    _ctx.drawImage(_templateImg, 0, 0);

    // Draw student photo if available
    if (idCard.photo) {
      console.log('Drawing student photo:', idCard.photo);
      try {
        const photoImg = await _loadImage(idCard.photo);
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
      console.log('No photo available in idCard:', idCard);
    }

    // Overlay fields
    _drawField(CONFIG.fields.studentName, idCard.studentName);
    _drawField(CONFIG.fields.sessionFrom, idCard.sessionFrom);
    _drawField(CONFIG.fields.sessionTo, idCard.sessionTo);
    _drawField(CONFIG.fields.fatherName, idCard.fatherName);
    _drawField(CONFIG.fields.motherName, idCard.motherName);
    _drawField(CONFIG.fields.enrollmentNo, idCard.enrollmentNo);
    _drawField(CONFIG.fields.dateOfBirth, _fmtDate(idCard.dateOfBirth));
    _drawField(CONFIG.fields.contactNo, idCard.contactNo);
    _drawWrappedText(CONFIG.fields.address, idCard.address);
    _drawField(CONFIG.fields.mobileNo, idCard.mobileNo);
    _drawField(CONFIG.fields.centerMobileNo, idCard.centerMobileNo);
  }

  function _canvasToPDF() {
    const { jsPDF } = window.jspdf;
    const W = _canvas.width;
    const H = _canvas.height;
    const pdf = new jsPDF({
      orientation: W > H ? 'landscape' : 'portrait',
      unit: 'px',
      format: [W, H]
    });
    pdf.addImage(_canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, W, H);
    return pdf;
  }

  function _safeName(name) {
    if (!name) return 'id-card';
    return name.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').toLowerCase();
  }

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────
  window.IDCardGenerator = {
    /**
     * Load the template image.
     * @param {string} path — path to the JPG template (default from CONFIG)
     */
    loadTemplate(path) {
      return new Promise((resolve, reject) => {
        const src = path || CONFIG.templatePath;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          _templateImg = img;
          console.log('ID Card template loaded:', img.width, 'x', img.height);
          resolve();
        };
        img.onerror = (err) => {
          console.error('Failed to load ID Card template:', src, err);
          reject(new Error('Failed to load template: ' + src));
        };
        img.src = src;
      });
    },

    /**
     * Download a single student's ID card as a PDF.
     * @param {Object} idCard — { studentName, session, fatherName, motherName, enrollmentNo, dateOfBirth, contactNo, address, mobileNo, centerMobileNo, photo }
     *
     * Example:
     *   IDCardGenerator.download({
     *     fatherName: 'Suresh Kumar',
     *     motherName: 'Kamla Devi',
     *     enrollmentNo: 'ENR-2024-001',
     *     dateOfBirth: '2000-05-15',
     *     contactNo: '1234567890',
     *     address: '123 Main Street, City',
     *     mobileNo: '9876543210',
     *     centerMobileNo: '9999999999',
     *     photo: 'https://...'
     *   });
     */
    async download(idCard) {
      console.log('IDCardGenerator.download called with:', idCard);
      try {
        console.log('Calling _render with photo:', idCard.photo);
        await _render(idCard);
        console.log('_render completed, generating PDF');
        const pdf = _canvasToPDF();
        pdf.save(`id-card_${_safeName(idCard.enrollmentNo || idCard.studentName)}.pdf`);
      } catch (err) {
        console.error('IDCardGenerator.download error:', err);
        alert('Failed to generate PDF: ' + err.message);
      }
    },

    /**
     * Preview a single student's ID card, returns canvas blob.
     * @param {Object} idCard — same as download()
     * @returns {Promise<Blob>}
     */
    async preview(idCard) {
      return new Promise(async (resolve, reject) => {
        try {
          await _render(idCard);
          _canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.95);
        } catch (err) {
          reject(err);
        }
      });
    },

    /**
     * Download multiple ID cards as PDFs (one by one).
     * @param {Array} idCards — array of ID card objects
     * @param {number} delayMs — delay between downloads (default 500ms)
     */
    async downloadAll(idCards, delayMs = 500) {
      if (!Array.isArray(idCards) || idCards.length === 0) {
        console.warn('No ID cards to download');
        return;
      }

      for (let i = 0; i < idCards.length; i++) {
        try {
          await _render(idCards[i]);
          const pdf = _canvasToPDF();
          pdf.save(`id-card_${_safeName(idCards[i].enrollmentNo || idCards[i].studentName || i)}.pdf`);
          // Small delay to prevent browser blocking multiple downloads
          if (i < idCards.length - 1) {
            await new Promise(r => setTimeout(r, delayMs));
          }
        } catch (err) {
          console.error(`Error generating ID card ${i}:`, err);
        }
      }
    },

    /**
     * Update field position configuration.
     * @param {Object} newFields — partial fields object to override defaults
     *
     * Example:
     *   IDCardGenerator.updateConfig({
     *     fields: {
     *       fatherName: { x: 51, y: 55, font: '80px serif', color: '#000000' }
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