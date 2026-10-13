require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5001;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const API = "https://api.dropboxapi.com/2";
const CONTENT = "https://content.dropboxapi.com/2";
function token() {
  if (!process.env.DROPBOX_ACCESS_TOKEN || process.env.DROPBOX_ACCESS_TOKEN.startsWith("PASTE_")) {
    throw new Error("Set a valid DROPBOX_ACCESS_TOKEN in .env");
  }
  return process.env.DROPBOX_ACCESS_TOKEN;
}
async function dbxJson(url, body) {
  const r = await fetch(url, { method:"POST", headers:{"Authorization":"Bearer "+token(),"Content-Type":"application/json"}, body:JSON.stringify(body) });
  const t = await r.text(); let data={}; try{data=t?JSON.parse(t):{}}catch{}
  if(!r.ok) throw new Error(data.error_summary || data.error || t || "Dropbox API request failed");
  return data;
}
app.get("/api/files", async (req,res) => {
  try { const d=await dbxJson(API+"/files/list_folder",{path:"",recursive:false}); res.json(d.entries||[]); }
  catch(e){res.status(500).json({message:e.message});}
});
app.post("/api/files/upload", upload.single("file"), async (req,res) => {
  try {
    if(!req.file) return res.status(400).json({message:"Choose a file to upload"});
    const r=await fetch(CONTENT+"/files/upload",{
      method:"POST",
      headers:{"Authorization":"Bearer "+token(),"Content-Type":"application/octet-stream","Dropbox-API-Arg":JSON.stringify({path:"/"+req.file.originalname.replace(/^\/+/,""),mode:"add",autorename:true,mute:false})},
      body:req.file.buffer
    });
    const t=await r.text();let d={};try{d=t?JSON.parse(t):{}}catch{}
    if(!r.ok)throw new Error(d.error_summary||t||"Upload failed");
    res.status(201).json({message:"File uploaded successfully",file:d});
  }catch(e){res.status(500).json({message:e.message});}
});
app.get("/api/files/download", async (req,res) => {
  try {
    const filePath=String(req.query.path||"");
    if(!filePath.startsWith("/")) return res.status(400).json({message:"Provide a Dropbox path beginning with /"});
    const r=await fetch(CONTENT+"/files/download",{method:"POST",headers:{"Authorization":"Bearer "+token(),"Dropbox-API-Arg":JSON.stringify({path:filePath})}});
    if(!r.ok)throw new Error(await r.text()||"Download failed");
    const metadata=r.headers.get("dropbox-api-result");let name=path.basename(filePath);
    try{if(metadata)name=JSON.parse(metadata).name||name}catch{}
    res.setHeader("Content-Disposition",'attachment; filename="'+name.replace(/["\\]/g,"_")+'"');
    res.setHeader("Content-Type","application/octet-stream");
    res.send(Buffer.from(await r.arrayBuffer()));
  }catch(e){res.status(500).json({message:e.message});}
});
app.delete("/api/files", async (req,res) => {
  try {
    const filePath=String(req.body.path||"");
    if(!filePath.startsWith("/"))return res.status(400).json({message:"Provide a Dropbox path beginning with /"});
    const d=await dbxJson(API+"/files/delete_v2",{path:filePath});
    res.json({message:"File deleted successfully",result:d});
  }catch(e){res.status(500).json({message:e.message});}
});
app.listen(PORT,()=>console.log("Dropbox File Manager running at http://localhost:"+PORT));
