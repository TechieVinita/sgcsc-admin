// ╔══════════════════════════════════════════════════════════════╗
// ║           MARKSHEET GENERATOR — DROP-IN MODULE              ║
// ║                                                              ║
// ║  SETUP (do once):                                            ║
// ║    MarksheetGenerator.loadTemplate('path/to/template.jpg')  ║
// ║                                                              ║
// ║  GENERATE (call whenever you have student data):             ║
// ║    MarksheetGenerator.download({ ...marksheetData })         ║
// ║    MarksheetGenerator.preview({ ...marksheetData })  ← blob  ║
// ║    MarksheetGenerator.downloadAll([ ...marksheets ])         ║
// ╚══════════════════════════════════════════════════════════════╝

// Prevent re-declaration if already defined
if (typeof MarksheetGenerator !== 'undefined') {
  console.warn('MarksheetGenerator already defined, skipping re-declaration');
} else {
var MarksheetGenerator = (() => {

  // ─────────────────────────────────────────────
  // CONFIGURATION — adjust positions to your JPG
  // All positions are percentage of image width/height (0–100)
  // ─────────────────────────────────────────────
  const CONFIG = {
    templatePath: 'marksheet-template.jpeg',   // ← path to your template (can be overridden)

    fields: {
      // { x, y } as % of image dimensions. font is px at full resolution.
      enrollmentNo:       { x: 30,  y: 15, font: 'bold 150px serif',      color: '#000000', align: 'left' },
      rollNumber:         { x: 73,  y: 28.5, font: 'bold 150px serif',    color: '#000000', align: 'left' },
      studentName:        { x: 30,  y: 25.5, font: 'bold 150px serif',    color: '#000000', align: 'left' },
      fatherName:         { x: 30,  y: 28.4, font: '150px serif',         color: '#000000', align: 'left' },
      motherName:         { x: 30,  y: 31.3, font: '150px serif',         color: '#000000', align: 'left' },
      dob:                { x: 73,  y: 31.2, font: '150px serif',         color: '#000000', align: 'left' },
      courseName:         { x: 30,  y: 37, font: '150px serif',           color: '#000000', align: 'left' },
      courseDuration:     { x: 73,  y: 25.5, font: '150px serif',        color: '#000000', align: 'left' },
      coursePeriodFrom:   { x: 30,  y: 34, font: '150px serif',           color: '#000000', align: 'left' },
      coursePeriodTo:     { x: 49,  y: 34, font: '150px serif',           color: '#000000', align: 'left' },
      instituteName:      { x: 30,  y: 39.8, font: '150px serif',        color: '#000000', align: 'left' },
      dateOfIssue:        { x: 19,  y: 92.5, font: '150px serif',        color: '#000000', align: 'left' },

      // Subject marks will be rendered dynamically
      subjectsStartY:     65,  // Starting Y position for subjects table
      subjectRowHeight:   15,   // Height of each subject row (increased 5x)
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
      _canvas = document.getElementById('marksheetCanvas');
      if (!_canvas) {
        // Create a hidden canvas dynamically if not found
        _canvas = document.createElement('canvas');
        _canvas.id = 'marksheetCanvas';
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
  // marksheet = { studentName, fatherName, motherName, courseName, instituteName, rollNumber, dob, coursePeriodFrom, coursePeriodTo, courseDuration, subjects, dateOfIssue }
  // ─────────────────────────────────────────────
  async function _render(marksheet) {
    if (!_initCanvas()) throw new Error('Canvas not found. Make sure <canvas id="marksheetCanvas"> exists.');

    // If template is not loaded, create a default white background
    if (!_templateImg) {
      console.warn('Template not loaded, using default white background');
      _canvas.width = 2480; // A4 width at 300 DPI
      _canvas.height = 3508; // A4 height at 300 DPI
      _ctx.fillStyle = '#FFFFFF';
      _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
    } else {
      _canvas.width  = _templateImg.naturalWidth;
      _canvas.height = _templateImg.naturalHeight;
      // Draw template background
      _ctx.drawImage(_templateImg, 0, 0);
    }

    // Draw student details
    _drawField(CONFIG.fields.rollNumber, marksheet.rollNumber);
    _drawField(CONFIG.fields.studentName, marksheet.studentName);
    _drawField(CONFIG.fields.fatherName, marksheet.fatherName);
    _drawField(CONFIG.fields.motherName, marksheet.motherName);
    _drawField(CONFIG.fields.dob, _fmtDate(marksheet.dob));
    _drawField(CONFIG.fields.courseName, marksheet.courseName);
    _drawField(CONFIG.fields.courseDuration, marksheet.courseDuration);
    _drawField(CONFIG.fields.coursePeriodFrom, _fmtDate(marksheet.coursePeriodFrom));
    _drawField(CONFIG.fields.coursePeriodTo, _fmtDate(marksheet.coursePeriodTo));
    _drawField(CONFIG.fields.instituteName, marksheet.instituteName);
    _drawField(CONFIG.fields.dateOfIssue, _fmtDate(marksheet.dateOfIssue));

    // Draw subjects table
    if (marksheet.subjects && Array.isArray(marksheet.subjects)) {
      const W = _canvas.width, H = _canvas.height;
      const startY = _pct(CONFIG.fields.subjectsStartY, H);
      const rowHeight = _pct(CONFIG.fields.subjectRowHeight, H);

      marksheet.subjects.forEach((subject, index) => {
        const y = startY + (index * rowHeight);

        // Draw subject number
        _ctx.save();
        _ctx.font = '150px serif';
        _ctx.fillStyle = '#000000';
        _ctx.textAlign = 'left';
        _ctx.fillText(`${index + 1}.`, _pct(10, W), y);
        _ctx.restore();

        // Draw subject name
        _ctx.save();
        _ctx.font = '150px serif';
        _ctx.fillStyle = '#000000';
        _ctx.textAlign = 'left';
        _ctx.fillText(subject.subjectName || '-', _pct(15, W), y);
        _ctx.restore();

        // Draw theory marks
        _ctx.save();
        _ctx.font = '150px serif';
        _ctx.fillStyle = '#000000';
        _ctx.textAlign = 'center';
        _ctx.fillText(`${subject.theoryMarks || 0}`, _pct(50, W), y);
        _ctx.restore();

        // Draw practical marks
        _ctx.save();
        _ctx.font = '150px serif';
        _ctx.fillStyle = '#000000';
        _ctx.textAlign = 'center';
        _ctx.fillText(`${subject.practicalMarks || 0}`, _pct(65, W), y);
        _ctx.restore();

        // Draw combined marks
        _ctx.save();
        _ctx.font = '150px serif';
        _ctx.fillStyle = '#000000';
        _ctx.textAlign = 'center';
        _ctx.fillText(`${subject.combinedMarks || 0}`, _pct(80, W), y);
        _ctx.restore();
      });
    }

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
    return (name || 'marksheet').replace(/[^a-z0-9_\-]/gi, '_');
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
     *   await MarksheetGenerator.loadTemplate('/assets/marksheet_template.jpg');
     */
    loadTemplate(pathOrDataURL) {
      return new Promise((resolve, reject) => {
        _initCanvas();
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload  = () => {
          console.log('Template loaded successfully:', img.naturalWidth, 'x', img.naturalHeight);
          _templateImg = img;
          resolve(img);
        };
        img.onerror = (e) => {
          console.error('Template image failed to load from:', pathOrDataURL || CONFIG.templatePath, 'Error:', e);
          // Don't reject, allow generation with default background
          _templateImg = null;
          resolve(null);
        };
        const src = pathOrDataURL || CONFIG.templatePath;
        console.log('Attempting to load marksheet template from:', src);
        img.src = src;
      });
    },

    /**
     * Download a single student's marksheet as a PDF.
      * @param {Object} marksheet — { studentName, fatherName, motherName, courseName, instituteName, rollNumber, dob, coursePeriodFrom, coursePeriodTo, courseDuration, subjects, dateOfIssue }
     *
     * Example:
      *   MarksheetGenerator.download({
      *     studentName: 'Ramesh Kumar',
     *     fatherName: 'Suresh Kumar',
     *     motherName: 'Kamla Devi',
     *     courseName: 'Diploma in Computer Application',
     *     instituteName: 'SGCSC Institute',
     *     rollNumber: 'R-2024-001',
     *     dob: '2000-01-15',
     *     coursePeriodFrom: '2023-04-01',
     *     coursePeriodTo: '2024-03-31',
     *     courseDuration: '1 Year',
     *     subjects: [...],
     *     totalTheoryMarks: 450,
     *     totalPracticalMarks: 100,
     *     totalCombinedMarks: 550,
     *     maxTotalMarks: 600,
     *     percentage: 91.67,
     *     overallGrade: 'A+'
     *   });
     */
    async download(marksheet) {
      try {
        await _render(marksheet);
        const pdf = _canvasToPDF();
        pdf.save(`marksheet_${_safeName(marksheet.rollNumber || marksheet.studentName)}.pdf`);
      } catch (err) {
        console.error('MarksheetGenerator.download error:', err);
        alert('Failed to generate PDF: ' + err.message);
      }
    },

    /**
     * Preview a single student's marksheet, returns canvas blob.
     * @param {Object} marksheet — same as download()
     * @returns {Promise<Blob>}
     */
    async preview(marksheet) {
      return new Promise(async (resolve, reject) => {
        try {
          await _render(marksheet);
          _canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.95);
        } catch (err) {
          reject(err);
        }
      });
    },

    /**
     * Get data URL for preview display.
     * @param {Object} marksheet — same as download()
     * @returns {Promise<string>} Data URL
     */
    async getDataURL(marksheet) {
      try {
        await _render(marksheet);
        return _canvas.toDataURL('image/jpeg', 0.95);
      } catch (err) {
        console.error('MarksheetGenerator.getDataURL error:', err);
        throw err;
      }
    },

    /**
     * Download multiple marksheets as PDFs (one by one).
     * @param {Array} marksheets — array of marksheet objects
     * @param {number} delayMs — delay between downloads (default 500ms)
     */
    async downloadAll(marksheets, delayMs = 500) {
      if (!Array.isArray(marksheets) || marksheets.length === 0) {
        console.warn('No marksheets to download');
        return;
      }

      for (let i = 0; i < marksheets.length; i++) {
        try {
          _render(marksheets[i]);
          const pdf = _canvasToPDF();
          pdf.save(`marksheet_${_safeName(marksheets[i].rollNumber || marksheets[i].studentName || i)}.pdf`);
          // Small delay to prevent browser blocking multiple downloads
          if (i < marksheets.length - 1) {
            await new Promise(r => setTimeout(r, delayMs));
          }
        } catch (err) {
          console.error(`Error generating marksheet ${i}:`, err);
        }
      }
    },

    /**
     * Update field position configuration.
     * @param {Object} newFields — partial fields object to override defaults
     *
     * Example:
     *   MarksheetGenerator.updateConfig({
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
    },

    /**
     * Fetch configuration from API and apply to fields.
     * @param {string} apiBaseUrl — base URL for API (default '/api/settings')
     */
    async fetchConfigFromAPI(apiBaseUrl = '/api/settings') {
      try {
        const response = await fetch(`${apiBaseUrl}/certificate-template`);
        const data = await response.json();
        if (data.success && data.data && data.data.marksheet) {
          CONFIG.fields = { ...CONFIG.fields, ...data.data.marksheet };
          console.log('Template config loaded from API:', CONFIG.fields);
          return true;
        }
      } catch (err) {
        console.warn('Failed to fetch template config from API:', err);
      }
      return false;
    }
  };
})();
}
