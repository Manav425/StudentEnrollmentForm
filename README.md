# Student Enrollment Form

## Description

A web-based student enrollment form that saves, retrieves, and updates student records in real time using JsonPowerDB as the backend database. The form uses Roll-No as the primary key. On entering a Roll-No, it automatically checks whether the student already exists in the database and switches between Save and Update mode accordingly — no page reload required.

Built with HTML, CSS, Bootstrap 5, JavaScript, jQuery, and the official jpdb-commons.js library provided by Login2Explore.

**Database:** SCHOOL-DB  
**Table:** STUDENT-TABLE  
**Primary Key:** Roll-No  

**Fields stored:**

| Field | Description |
|---|---|
| Roll-No | Unique identifier for each student |
| Full-Name | Student's full name |
| Class | Class or section |
| Birth-Date | Date of birth |
| Address | Residential address |
| Enrollment-Date | Date of enrollment |

## Benefits of using JsonPowerDB

- Schema-free. No need to define table structure before inserting data. You can start storing JSON records directly.
- Minimal setup. No backend server, no ORM, no migrations. The database is accessible over HTTP from the browser itself via simple API calls.
- Faster development. The jpdb-commons.js library abstracts request building and AJAX calls into single-line function calls like `createPUTRequest()` and `executeCommandAtGivenBaseUrl()`.
- Built-in primary key indexing. Querying by primary key (Roll-No in this case) is direct and fast without writing any query language.
- Multiple APIs in one. JsonPowerDB supports IML (Insert/Update), IRL (Retrieval), and other operations through a unified endpoint pattern, keeping the integration surface small.
- Suitable for frontend-only projects. Since it works over HTTP directly from the browser, it is practical for lab projects, prototypes, and demos where setting up a Node or Python backend would be unnecessary overhead.

## Scope of Functionalities

- Enter a Roll-No to trigger an automatic database lookup on blur.
- If the Roll-No does not exist, the form enables all fields and activates the Save button for a new record.
- If the Roll-No exists, the form fetches and populates the existing record and activates the Update button.
- Save inserts a new student record into SCHOOL-DB.
- Update modifies the existing record without changing the Roll-No.
- Reset clears all fields and returns the form to its initial state.
- All fields are validated before Save or Update. Empty fields are flagged inline with error messages and the first invalid field receives focus.

## Examples of Use

**Saving a new student:**

1. Open `index.html` in a browser.
2. Enter a Roll-No that does not exist in the database, e.g. `2024001`.
3. Tab out of the field. The remaining fields become active.
4. Fill in Full-Name, Class, Birth-Date, Address, and Enrollment-Date.
5. Click Save. The record is inserted and the form resets.

**Updating an existing student:**

1. Enter a Roll-No that already exists in the database.
2. Tab out. The form auto-populates with the stored data.
3. Edit any field.
4. Click Update. The record is modified in place.

## Project Structure

```
student-enrollment/
├── index.html       # Form UI and layout
├── style.css        # Custom styles
├── script.js        # All form logic and JPDB API calls
└── README.md
```

## Setup

1. Clone or download the repository.
2. Open `script.js` and paste your JsonPowerDB connection token:

```js
const JPDB_CONFIG = {
  CONNECTION_TOKEN: "your_token_here",
  DB_NAME: "SCHOOL-DB",
  RELATION_NAME: "STUDENT-TABLE",
  BASE_URL: "http://api.login2explore.com:5577",
  IML_ENDPOINT: "/api/iml",
  IRL_ENDPOINT: "/api/irl"
};
```

3. Open `index.html` directly in a browser.

Note: Do not serve the project over HTTPS. The jpdb-commons.js library is loaded over HTTP from Login2Explore's server and will be blocked by the browser if the page itself is served over HTTPS (mixed content restriction).

**Getting your connection token:**

1. Sign up at [login2explore.com](http://login2explore.com).
2. Go to Dashboard and navigate to My Tokens.
3. Copy the token and paste it into `CONNECTION_TOKEN` in `script.js`.

## Release History

| Version | Date | Description |
|---|---|---|
| v1.0 | June 2025 | Initial release. Save, Update, and Reset functionality with JsonPowerDB integration using jpdb-commons.js. |

## Project Status

Complete. All core features — Save, Update, Reset, primary key lookup, and inline validation — are implemented and working. No further development is planned for this version.

## Security Note

Do not commit your connection token to any public repository. The `CONNECTION_TOKEN` field is intentionally left empty in the source code. Add the token locally before running the project.
