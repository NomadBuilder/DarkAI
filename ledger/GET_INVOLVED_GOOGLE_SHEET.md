# Get involved → Google Sheet

Submissions from [/get-involved](https://protectont.ca/get-involved) append rows to your spreadsheet via a **Google Apps Script** web app. The site does not talk to Google directly—you deploy a small script **inside** the sheet, then paste one URL into Render.

**Your sheet:** [Protest Submissions](https://docs.google.com/spreadsheets/d/1YAblLgEymjxJKVTC4nY4tHCH3NHQmFUdECe7j8gDg4k/edit)  
**Spreadsheet ID:** `1YAblLgEymjxJKVTC4nY4tHCH3NHQmFUdECe7j8gDg4k`  
**Tab to use:** `Responses`

> **Security:** An “anyone can edit” link is fine for a small team, but avoid posting that link publicly. After setup, consider **Share → specific people** for editors and keeping only the Apps Script URL on the server.

---

## What you need to give the deploy (not your Google password)

After step 2 below, copy the **Web app URL** (ends with `/exec`) and add it in Render:

```bash
NEXT_PUBLIC_GET_INVOLVED_SUBMIT_URL=https://script.google.com/macros/s/…………/exec
```

Send that URL to whoever manages Render, or add it yourself under **Environment** for the ProtectOnt service, then redeploy.

The edit link to the spreadsheet is **not** enough—the site needs the **Apps Script deployment URL**.

---

## 1. Add column headers (row 1)

**Easiest:** open **`ledger/data/get-involved-sheet-headers.csv`** in Numbers (or Excel), select row 1, copy, then paste into **row 1** of [your sheet](https://docs.google.com/spreadsheets/d/1YAblLgEymjxJKVTC4nY4tHCH3NHQmFUdECe7j8gDg4k/edit) tab **Responses**. Each header should land in its own column (A through U).

Alternatively, copy this line into row 1 (tab-separated also works in Sheets):

```
submitted_at	role	role_label	name	email	phone	city	postal_code	yard_sign_design	yard_sign_quantity	yard_sign_payment_status	yard_sign_notes	dropoff_location	dropoff_availability	dropoff_capacity	dropoff_list_publicly	volunteer_roles	volunteer_availability	volunteer_has_vehicle	updates_topics	additional_notes	source_page
```

`yard_sign_*` columns stay empty while yard-sign is hidden on the form; harmless to keep for later.

---

## 2. Install Apps Script (5 minutes)

1. In the spreadsheet: **Extensions → Apps Script**.
2. Replace `Code.gs` with:

```javascript
var SPREADSHEET_ID = '1YAblLgEymjxJKVTC4nY4tHCH3NHQmFUdECe7j8gDg4k';
var SHEET_NAME = 'Responses';

function doPost(e) {
  try {
    var p = e.parameter || {};
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Missing tab: ' + SHEET_NAME);
    }
    sheet.appendRow([
      p.submitted_at || new Date().toISOString(),
      p.role || '',
      p.role_label || '',
      p.name || '',
      p.email || '',
      p.phone || '',
      p.city || '',
      p.postal_code || '',
      p.yard_sign_design || '',
      p.yard_sign_quantity || '',
      p.yard_sign_payment_status || '',
      p.yard_sign_notes || '',
      p.dropoff_location || '',
      p.dropoff_availability || '',
      p.dropoff_capacity || '',
      p.dropoff_list_publicly || '',
      p.volunteer_roles || '',
      p.volunteer_availability || '',
      p.volunteer_has_vehicle || '',
      p.updates_topics || '',
      p.additional_notes || '',
      p.source_page || 'get-involved',
    ]);
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
```

3. **Save** the project.
4. **Deploy → New deployment → Type: Web app**
   - Execute as: **Me** (your Google account)
   - Who has access: **Anyone**
5. **Deploy** → copy the **Web app URL** (`…/exec`, not `…/dev`).

If you rename the tab, change `SHEET_NAME` in the script to match exactly (case-sensitive).

---

## 3. Connect protectont.ca

1. Render → your service → **Environment** → add **one** of:
   - `NEXT_PUBLIC_GET_INVOLVED_SUBMIT_URL` = your `/exec` URL, or
   - `GET_INVOLVED_SUBMIT_URL` = same URL (server-only; works without rebuilding the site)
2. **Redeploy** the Render service (restart picks up env vars).

The live form loads the URL from **`/api/protectont-config`** at runtime, so you do **not** need a new Ledger build just to change the script URL—only a Render redeploy after setting the variable.

**Check:** open `https://protectont.ca/api/protectont-config` — you should see `{"getInvolvedSubmitUrl":"https://script.google.com/..."}`.

**Common mistake:** env key truncated (e.g. `NEXT_PUBLIC_GET_` instead of `NEXT_PUBLIC_GET_INVOLVED_SUBMIT_URL`). Copy the full key name.

For local dev, put the URL in `ledger/.env.local` or repo-root `.env` and rebuild, or rely on Flask with the var in the environment.

---

## 4. Test

1. Visit `https://protectont.ca/get-involved` (or local dev).
2. Submit as **Volunteer** with a test email.
3. Within a few seconds, **row 2** on `Responses` should fill in.
4. If the form shows “not connected,” the env var is missing or deploy didn’t finish.
5. If submit fails in the browser, confirm deployment access is **Anyone** and the URL ends with `/exec`.

---

## Where submissions go

| Step | What happens |
|------|----------------|
| User submits form | Browser POSTs to your Apps Script URL |
| Apps Script | Appends one row to `Responses` in [your spreadsheet](https://docs.google.com/spreadsheets/d/1YAblLgEymjxJKVTC4nY4tHCH3NHQmFUdECe7j8gDg4k/edit) |
| Dawn / organizers | Sort/filter by **role** (column B) and **city** (column G) |

Roles on the form: `yard-sign` (I want a sign), `dropoff`, `volunteer`, `other` (something else → `additional_notes` column).

---

## Field reference

| Column | Filled for |
|--------|------------|
| `dropoff_*` | Host a drop-off / pickup point |
| `volunteer_*` | Volunteer |
| `yard_sign_*` | (unused while yard-sign is hidden) |
