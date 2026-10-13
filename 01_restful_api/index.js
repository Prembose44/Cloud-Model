const express = require("express");
const app = express();
app.use(express.json());

// Change this configuration to match the exam question.
const RESOURCE = {
  plural: "patients",
  singular: "patient",
  fields: ["name", "age", "disease"],
  initialData: [
    { id: 1, name: "Arun", age: 25, disease: "Fever" },
    { id: 2, name: "Priya", age: 30, disease: "Cold" }
  ]
};

let records = RESOURCE.initialData.map(record => ({ ...record }));
const baseUrl = `/api/${RESOURCE.plural}`;

app.get(baseUrl, (req, res) => res.json(records));

app.get(`${baseUrl}/:id`, (req, res) => {
  const record = records.find(item => item.id === Number(req.params.id));
  if (!record) return res.status(404).json({ message: `${RESOURCE.singular} not found` });
  res.json(record);
});

app.post(baseUrl, (req, res) => {
  const newRecord = {
    id: records.length ? Math.max(...records.map(item => item.id)) + 1 : 1
  };
  for (const field of RESOURCE.fields) {
    if (req.body[field] !== undefined) newRecord[field] = req.body[field];
  }
  records.push(newRecord);
  res.status(201).json(newRecord);
});

app.put(`${baseUrl}/:id`, (req, res) => {
  const record = records.find(item => item.id === Number(req.params.id));
  if (!record) return res.status(404).json({ message: `${RESOURCE.singular} not found` });
  for (const field of RESOURCE.fields) {
    if (req.body[field] !== undefined) record[field] = req.body[field];
  }
  res.json(record);
});

app.delete(`${baseUrl}/:id`, (req, res) => {
  const index = records.findIndex(item => item.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ message: `${RESOURCE.singular} not found` });
  records.splice(index, 1);
  res.json({ message: `${RESOURCE.singular} deleted successfully` });
});

app.listen(8080, () => console.log(`${RESOURCE.singular} API running at http://localhost:8080`));
