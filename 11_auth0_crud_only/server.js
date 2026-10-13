require("dotenv").config();

const express = require("express");
const path = require("path");
const { auth } = require("express-oauth2-jwt-bearer");

const app = express();
const PORT = Number(process.env.PORT || 5001);

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_AUDIENCE) {
  console.error("Missing AUTH0_DOMAIN or AUTH0_AUDIENCE. Configure your .env file.");
  process.exit(1);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const requireAuth = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  audience: process.env.AUTH0_AUDIENCE,
  tokenSigningAlg: "RS256"
});

let nextId = 3;
let patients = [
  { id: 1, name: "Arun", age: 25, disease: "Fever" },
  { id: 2, name: "Priya", age: 30, disease: "Cold" }
];

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", authentication: "Auth0 JWT required for CRUD routes" });
});

app.get("/api/patients", requireAuth, (req, res) => {
  res.json(patients);
});

app.post("/api/patients", requireAuth, (req, res) => {
  const { name, age, disease } = req.body || {};
  if (!String(name || "").trim() || age === undefined || !String(disease || "").trim()) {
    return res.status(400).json({ error: "name, age and disease are required" });
  }
  const patient = {
    id: nextId++,
    name: String(name).trim(),
    age: Number(age),
    disease: String(disease).trim()
  };
  if (!Number.isFinite(patient.age) || patient.age <= 0) {
    return res.status(400).json({ error: "age must be a positive number" });
  }
  patients.push(patient);
  res.status(201).json(patient);
});

app.put("/api/patients/:id", requireAuth, (req, res) => {
  const patient = patients.find(p => p.id === Number(req.params.id));
  if (!patient) return res.status(404).json({ error: "Patient not found" });

  const { name, age, disease } = req.body || {};
  if (name !== undefined) patient.name = String(name).trim();
  if (age !== undefined) {
    const parsedAge = Number(age);
    if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
      return res.status(400).json({ error: "age must be a positive number" });
    }
    patient.age = parsedAge;
  }
  if (disease !== undefined) patient.disease = String(disease).trim();
  res.json(patient);
});

app.delete("/api/patients/:id", requireAuth, (req, res) => {
  const index = patients.findIndex(p => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Patient not found" });
  patients.splice(index, 1);
  res.json({ message: "Patient deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Auth0 CRUD app running at http://localhost:${PORT}`);
});
