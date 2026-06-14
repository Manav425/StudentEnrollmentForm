const JPDB_CONFIG = {
  CONNECTION_TOKEN: "90935175|-31949241433267870|90958691",
  DB_NAME: "SCHOOL-DB",
  RELATION_NAME: "STUDENT-TABLE",
  BASE_URL: "http://api.login2explore.com:5577",
  IML_ENDPOINT: "/api/iml",
  IRL_ENDPOINT: "/api/irl"
};

let currentRecNo = null;

const $rollNo         = () => $("#rollNo");
const $fullName       = () => $("#fullName");
const $studentClass   = () => $("#studentClass");
const $birthDate      = () => $("#birthDate");
const $address        = () => $("#address");
const $enrollmentDate = () => $("#enrollmentDate");
const $btnSave        = () => $("#btnSave");
const $btnUpdate      = () => $("#btnUpdate");
const $btnReset       = () => $("#btnReset");
const $alertContainer = () => $("#alertContainer");
const $rollNoStatus   = () => $("#rollNoStatus");

const secondaryFields = () => [
  $fullName(), $studentClass(), $birthDate(), $address(), $enrollmentDate()
];

function initializeForm() {
  resetForm();

  $rollNo().on("blur", function () {
    const val = $(this).val().trim();
    if (val !== "") {
      getStudentByRollNo(val);
    }
  });

  $rollNo().on("keydown", function (e) {
    if (e.key === "Enter") { $(this).blur(); }
  });

  $btnSave().on("click", saveStudent);
  $btnUpdate().on("click", updateStudent);
  $btnReset().on("click", resetForm);

  $("input, textarea").on("input", function () {
    clearFieldError($(this).attr("id"));
    $(this).removeClass("is-invalid");
  });
}

function resetForm() {
  $rollNo().val("");
  secondaryFields().forEach($f => $f.val(""));

  $("input, textarea").removeClass("is-invalid is-valid");
  $(".field-error").text("");
  clearAlert();
  $rollNoStatus().html("");

  $rollNo().prop("disabled", false);
  disableFormFields();

  $btnSave().prop("disabled", true);
  $btnUpdate().prop("disabled", true);
  $btnReset().prop("disabled", false);

  currentRecNo = null;
  $rollNo().focus();
}

function enableFormFields() {
  secondaryFields().forEach($f => $f.prop("disabled", false));
  $fullName().focus();
}

function disableFormFields() {
  secondaryFields().forEach($f => $f.prop("disabled", true));
}

function populateForm(record) {
  $fullName().val(record["Full-Name"] || "");
  $studentClass().val(record["Class"] || "");
  $birthDate().val(record["Birth-Date"] || "");
  $address().val(record["Address"] || "");
  $enrollmentDate().val(record["Enrollment-Date"] || "");
}

function validateForm() {
  let valid = true;
  let firstInvalidId = null;

  const fields = [
    { id: "rollNo",         label: "Roll No",        $el: $rollNo()         },
    { id: "fullName",       label: "Full Name",       $el: $fullName()       },
    { id: "studentClass",   label: "Class",           $el: $studentClass()   },
    { id: "birthDate",      label: "Date of Birth",   $el: $birthDate()      },
    { id: "address",        label: "Address",         $el: $address()        },
    { id: "enrollmentDate", label: "Enrollment Date", $el: $enrollmentDate() }
  ];

  fields.forEach(function (field) {
    const val = (field.$el.val() || "").trim();
    if (val === "") {
      showFieldError(field.id, field.label + " is required.");
      field.$el.addClass("is-invalid").removeClass("is-valid");
      valid = false;
      if (!firstInvalidId) firstInvalidId = field.id;
    } else {
      clearFieldError(field.id);
      field.$el.addClass("is-valid").removeClass("is-invalid");
    }
  });

  if (firstInvalidId) {
    $("#" + firstInvalidId).focus();
  }

  return valid;
}

function showFieldError(fieldId, message) {
  $("#" + fieldId + "Error").text(message);
}

function clearFieldError(fieldId) {
  $("#" + fieldId + "Error").text("");
}

function showAlert(type, message) {
  const icons = {
    success: "bi-check-circle-fill",
    error: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill"
  };

  const html = `
    <div class="alert-custom alert-${type}" role="alert">
      <i class="bi ${icons[type] || "bi-info-circle-fill"} alert-icon"></i>
      <span>${escapeHtml(message)}</span>
      <button class="alert-close" onclick="clearAlert()" aria-label="Dismiss">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>`;

  $alertContainer().html(html);

  if (type === "success") {
    setTimeout(clearAlert, 5000);
  }
}

function clearAlert() {
  $alertContainer().html("");
}

function escapeHtml(str) {
  return $("<div>").text(str).html();
}

function showLookupSpinner() {
  $rollNoStatus().html('<span class="spinner-lookup" aria-label="Searching..."></span>');
}

function showLookupFound(){
  $rollNoStatus().html('<i class="bi bi-check-circle-fill" style="color:var(--green-500)" title="Record found"></i>');
}

function showLookupNotFound() {
  $rollNoStatus().html('<i class="bi bi-plus-circle-fill" style="color:var(--teal-500)" title="New record"></i>');
}

function clearLookupStatus() {
  $rollNoStatus().html("");
}

function collectFormData() {
  return {
    "Roll-No": $rollNo().val().trim(),
    "Full-Name": $fullName().val().trim(),
    "Class": $studentClass().val().trim(),
    "Birth-Date": $birthDate().val().trim(),
    "Address": $address().val().trim(),
    "Enrollment-Date": $enrollmentDate().val().trim()
  };
}

function safeParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}



function getStudentByRollNo(rollNo) {
  clearAlert();
  showLookupSpinner();
  disableFormFields();
  $btnSave().prop("disabled", true);
  $btnUpdate().prop("disabled", true);

  var getReqStr = createGETRequest(
    JPDB_CONFIG.CONNECTION_TOKEN,
    JPDB_CONFIG.DB_NAME,
    JPDB_CONFIG.RELATION_NAME,
    JSON.stringify({ "Roll-No": rollNo })
  );

  jQuery.ajaxSetup({ async: false });
  var resultObj = executeCommandAtGivenBaseUrl(
    getReqStr,
    JPDB_CONFIG.BASE_URL,
    JPDB_CONFIG.IRL_ENDPOINT
  );
  jQuery.ajaxSetup({ async: true });

  if (resultObj == null) {
    clearLookupStatus();
    showAlert("error", "Could not connect to the database. Check your network and config.");
    return;
  }

  if (resultObj.status === 200) {

    var data = JSON.parse(resultObj.data);
    currentRecNo = data.rec_no;

    populateForm(data.record);
    enableFormFields();
    $rollNo().prop("disabled", true);
    $btnSave().prop("disabled", true);
    $btnUpdate().prop("disabled", false);

    showLookupFound();
    showAlert("info", "Record found. Edit the fields and click Update.");
    $fullName().focus();
  } else if (resultObj.status === 400) {
t
    handleNewRollNo();
  } else {
    clearLookupStatus();
    showAlert("error", "Error: " + (resultObj.message || "Unknown error from database."));
  }
}

function handleNewRollNo() {
  currentRecNo = null;
  enableFormFields();
  $btnSave().prop("disabled", false);
  $btnUpdate().prop("disabled", true);
  showLookupNotFound();
  showAlert("info", "Roll No not found. Fill in the details and click Save.");
  $fullName().focus();
}

function saveStudent() {
  clearAlert();
  if (!validateForm()) return;

  var data = collectFormData();
  $btnSave().prop("disabled", true).html('<span class="spinner-lookup"></span> Saving...');


  var putReqStr = createPUTRequest(
    JPDB_CONFIG.CONNECTION_TOKEN,
    JSON.stringify(data),
    JPDB_CONFIG.DB_NAME,
    JPDB_CONFIG.RELATION_NAME
  );

  jQuery.ajaxSetup({ async: false });
  var resultObj = executeCommandAtGivenBaseUrl(
    putReqStr,
    JPDB_CONFIG.BASE_URL,
    JPDB_CONFIG.IML_ENDPOINT
  );
  jQuery.ajaxSetup({ async: true });

  if (resultObj == null) {
    showAlert("error", "Save failed. Could not connect to the database.");
    $btnSave().prop("disabled", false).html('<i class="bi bi-floppy"></i> Save');
    return;
  }

  if (resultObj.status === 200 || resultObj.status === 201) {
    showAlert("success", 'Student "' + data["Full-Name"] + '" saved successfully.');
    resetForm();
  } else {
    showAlert("error", "Save failed: " + (resultObj.message || "Unknown error."));
    $btnSave().prop("disabled", false).html('<i class="bi bi-floppy"></i> Save');
  }
}

function updateStudent() {
  clearAlert();
  if (!validateForm()) return;

  if (currentRecNo === null) {
    showAlert("error", "No record number found. Please reset and try again.");
    return;
  }

  var data = collectFormData();
  $btnUpdate().prop("disabled", true).html('<span class="spinner-lookup"></span> Updating...');

  var updateReqStr = createUPDATERecordRequest(
    JPDB_CONFIG.CONNECTION_TOKEN,
    JSON.stringify(data),
    JPDB_CONFIG.DB_NAME,
    JPDB_CONFIG.RELATION_NAME,
    currentRecNo
  );

  jQuery.ajaxSetup({ async: false });
  var resultObj = executeCommandAtGivenBaseUrl(
    updateReqStr,
    JPDB_CONFIG.BASE_URL,
    JPDB_CONFIG.IML_ENDPOINT
  );
  jQuery.ajaxSetup({ async: true });

  if (resultObj == null) {
    showAlert("error", "Update failed. Could not connect to the database.");
    $btnUpdate().prop("disabled", false).html('<i class="bi bi-pencil-square"></i> Update');
    return;
  }

  if (resultObj.status === 200) {
    showAlert("success", 'Student "' + data["Full-Name"] + '" updated successfully.');
    resetForm();
  } else {
    showAlert("error", "Update failed: " + (resultObj.message || "Unknown error."));
    $btnUpdate().prop("disabled", false).html('<i class="bi bi-pencil-square"></i> Update');
  }
}

$(document).ready(function () {
  initializeForm();
});
