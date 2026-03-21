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
    templatePath: 'template.jpeg',   // ← path to your template (can be overridden)

    fields: {
      // { x, y } as % of image dimensions. font is px at full resolution.
      applicantName: { x: 50,  y: 49.5, font: 'bold 29px serif',      color: '#000000', align: 'left' },
      atcCodeMid:   { x: 50,  y: 53.5, font: '24px sans-serif',     color: '#000000', align: 'left' },
      atcCodeBot:   { x: 30,  y: 87.5, font: '12px sans-serif',     color: '#000000', align: 'left' },
      dateOfIssue:  { x: 30,  y: 89.5, font: '12px sans-serif',     color: '#000000', align: 'left' },
      dateOfRenewal:{ x: 30,  y: 91.5, font: '12px sans-serif',     color: '#000000', align: 'left' },
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
  // student = { name, atcCode, dateOfIssue, dateOfRenewal }
  // ─────────────────────────────────────────────
  function _render(student) {
    if (!_templateImg) throw new Error('Template not loaded. Call CertificateGenerator.loadTemplate() first.');
    if (!_initCanvas()) throw new Error('Canvas not found. Make sure <canvas id="certCanvas"> exists.');

    _canvas.width  = _templateImg.naturalWidth;
    _canvas.height = _templateImg.naturalHeight;

    // Draw template background
    _ctx.drawImage(_templateImg, 0, 0);

    // Overlay fields
    _drawField(CONFIG.fields.applicantName,  student.name);
    _drawField(CONFIG.fields.atcCodeMid,     student.atcCode);
    _drawField(CONFIG.fields.atcCodeBot,     student.atcCode);
    _drawField(CONFIG.fields.dateOfIssue,    _fmtDate(student.dateOfIssue));
    _drawField(CONFIG.fields.dateOfRenewal,  _fmtDate(student.dateOfRenewal));

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
        img.onload  = () => { _templateImg = img; resolve(img); };
        img.onerror = () => reject(new Error('Failed to load template: ' + pathOrDataURL));
        img.src = pathOrDataURL || CONFIG.templatePath;
      });
    },

    /**
     * Download a single student's certificate as a PDF.
     * @param {Object} student — { name, atcCode, dateOfIssue, dateOfRenewal }
     *
     * Example:
     *   CertificateGenerator.download({
     *     name: 'Ramesh Kumar',
     *     atcCode: 'ATC-2024-001',
     *     dateOfIssue: '2024-01-15',
     *     dateOfRenewal: '2026-01-15'
     *   });
     */
    download(student) {
      _render(student);
      _canvasToPDF().save(`certificate_${_safeName(student.name)}.pdf`);
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
    getPreviewURL(student) {
      return new Promise((resolve) => {
        _render(student);
        _canvas.toBlob(blob => {
          resolve(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.92);
      });
    },

    /**
     * Get raw canvas data URL (e.g. for embedding in <img> directly).
     * @param {Object} student
     * @returns {string} dataURL
     */
    getDataURL(student) {
      _render(student);
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
