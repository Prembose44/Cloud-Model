const AUTH0_DOMAIN = "REPLACE_WITH_AUTH0_DOMAIN";
const AUTH0_CLIENT_ID = "REPLACE_WITH_AUTH0_CLIENT_ID";
const AUTH0_AUDIENCE = "https://hospital-crud-api";

let auth0Client;
let currentUser = null;
let patientsCache = [];

const $ = id => document.getElementById(id);
const statusBox = $("status");

function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle("error", isError);
}

async function init() {
  if (AUTH0_DOMAIN.startsWith("REPLACE_") || AUTH0_CLIENT_ID.startsWith("REPLACE_")) {
    showStatus("Setup required: edit public/app.js and replace AUTH0_DOMAIN and AUTH0_CLIENT_ID with values from your Auth0 Single Page Application.", true);
    $("loginBtn").disabled = true;
    return;
  }

  try {
    auth0Client = await auth0.createAuth0Client({
      domain: AUTH0_DOMAIN,
      clientId: AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: AUTH0_AUDIENCE
      },
      cacheLocation: "memory"
    });

    if (window.location.search.includes("code=") && window.location.search.includes("state=")) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    currentUser = await auth0Client.getUser();
    await updateUI();
  } catch (error) {
    console.error(error);
    showStatus("Auth0 setup/login error. Check the browser console, Auth0 domain/client ID, API audience and allowed URLs.", true);
  }
}

async function updateUI() {
  const loggedIn = await auth0Client.isAuthenticated();
  $("loginBtn").classList.toggle("hidden", loggedIn);
  $("logoutBtn").classList.toggle("hidden", !loggedIn);
  $("appPanel").classList.toggle("hidden", !loggedIn);

  if (!loggedIn) {
    showStatus("You are logged out. Click Login to authenticate through Auth0.");
    return;
  }

  currentUser = await auth0Client.getUser();
  $("welcome").textContent = `Signed in as ${currentUser.name || currentUser.email || "Authenticated user"}`;
  showStatus("Authenticated through Auth0. CRUD API requests use your access token.");
  await loadPatients();
}

async function apiRequest(url, options = {}) {
  const token = await auth0Client.getTokenSilently({
    authorizationParams: { audience: AUTH0_AUDIENCE }
  });
  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  if (options.body) headers["Content-Type"] = "application/json";

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

async function loadPatients() {
  try {
    patientsCache = await apiRequest("/api/patients");
    renderPatients();
  } catch (error) {
    showStatus(error.message + " Check the Auth0 API audience and token configuration.", true);
  }
}

function renderPatients() {
  const body = $("patientsBody");
  body.replaceChildren();

  for (const patient of patientsCache) {
    const tr = document.createElement("tr");
    [patient.id, patient.name, patient.age, patient.disease].forEach(value => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    const actions = document.createElement("td");
    const group = document.createElement("div");
    group.className = "row-actions";

    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.className = "edit";
    edit.addEventListener("click", () => beginEdit(patient));

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.className = "delete";
    remove.addEventListener("click", async () => {
      if (!confirm(`Delete ${patient.name}?`)) return;
      try {
        await apiRequest(`/api/patients/${patient.id}`, { method: "DELETE" });
        await loadPatients();
        showStatus("Patient deleted successfully.");
      } catch (error) {
        showStatus(error.message, true);
      }
    });

    group.append(edit, remove);
    actions.appendChild(group);
    tr.appendChild(actions);
    body.appendChild(tr);
  }
}

function beginEdit(patient) {
  $("patientId").value = patient.id;
  $("name").value = patient.name;
  $("age").value = patient.age;
  $("disease").value = patient.disease;
  $("formTitle").textContent = "Edit patient";
  $("saveBtn").textContent = "Save changes";
  $("cancelBtn").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  $("patientForm").reset();
  $("patientId").value = "";
  $("formTitle").textContent = "Add patient";
  $("saveBtn").textContent = "Add Patient";
  $("cancelBtn").classList.add("hidden");
}

$("loginBtn").addEventListener("click", async () => {
  try {
    await auth0Client.loginWithRedirect();
  } catch (error) {
    showStatus(error.message, true);
  }
});

$("logoutBtn").addEventListener("click", () => {
  auth0Client.logout({
    logoutParams: { returnTo: window.location.origin }
  });
});

$("patientForm").addEventListener("submit", async event => {
  event.preventDefault();
  const id = $("patientId").value;
  const body = {
    name: $("name").value.trim(),
    age: Number($("age").value),
    disease: $("disease").value.trim()
  };

  try {
    if (id) {
      await apiRequest(`/api/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify(body)
      });
      showStatus("Patient updated successfully.");
    } else {
      await apiRequest("/api/patients", {
        method: "POST",
        body: JSON.stringify(body)
      });
      showStatus("Patient added successfully.");
    }
    resetForm();
    await loadPatients();
  } catch (error) {
    showStatus(error.message, true);
  }
});

$("cancelBtn").addEventListener("click", resetForm);
$("refreshBtn").addEventListener("click", loadPatients);

init();
