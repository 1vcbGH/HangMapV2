
const express = require('express');
const cors = require('cors');
const body = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(body.json());

const USERS = path.join(__dirname,'users.json');
const INV = path.join(__dirname,'invitaciones.json');
const FIESTAS = path.join(__dirname,'fiestas.json');
const SECRET = "supersecretkey";

function load(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function save(p,d){ fs.writeFileSync(p,JSON.stringify(d,null,2)); }

if(!fs.existsSync(USERS)) save(USERS,[]);
if(!fs.existsSync(INV)) save(INV,[{"codigo":"BETA","rangoOtorgado":"beta","color":"#328BFF","ilimitado":true}]);
if(!fs.existsSync(FIESTAS)) save(FIESTAS,[]);

// REGISTER
app.post('/api/users/register',(req,res)=>{
  let {email,username,password,invitacion}=req.body;
  let invs = load(INV);
  let inv = invs.find(i=>i.codigo===invitacion);
  if(!inv) return res.status(400).json({error:"Invitación inválida"});
  let users = load(USERS);
  if(users.find(u=>u.username===username)) return res.status(400).json({error:"Usuario existente"});
  let hash = bcrypt.hashSync(password,10);
  users.push({
    email,username,passwordHash:hash,
    rango:inv.rangoOtorgado,colorRango:inv.color,
    invitationUsed:inv.codigo,creado:Date.now()
  });
  save(USERS,users);
  return res.json({ok:true});
});

// LOGIN
app.post('/api/users/login',(req,res)=>{
  let {username,password}=req.body;
  let users=load(USERS);
  let u=users.find(x=>x.username===username);
  if(!u) return res.status(400).json({error:"No existe"});
  if(!bcrypt.compareSync(password,u.passwordHash)) return res.status(400).json({error:"Contraseña incorrecta"});
  let token=jwt.sign({username:u.username,rango:u.rango},SECRET,{expiresIn:"24h"});
  res.json({ok:true,token,user:u});
});

// AUTH middleware
function auth(req,res,next){
  let token=req.headers.authorization;
  if(!token) return res.status(403).json({error:"Falta token"});
  try{
    req.user=jwt.verify(token,SECRET);
    next();
  }catch(e){
    res.status(403).json({error:"Token inválido"});
  }
}

// GET fiestas
app.get('/api/fiestas',(req,res)=> res.json(load(FIESTAS)) );

// CREATE fiesta
app.post('/api/fiestas',auth,(req,res)=>{
  let eventos=load(FIESTAS);
  eventos.push({...req.body,creadoPor:req.user.username,ts:Date.now()});
  save(FIESTAS,eventos);
  res.json({ok:true});
});

app.listen(3000,'0.0.0.0',()=>console.log("HangMap V4 FULL server running"));
