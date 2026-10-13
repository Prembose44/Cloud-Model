require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  registerNumber: { type: String, required: true, trim: true, unique: true },
  department: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true }
});
const Student = mongoose.model("Student", studentSchema);

app.post("/api/students", async (req,res) => {
  try { res.status(201).json(await Student.create(req.body)); }
  catch(e) { handleError(e,res); }
});
app.get("/api/students", async (req,res) => {
  try { res.json(await Student.find().sort({name:1})); }
  catch(e) { handleError(e,res); }
});
app.get("/api/students/:id", async (req,res) => {
  try {
    if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:"Invalid student ID"});
    const item=await Student.findById(req.params.id);
    if(!item) return res.status(404).json({message:"Student not found"});
    res.json(item);
  } catch(e) { handleError(e,res); }
});
app.put("/api/students/:id", async (req,res) => {
  try {
    if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:"Invalid student ID"});
    const item=await Student.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
    if(!item) return res.status(404).json({message:"Student not found"});
    res.json(item);
  } catch(e) { handleError(e,res); }
});
app.delete("/api/students/:id", async (req,res) => {
  try {
    if(!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({message:"Invalid student ID"});
    const item=await Student.findByIdAndDelete(req.params.id);
    if(!item) return res.status(404).json({message:"Student not found"});
    res.json({message:"Student deleted successfully"});
  } catch(e) { handleError(e,res); }
});
function handleError(e,res) {
  if(e.code===11000) return res.status(409).json({message:"Register number already exists"});
  if(e.name==="ValidationError") return res.status(400).json({message:e.message});
  console.error(e);
  res.status(500).json({message:"Server error"});
}
async function start() {
  if(!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Create .env from .env.example and add your Atlas URI.");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");
    app.listen(PORT,()=>console.log(`Student CRUD app running at http://localhost:${PORT}`));
  } catch(e) {
    console.error("MongoDB Atlas connection failed:",e.message);
    process.exit(1);
  }
}
start();
