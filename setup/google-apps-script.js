/**
 * YourIT.Team — Google Apps Script
 *
 * HOW TO DEPLOY:
 * 1. Go to https://sheets.google.com and create a new spreadsheet.
 *    Name it something like "YourIT.Team - Contact Leads".
 *
 * 2. In the spreadsheet, click Extensions > Apps Script.
 *
 * 3. Delete any existing code in the editor and paste ALL of this file.
 *
 * 4. Click Deploy > New deployment.
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    Click Deploy, authorise when prompted, then copy the Web App URL.
 *
 * 5. In js/main.js, replace 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' with that URL.
 *
 * 6. Commit and push — form submissions will now appear in the sheet automatically.
 */

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Write header row the first time
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'First Name',
        'Last Name',
        'Email',
        'Company',
        'Phone',
        'Service',
        'Message',
        'Timeline',
        'Consent',
      ]);
    }

    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date().toLocaleString('en-GB', { timeZone: 'UTC' }),
      data.firstName || '',
      data.lastName  || '',
      data.email     || '',
      data.company   || '',
      data.phone     || '',
      data.service   || '',
      data.message   || '',
      data.timeline  || '',
      data.consent   || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
