// ╔══════════════════════════════════════════════════════════════╗
// ║       FRANCHISE CERTIFICATE GENERATOR — DROP-IN MODULE      ║
// ║                                                              ║
// ║  SETUP (do once):                                            ║
// ║    FranchiseCertificateGenerator.loadTemplate('path/to/template.jpg') ║
// ║                                                              ║
// ║  TO CUSTOMIZE TEXT POSITIONS:                                ║
// ║    1. Edit CONFIG.fields below with new x,y coordinates     ║
// ║    2. Or call updateFieldPositions({fieldName: {x, y, ...}})║
// ║    3. Coordinates are % of image width/height (0-100)       ║
// ║                                                              ║
// ║  GENERATE (call whenever you have franchise data):           ║
// ║    FranchiseCertificateGenerator.download({ ...franchiseData }) ║
// ║    FranchiseCertificateGenerator.preview({ ...franchiseData }) ← blob ║
// ╚══════════════════════════════════════════════════════════════╝

// Prevent re-declaration if already defined
if (typeof FranchiseCertificateGenerator !== 'undefined') {
  console.warn('FranchiseCertificateGenerator already defined, skipping re-declaration');
} else {
var FranchiseCertificateGenerator = (() => {

  // ─────────────────────────────────────────────
  // CONFIGURATION — adjust these positions to match your JPG template
  // All positions are percentage of image width/height (0–100)
  // x: horizontal position (0 = left edge, 100 = right edge)
  // y: vertical position (0 = top edge, 100 = bottom edge)
  // ─────────────────────────────────────────────
  const CONFIG = {
    templatePath: 'franchise-certificate-template.jpeg',   // ← path to your template (can be overridden)

    fields: {
      // { x, y } as % of image dimensions. font is px at full resolution.
      franchiseName:     { x: 50,  y: 45, font: 'bold 120px serif',      color: '#000000', align: 'center' },
      address:           { x: 50,  y: 55, font: '100px serif',           color: '#000000', align: 'center' },
      applicantName:     { x: 50,  y: 65, font: 'bold 100px serif',     color: '#000000', align: 'center' },
      atcCode:           { x: 50,  y: 75, font: 'bold 80px serif',       color: '#000000', align: 'center' },
      dateOfIssue:       { x: 35,  y: 85, font: '80px serif',           color: '#000000', align: 'left' },
      dateOfRenewal:     { x: 65,  y: 85, font: '80px serif',           color: '#000000', align: 'left' },
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
      _canvas = document.getElementById('franchiseCertCanvas');
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
    } else if (field.align === 'right') {
      _ctx.textAlign = 'right';
      _ctx.fillText(text, _pct(field.x, W), _pct(field.y, H));
    } else {
      // left align (default)
      _ctx.textAlign = 'left';
      _ctx.fillText(text, _pct(field.x, W), _pct(field.y, H));
    }
    _ctx.restore();
  }

  // ─────────────────────────────────────────────
  // Load template image (REQUIRED - JPG template must exist)
  // ─────────────────────────────────────────────
  async function loadTemplate(path = CONFIG.templatePath, customConfig = null) {
    if (!path) throw new Error('Template path required');

    try {
      // Allow overriding field positions via customConfig
      if (customConfig && customConfig.fields) {
        CONFIG.fields = { ...CONFIG.fields, ...customConfig.fields };
      }

      _templateImg = await _loadImage(path);
      if (!_templateImg) {
        throw new Error(`Template image not found at: ${path}. Please ensure the JPG template exists in the public folder.`);
      }

      if (!_initCanvas()) throw new Error('Canvas not available');
      _canvas.width  = _templateImg.width;
      _canvas.height = _templateImg.height;
      _ctx.drawImage(_templateImg, 0, 0);
      console.log(`Template loaded: ${_templateImg.width}x${_templateImg.height}`);
    } catch (err) {
      console.error('Failed to load template:', err);
      throw new Error(`Template loading failed: ${err.message}. Please upload the JPG template to the public folder.`);
    }
  }

  // ─────────────────────────────────────────────
  // Generate certificate data URL
  // ─────────────────────────────────────────────
  async function getDataURL(franchise) {
    if (!_templateImg || !_ctx) {
      throw new Error('Template not loaded. Call loadTemplate() first.');
    }

    // Reset canvas to template
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);
    _ctx.drawImage(_templateImg, 0, 0);

    // franchise = { franchiseName, address, applicantName, atcCode, dateOfIssue, dateOfRenewal }

    _drawField(CONFIG.fields.franchiseName,     franchise.franchiseName);
    _drawField(CONFIG.fields.address,           franchise.address);
    _drawField(CONFIG.fields.applicantName,     franchise.applicantName);
    _drawField(CONFIG.fields.atcCode,           franchise.atcCode);
    _drawField(CONFIG.fields.dateOfIssue,       _fmtDate(franchise.dateOfIssue));
    _drawField(CONFIG.fields.dateOfRenewal,     _fmtDate(franchise.dateOfRenewal));

    return _canvas.toDataURL('image/jpeg', 0.95);
  }

  // ─────────────────────────────────────────────
  // Generate and download single certificate
  // ─────────────────────────────────────────────
  async function download(franchise) {
    const dataURL = await getDataURL(franchise);
    const link = document.createElement('a');
    link.download = `franchise_certificate_${franchise.atcCode || 'unknown'}.jpg`;
    link.href = dataURL;
    link.click();
  }

  // ─────────────────────────────────────────────
  // Get a Blob URL of the certificate (for <img> preview or custom handling)
  // ─────────────────────────────────────────────
  async function preview(franchise) {
    const dataURL = await getDataURL(franchise);
    return dataURL; // It's already a data URL, can be used directly in <img src="">
  }

  // ─────────────────────────────────────────────
  // Generate certificates for ALL franchises one by one
  // ─────────────────────────────────────────────
  async function downloadAll(franchises) {
    if (!Array.isArray(franchises)) throw new Error('franchises must be an array');

    for (const franchise of franchises) {
      await download(franchise);
      // Small delay to prevent browser overload
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // ─────────────────────────────────────────────
  // Update field positions dynamically
  // ─────────────────────────────────────────────
  function updateFieldPositions(newFields) {
    if (newFields && typeof newFields === 'object') {
      CONFIG.fields = { ...CONFIG.fields, ...newFields };
      console.log('Field positions updated:', CONFIG.fields);
    }
  }

  // ─────────────────────────────────────────────
  // Update config (alias for updateFieldPositions)
  // ─────────────────────────────────────────────
  function updateConfig(newConfig) {
    if (newConfig && newConfig.fields) {
      updateFieldPositions(newConfig.fields);
    }
  }

  // ─────────────────────────────────────────────
  // Fetch config from API and apply
  // ─────────────────────────────────────────────
  async function fetchConfigFromAPI(apiBaseUrl = '/api/settings') {
    try {
      const response = await fetch(`${apiBaseUrl}/certificate-template`);
      const data = await response.json();
      if (data.success && data.data && data.data.franchiseCertificate) {
        CONFIG.fields = { ...CONFIG.fields, ...data.data.franchiseCertificate };
        console.log('Template config loaded from API:', CONFIG.fields);
        return true;
      }
    } catch (err) {
      console.warn('Failed to fetch template config from API:', err);
    }
    return false;
  }

  // ─────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────
  return {
    loadTemplate,
    getDataURL,
    download,
    preview,
    downloadAll,
    updateFieldPositions,
    updateConfig,
    fetchConfigFromAPI,
    CONFIG,
  };

})();
}