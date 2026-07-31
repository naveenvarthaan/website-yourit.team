/**
 * YourIT.Team — Google Apps Script
 * Handles BOTH the Contact form and the Careers application form.
 *
 * ── HOW TO UPDATE & RE-AUTHORISE ─────────────────────────────────────────────
 *
 * Step 1 — Replace the code
 *   Open the spreadsheet "Donot Delete this - Website leads"
 *   → Extensions > Apps Script
 *   → Delete all existing code and paste this entire file.
 *   → Click Save (floppy-disk icon).
 *
 * Step 2 — Authorise DriveApp (IMPORTANT — required because Drive access is new)
 *   In the script editor, select the function "authorizeDrive" from the
 *   function dropdown (top toolbar), then click Run.
 *   A permissions dialog will appear — click "Review permissions", choose your
 *   Google account, and click "Allow".
 *   You should see "Drive authorised OK" logged in the Execution log.
 *
 * Step 3 — Publish a new version
 *   → Deploy > Manage deployments
 *   → Click the pencil (Edit) icon on the existing deployment
 *   → Change "Version" to "New version"
 *   → Click Deploy
 *   The Web App URL stays the same — no changes needed in the website code.
 *
 * ── SHEETS ───────────────────────────────────────────────────────────────────
 *   Contact form  →  "Leads"   sheet  (auto-created on first submission)
 *   Careers form  →  "Careers" sheet  (auto-created on first submission)
 *
 * ── DRIVE FOLDER ─────────────────────────────────────────────────────────────
 *   Resumes are uploaded to:
 *   https://drive.google.com/drive/folders/1zU5f7YtLbR9rs5OsN7RuABmzhQOrp4cb
 */

var RESUME_FOLDER_ID      = '1zU5f7YtLbR9rs5OsN7RuABmzhQOrp4cb';
var LEADS_SHEET           = 'Leads';
var CAREERS_SHEET         = 'Careers';
var FUTURE_OPP_SHEET      = 'Future Opportunities';

// ─────────────────────────────────────────────────────────────────────────────
// Run this function ONCE manually in the editor to grant DriveApp permission
// ─────────────────────────────────────────────────────────────────────────────
function authorizeDrive() {
  var folder = DriveApp.getFolderById(RESUME_FOLDER_ID);
  Logger.log('Drive authorised OK. Folder: ' + folder.getName());
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.type === 'careers') {
      return handleCareers(data);
    } else if (data.type === 'future_opportunities') {
      return handleFutureOpportunities(data);
    } else {
      return handleContact(data);
    }

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact form → "Leads" sheet
// ─────────────────────────────────────────────────────────────────────────────
function handleContact(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LEADS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(LEADS_SHEET);
  }

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
    sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
  }

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
}

// ─────────────────────────────────────────────────────────────────────────────
// Future Opportunities form → "Future Opportunities" sheet
// ─────────────────────────────────────────────────────────────────────────────
function handleFutureOpportunities(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(FUTURE_OPP_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(FUTURE_OPP_SHEET);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'SubmittedDate',
      'FullName',
      'CurrentCompany',
      'Position',
      'WillingToWorkIn',
      'Phone',
      'Email',
      'LinkedInURL',
    ]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  }

  sheet.appendRow([
    new Date().toLocaleString('en-GB', { timeZone: 'UTC' }),
    data.fullName        || '',
    data.currentCompany  || '',
    data.position        || '',
    data.willingToWorkIn || '',
    data.phone           || '',
    data.email           || '',
    data.linkedInURL     || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────────────────────
// Careers form → "Careers" sheet + resume upload to Drive
// ─────────────────────────────────────────────────────────────────────────────
function handleCareers(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CAREERS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CAREERS_SHEET);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'AppliedDate',
      'OpenPosition',
      'FullName',
      'TotalYearsOfExperience',
      'CurrentCompany',
      'CurrentCTC',
      'NoticePeriodDays',
      'Email',
      'Phone',
      'LinkedInURL',
      'ResumeLink',
    ]);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
  }

  // Upload resume to Drive — wrapped in try/catch so a Drive error never
  // prevents the row from being written to the sheet.
  var resumeLink = '';
  if (data.resumeBase64 && data.resumeFileName) {
    try {
      var parentFolder  = DriveApp.getFolderById(RESUME_FOLDER_ID);
      var positionName  = (data.openPosition || 'General').replace(/[\/\\:*?"<>|]/g, '-');
      var subIter       = parentFolder.getFoldersByName(positionName);
      var subFolder     = subIter.hasNext() ? subIter.next() : parentFolder.createFolder(positionName);
      var decoded       = Utilities.base64Decode(data.resumeBase64);
      var mimeType      = data.resumeMimeType || 'application/octet-stream';
      var blob          = Utilities.newBlob(decoded, mimeType, data.resumeFileName);
      var file          = subFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      resumeLink        = file.getUrl();
    } catch (driveErr) {
      resumeLink = 'Upload error: ' + driveErr.message;
    }
  }

  // Always write the row — even if the Drive upload failed.
  sheet.appendRow([
    new Date().toLocaleString('en-GB', { timeZone: 'UTC' }),
    data.openPosition           || '',
    data.fullName               || '',
    data.totalYearsOfExperience || '',
    data.currentCompany         || '',
    data.currentCTC             || '',
    data.noticePeriodDays       || '',
    data.email                  || '',
    data.phone                  || '',
    data.linkedInURL            || '',
    resumeLink,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
