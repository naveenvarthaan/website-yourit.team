/**
 * Google Apps Script backend for the yourIT.team homepage contact form.
 *
 * Deployment:
 * 1. Go to https://script.google.com, create a new project, paste this file in as Code.gs.
 * 2. Click Deploy > New deployment > Type: Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3. Copy the deployed Web App URL and set it as CONTACT_ENDPOINT in index.html.
 * 4. The recipient address below never leaves Google's servers — it is not present
 *    anywhere in the page source sent to visitors' browsers.
 */

var RECIPIENT_EMAIL = 'naveen@yourit.team';
var MAX_FIELD_LENGTH = 5000;

function doPost(e) {
  try {
    var data = parseRequest(e);

    // Honeypot: bots fill every field, real visitors never see or fill this one.
    if (data.website) {
      return respond({ ok: true });
    }

    var name = sanitize(data.name, 200);
    var email = sanitize(data.email, 200);
    var company = sanitize(data.company, 200);
    var message = sanitize(data.message, MAX_FIELD_LENGTH);

    if (!name || !email || !company || !message) {
      return respond({ ok: false, error: 'Missing required field.' });
    }
    if (!isValidEmail(email)) {
      return respond({ ok: false, error: 'Invalid email address.' });
    }

    var subject = 'AI Data Readiness Inquiry — ' + name;
    var body =
      'New contact form submission from yourit.team\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Company: ' + company + '\n\n' +
      'Message:\n' + message;

    GmailApp.sendEmail(RECIPIENT_EMAIL, subject, body, {
      replyTo: email,
      name: 'yourIT.team Website'
    });

    return respond({ ok: true });
  } catch (err) {
    return respond({ ok: false, error: 'Server error.' });
  }
}

function parseRequest(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return {};
  }
}

// Strips control characters (incl. newlines) so a field can't inject extra
// mail headers or forge additional lines in the body, and caps length.
function sanitize(value, maxLength) {
  if (typeof value !== 'string') return '';
  var cleaned = value.replace(/[\r\n\t\x00-\x1F\x7F]+/g, ' ').trim();
  return cleaned.slice(0, maxLength);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
