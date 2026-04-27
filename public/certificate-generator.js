// ╔══════════════════════════════════════════════════════════════╗
// ║           CERTIFICATE GENERATOR — DROP-IN MODULE            ║
// ║                                                              ║
// ║  SETUP (do once):                                            ║
// ║    CertificateGenerator.loadTemplate('path/to/template.jpg') ║
// ║                                                              ║
// ║  GENERATE (call whenever you have student data):             ║
// ║    CertificateGenerator.download({ ...studentData })         ║
// ║    CertificateGenerator.preview({ ...studentData }) ← blob  ║
// ║    CertificateGenerator.downloadAll([ ...students ])         ║
// ╚══════════════════════════════════════════════════════════════╝

var CertificateGenerator = (() => {

   // ─────────────────────────────────────────────
   // CONFIGURATION — adjust these positions to match your JPG template
   // All positions are percentage of image width/height (0–100)
   // x: horizontal position (0 = left edge, 100 = right edge)
   // y: vertical position (0 = top edge, 100 = bottom edge)
   // ─────────────────────────────────────────────
   const CONFIG = {
     templatePath: 'student-certificate-template.jpeg',   // ← path to your template (can be overridden)

      fields: {
        // { x, y } as % of image dimensions. font scales with canvas size.
        // Photo field requires x, y, width, height (all percentages)
        photo:                { x: 20,  y: 25, width: 18, height: 22 },
        atcName:              { x: 18,  y: 52.7, font: '60px serif', color: '#000000', align: 'left' },
        studentNameCombined:  { x: 50,  y: 49,  font: '60px serif', color: '#000000', align: 'center' },
        courseName:           { x: 50,  y: 58.5, font: '60px serif', color: '#000000', align: 'center' },
        grade:                { x: 56.5, y: 55.5, font: '50px serif', color: '#000000', align: 'left' },
        gradeExtra:           { x: 80,  y: 76.3, font: '60px serif', color: '#000000', align: 'left' },
        courseDuration:       { x: 54,  y: 61.5, font: '60px serif', color: '#000000', align: 'left' },
        coursePeriodFrom:     { x: 41.5, y: 64.3, font: '55px serif', color: '#000000', align: 'left' },
        coursePeriodTo:       { x: 61,  y: 64.3, font: '55px serif', color: '#000000', align: 'left' },
        certificateNumber:    { x: 23,  y: 93,  font: '40px serif', color: '#000000', align: 'left' },
        dateOfIssue:          { x: 55,  y: 93,  font: '40px serif', color: '#000000', align: 'left' },
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
       if (!_canvas) {
         // Create a hidden canvas dynamically if not found
         _canvas = document.createElement('canvas');
         _canvas.id = 'certCanvas';
         _canvas.style.display = 'none';
         _canvas.width = 800;  // Default size
         _canvas.height = 600;
         document.body.appendChild(_canvas);
         console.log('Created new canvas element');
       }
       if (_canvas && !_ctx) {
         _ctx = _canvas.getContext('2d');
         console.log('Got canvas context');
       }
     }
     console.log('Canvas initialized:', { canvas: !!_canvas, ctx: !!_ctx, width: _canvas?.width, height: _canvas?.height });
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

    // Helper to load an image from URL with timeout
    function _loadImage(src, timeout = 10000) {
      return new Promise((resolve, reject) => {
        if (!src) {
          resolve(null);
          return;
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Set up timeout
        const timer = setTimeout(() => {
          img.src = ''; // Cancel loading
          reject(new Error(`Image load timeout after ${timeout}ms: ${src}`));
        }, timeout);

        img.onload = () => {
          clearTimeout(timer);
          resolve(img);
        };
        img.onerror = () => {
          clearTimeout(timer);
          reject(new Error('Failed to load image: ' + src));
        };
        img.src = src;
      });
    }

   function _drawField(field, text) {
     if (!text || !_ctx) return;
     const W = _canvas.width, H = _canvas.height;
     _ctx.save();

     // Handle font size - if percentage, calculate based on canvas height
     let fontSize = field.font;
     if (typeof field.font === 'string' && field.font.includes('%')) {
       const percent = parseFloat(field.font.replace('%', ''));
       fontSize = Math.floor((percent / 100) * H) + 'px serif';
     }

     _ctx.font      = fontSize;
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

   // Helper to draw photo (handles width/height)
   function _drawPhoto(img) {
     if (!img || !_ctx) return;
     const photoField = CONFIG.fields.photo;
     if (!photoField) return;

     const W = _canvas.width, H = _canvas.height;
     const x = _pct(photoField.x, W);
     const y = _pct(photoField.y, H);
     const w = _pct(photoField.width, W);
     const h = _pct(photoField.height, H);

     // Draw photo with clipping
     _ctx.save();
     _ctx.beginPath();
     _ctx.rect(x, y, w, h);
     _ctx.clip();
     _ctx.drawImage(img, x, y, w, h);
     _ctx.restore();
   }

  // ─────────────────────────────────────────────
  // Core render function
  // student = { atcName, studentNameCombined, courseName, grade, courseDuration, coursePeriodFrom, coursePeriodTo, certificateNumber, dateOfIssue, photo }
  // ─────────────────────────────────────────────
   async function _render(studentOrRoll) {
    const student = _resolveStudentData(studentOrRoll);
    console.log('_render called with student:', student);
    if (!_templateImg) {
      console.warn('Template not loaded, creating fallback background');
      // Create fallback white background
      if (!_initCanvas()) {
        throw new Error('Canvas not found. Make sure <canvas id="certCanvas"> exists.');
      }
      _canvas.width = 1417; // Standard A4-like dimensions
      _canvas.height = 2000;
      _ctx.fillStyle = '#FFFFFF';
      _ctx.fillRect(0, 0, _canvas.width, _canvas.height);
      _ctx.fillStyle = '#000000';
      _ctx.font = '48px serif';
      _ctx.textAlign = 'center';
      _ctx.fillText('CERTIFICATE', _canvas.width / 2, 100);
      console.log('Fallback background created');
    } else {
      if (!_templateImg.complete || _templateImg.naturalWidth === 0) {
        console.error('Template image not fully loaded or corrupted');
        throw new Error('Template image not fully loaded or corrupted');
      }
    }

    if (!_initCanvas()) {
      console.error('Canvas not found. Make sure <canvas id="certCanvas"> exists.');
      throw new Error('Canvas not found. Make sure <canvas id="certCanvas"> exists.');
    }

      console.log('Canvas initialized, dimensions:', _canvas.width, 'x', _canvas.height);
     console.log('Template image dimensions:', _templateImg.naturalWidth, 'x', _templateImg.naturalHeight);

     console.log('Resizing canvas...');
     _canvas.width  = _templateImg.naturalWidth;
     _canvas.height = _templateImg.naturalHeight;

     console.log('Canvas resized to:', _canvas.width, 'x', _canvas.height);

     console.log('Drawing template background...');
     _ctx.drawImage(_templateImg, 0, 0);
     console.log('Template background drawn');

    // Draw student photo if available
    if (student.photo) {
      console.log('Drawing student photo on certificate:', student.photo);
      try {
        const photoImg = await _loadImage(student.photo, 5000); // 5 second timeout for photos
        if (photoImg) {
          console.log('Photo loaded successfully, dimensions:', photoImg.width, 'x', photoImg.height);
          _drawPhoto(photoImg);
        } else {
          console.log('Photo image failed to load');
        }
      } catch (e) {
        console.warn('Could not load student photo (continuing without photo):', e.message);
      }
    } else {
      console.log('No photo available in student data');
    }

    // Overlay fields
    _drawField(CONFIG.fields.atcName,             student.atcName);
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
   // Helper to resolve student data from roll number or object
   // ─────────────────────────────────────────────
   function _resolveStudentData(studentOrRoll) {
     if (typeof studentOrRoll === 'string') {
       if (typeof window !== 'undefined' && window.StudentDB) {
         const found = window.StudentDB.find(studentOrRoll);
         if (found) {
          return {
            atcName: found.atcName || found.atcCode || '',
            studentNameCombined: found.studentName || found.applicantName || '',
            courseName: found.courseName || '',
            grade: found.grade || '',
            courseDuration: found.courseDuration || '',
            coursePeriodFrom: found.coursePeriodFrom || '',
            coursePeriodTo: found.coursePeriodTo || '',
            certificateNumber: found.certificateNumber || '',
            dateOfIssue: found.dateOfIssue || '',
            photo: found.photo || ''
          };
         }
         console.warn('No student found with lookup:', studentOrRoll);
         return { studentNameCombined: studentOrRoll };
       }
       console.warn('StudentDB not available');
       return { studentNameCombined: studentOrRoll };
     }
     return studentOrRoll || {};
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
    loadTemplate(pathOrDataURL, timeout = 5000) { // Reduced timeout for faster failure
      return new Promise((resolve, reject) => {
        _initCanvas();
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // Set up timeout
        const timer = setTimeout(() => {
          img.src = ''; // Cancel loading
          reject(new Error(`Template load timeout after ${timeout}ms: ${pathOrDataURL || CONFIG.templatePath}`));
        }, timeout);

        img.onload  = () => {
          clearTimeout(timer);
          console.log('Template loaded successfully, dimensions:', img.naturalWidth, 'x', img.naturalHeight);

          // Check if image is too large and scale it down if needed
          const maxDimension = 3000; // Allow larger images but not extremely large ones
          if (img.naturalWidth > maxDimension || img.naturalHeight > maxDimension) {
            console.warn(`Template image is very large (${img.naturalWidth}x${img.naturalHeight}). Scaling down for performance.`);

            // Create a scaled version
            const scale = Math.min(maxDimension / img.naturalWidth, maxDimension / img.naturalHeight);
            const scaledWidth = Math.floor(img.naturalWidth * scale);
            const scaledHeight = Math.floor(img.naturalHeight * scale);

            console.log(`Scaling template from ${img.naturalWidth}x${img.naturalHeight} to ${scaledWidth}x${scaledHeight}`);

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = scaledWidth;
            tempCanvas.height = scaledHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

            // Create a new image from the scaled canvas
            const scaledImg = new Image();
            scaledImg.onload = () => {
              _templateImg = scaledImg;
              console.log('Template scaled successfully, new dimensions:', scaledImg.naturalWidth, 'x', scaledImg.naturalHeight);
              console.log('Scale factor used:', scale);
              resolve(scaledImg);
            };
            scaledImg.onerror = () => {
              console.error('Failed to create scaled template image, using original');
              _templateImg = img;
              resolve(img);
            };
            scaledImg.src = tempCanvas.toDataURL('image/jpeg', 0.95);
          } else {
            _templateImg = img;
            resolve(img);
          }
        };
        img.onerror = (e) => {
          clearTimeout(timer);
          console.warn('Failed to load template:', pathOrDataURL, '- will use fallback background');
          _templateImg = null; // Allow fallback rendering
          resolve(null);
        };
        img.src = pathOrDataURL || CONFIG.templatePath;
      });
    },

      /**
       * Get a Blob URL of the certificate (for <img> preview or custom handling).
       * @param {Object} student — { atcName, studentNameCombined, courseName, grade, courseDuration, coursePeriodFrom, coursePeriodTo, certificateNumber, dateOfIssue, photo }
       * @returns {string} dataURL — base64 data URL for image preview
       *
       * Example:
       *   const url = await CertificateGenerator.preview({ ...studentData });
       *   document.getElementById('preview').src = url;
       */
     async preview(studentOrRoll) {
       await _render(studentOrRoll);
       return _canvas.toDataURL('image/jpeg', 0.95);
     },

     /**
      * Get preview as data URL (alias for preview).
      * @param {Object} student
      * @returns {string} dataURL
      */
     async getPreviewURL(studentOrRoll) {
       return this.preview(studentOrRoll);
     },

      /**
       * Get raw canvas data URL (e.g. for embedding in <img> directly).
       * @param {Object} student — { atcName, studentNameCombined, courseName, grade, courseDuration, coursePeriodFrom, coursePeriodTo, certificateNumber, dateOfIssue, photo }
       * @returns {string} dataURL
       */
     async getDataURL(student, quality = 0.6) {
       console.log('getDataURL called with student:', student);
       console.log('Starting _render...');
       await _render(student);
       console.log('Render completed, generating data URL...');
       const dataURL = _canvas.toDataURL('image/jpeg', quality);
       console.log('Data URL generated, length:', dataURL.length);
       return dataURL;
     },

     /**
      * Get compressed data URL for storage (smaller file size)
      * @param {Object} student
      * @returns {string} dataURL
      */
     async getCompressedDataURL(student) {
       return this.getDataURL(student, 0.4);
     },

      /**
       * Download a single student's certificate as a PDF.
       * @param {Object} student — { atcName, studentNameCombined, courseName, grade, courseDuration, coursePeriodFrom, coursePeriodTo, certificateNumber, dateOfIssue, photo }
       *
      * Example:
      *   CertificateGenerator.download({
      *     studentNameCombined: 'Ramesh Kumar S/O Suresh Kumar',
      *     courseName: 'Computer Science',
      *     grade: 'A+',
      *     courseDuration: '4 Years',
      *     coursePeriodFrom: '2020-01-15',
      *     coursePeriodTo: '2024-01-15',
      *     certificateNumber: 'CERT-2024-001',
      *     dateOfIssue: '2024-01-15',
      *     photo: 'https://example.com/photo.jpg'
      *   });
      */
     async download(studentOrRoll) {
       console.log('CertificateGenerator.download called with:', studentOrRoll);
       try {
         await _render(studentOrRoll);
         console.log('_render completed, generating PDF');
         const student = _resolveStudentData(studentOrRoll);
         _canvasToPDF().save(`student_certificate_${_safeName(student.studentNameCombined)}.pdf`);
       } catch (err) {
         console.error('CertificateGenerator.download error:', err);
         alert('Failed to generate PDF: ' + err.message);
       }
     },

      /**
       * Download certificates for ALL students one by one.
       * @param {Array}    students          — array of student objects { atcName, studentNameCombined, courseName, grade, courseDuration, coursePeriodFrom, coursePeriodTo, certificateNumber, dateOfIssue, photo }
       * @param {Function} [onProgress]      — optional callback(current, total)
       *
       * Example:
       *   await CertificateGenerator.downloadAll(students, (i, total) => {
       *     console.log(`${i} of ${total} done`);
       *   });
       */
     async downloadAll(students, onProgress) {
       if (!Array.isArray(students) || students.length === 0) {
         console.warn('No students to download');
         return;
       }

       for (let i = 0; i < students.length; i++) {
         await this.download(students[i]);
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
      *   CertificateGenerator.setField('studentNameCombined', { x: 40, y: 53 });
      */
     setField(fieldName, overrides) {
       if (!CONFIG.fields[fieldName]) throw new Error('Unknown field: ' + fieldName);
       Object.assign(CONFIG.fields[fieldName], overrides);
     },

      /**
       * Update field positions dynamically
       * @param {Object} newFields — field configurations to update
       */
      updateFieldPositions(newFields) {
        if (newFields && typeof newFields === 'object') {
          Object.assign(CONFIG.fields, newFields);
          console.log('Field positions updated:', CONFIG.fields);
        }
      },

      /**
       * Update config (alias for updateFieldPositions)
       * @param {Object} newConfig — { fields: { ... } }
       */
      updateConfig(newConfig) {
        if (newConfig && newConfig.fields) {
          this.updateFieldPositions(newConfig.fields);
        }
      },

     /**
      * Fetch configuration from API and apply to fields.
      * @param {string} apiBaseUrl — base URL for API (default '/api/settings')
      */
     async fetchConfigFromAPI(apiBaseUrl = '/api/settings') {
       try {
         const response = await fetch(`${apiBaseUrl}/certificate-template`);
         const data = await response.json();
         if (data.success && data.data && data.data.studentCertificate) {
           CONFIG.fields = { ...CONFIG.fields, ...data.data.studentCertificate };
           console.log('Template config loaded from API:', CONFIG.fields);
           return true;
         }
       } catch (err) {
         console.warn('Failed to fetch template config from API:', err);
       }
       return false;
     },

      /** Expose config for inspection */
      get config() { return CONFIG; }
    };

})();

window.CertificateGenerator = CertificateGenerator;
