const pdf = require('pdfkit');
const fs = require('fs');

let pdfDoc = new pdf();
pdfDoc.pipe(fs.createWriteStream('meriPdf.pdf'));
pdfDoc.text("Hello bhaiko");