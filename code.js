
/**
 * GOOGLE APPS SCRIPT CODE
 * Copy this into a new project at script.google.com
 */

function doGet(e) {
  const action = e.parameter.action;
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const dataSheet = ss.getSheetByName('Data');
    const schoolListSheet = ss.getSheetByName('SchoolList');
    
    if (!dataSheet || !schoolListSheet) {
      return createJsonResponse({ 
        success: false, 
        message: "Sheet 'Data' or 'SchoolList' not found. Please ensure sheet names are exact." 
      });
    }

    const remainingSchools = getUncommonSchools(dataSheet, schoolListSheet);

    if (action === 'getData') {
      return createJsonResponse({ 
        success: true, 
        data: remainingSchools 
      });
    } else if (action === 'getPdf') {
      const pdfBase64 = generatePdfBase64(remainingSchools);
      return createJsonResponse({ 
        success: true, 
        pdfBase64: pdfBase64 
      });
    }

    return createJsonResponse({ success: false, message: "Invalid action" });
    
  } catch (error) {
    return createJsonResponse({ success: false, message: error.toString() });
  }
}

/**
 * Compares SchoolList vs Data and finds schools in SchoolList not in Data
 */
function getUncommonSchools(dataSheet, schoolListSheet) {
  const dataValues = dataSheet.getDataRange().getValues();
  const schoolListValues = schoolListSheet.getDataRange().getValues();
  
  const recordedKeys = new Set();
  dataValues.forEach((row, index) => {
    if (index === 0) return; // Skip header
    recordedKeys.add(`${row[0]}|${row[1]}`.trim().toLowerCase());
  });
  
  const remaining = [];
  schoolListValues.forEach((row, index) => {
    if (index === 0) return; // Skip header
    const key = `${row[0]}|${row[1]}`.trim().toLowerCase();
    if (!recordedKeys.has(key) && row[0] && row[1]) {
      remaining.push({
        name: row[0],
        nyayPanchayat: row[1]
      });
    }
  });
  
  return remaining;
}

/**
 * Generates an HTML based PDF and returns Base64
 */
function generatePdfBase64(schools) {
  let html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #2563eb; text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          p { text-align: right; font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f8fafc; color: #475569; border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 13px; }
          td { border: 1px solid #e2e8f0; padding: 10px; font-size: 12px; }
          tr:nth-child(even) { background-color: #fdfdfd; }
          .footer { margin-top: 40px; font-size: 10px; text-align: center; color: #999; }
        </style>
      </head>
      <body>
        <h1>Remaining Schools Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Schools: ${schools.length}</p>
        <table>
          <thead>
            <tr>
              <th style="width: 10%">#</th>
              <th style="width: 50%">Nyay Panchayat</th>
              <th style="width: 40%">School Name</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  schools.forEach((school, i) => {
    html += `
      <tr>
        <td>${i + 1}</td>
        <td><b>${school.name}</b></td>
        <td>${school.nyayPanchayat}</td>
      </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
        <div class="footer">
          School Disparity Checker System &copy; ${new Date().getFullYear()}
        </div>
      </body>
    </html>
  `;
  
  const blob = HtmlService.createHtmlOutput(html).getAs('application/pdf');
  return Utilities.base64Encode(blob.getBytes());
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
