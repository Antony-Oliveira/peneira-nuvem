import express from 'express';
import path from 'path';
import { MongoClient, ObjectId } from 'mongodb';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import cors from 'cors';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'client/src')));

app.use('/assets', express.static(path.join(__dirname, 'client/assets')));
let db;

async function connect() {
    if (db) return db;
    
    try {
        const conn = await MongoClient.connect("mongodb+srv://grupo35:20141877@cluster0.hzthe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        if (!conn) throw new Error("Erro na conexão");
        db = conn.db("unifor");
        return db;
    } catch (error) {
        console.error("Erro na conexão com o banco de dados:", error);
        throw error;
    }
}

const router = express.Router();

router.get('/clientes', async function(req, res, next){
  try {
      const db  = await connect();
      const query = {_id: new ObjectId(req.params.id)};
      if (req.params.id) {
          return res.json(await db.collection("cliente").findOne(query));
      } else {
          return res.json(await db.collection("cliente").find().toArray());
      }
  } catch (ex) {
      console.log(ex);
      res.status(400).json(`{erro: ${ex}}`);
  }
});

router.put('/cliente/:id/update', async function(req, res, next){
  try {
      const cliente = req.body;
      const db = await connect();
      let query = {_id: new ObjectId(req.params.id)};
      const user = await db.collection("cliente").updateOne(query, {$set: cliente});
      res.status(200).json(user);
  } catch(ex) {
      console.log(ex);
      res.status(400).json(`{erro: ${ex}}`);
  }
});

router.delete('/cliente/:id/delete', async function(req, res, next){
  try {
      const db = await connect();
      const user = await db.collection("cliente").deleteOne({_id: new ObjectId(req.params.id)});
      res.json(user);
  } catch(ex) {
      console.log(ex);
      res.status(400).json(`{erro: ${ex}}`);
  }
});

router.post('/login', async function(req, res, next){
    try {
        const { email, password } = req.body;
        const secret = 'D62ST92Y7A6V7K5C6W9ZU6W8KS3';
        const db = await connect();
        
        const user = await db.collection("cliente").findOne({ email, password });
        console.log(user);
        
        if (user) {
            const token = jwt.sign({id: user._id}, secret, {expiresIn: '1h'});
            res.status(200).json({user, token, msg:'Sucesso'});
        } else {
            res.status(401).json({ message: "Credenciais inválidas" });
        }
    } catch (ex) {
        console.error(ex);
        res.status(500).json({ erro: `${ex}` });
    }
});

router.post('/cadastro', async function(req, res, next){
    try {
        const cliente = req.body;
        cliente.position = 'indefinida';
        const db  = await connect();
        const query = await db.collection("cliente").findOne({email: cliente.email});
        if(query){
            return res.status(400).json({erro: "Usuário já cadastrado"});
        }
        res.status(201).json(await db.collection("cliente").insertOne(cliente));
    } catch(ex) {
        console.log(ex);
        res.status(400).json({erro: `${ex}`});
    }
});

router.get('/gestao', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/src', 'gestao.html'));
});

router.get('/login-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src', 'Login.html'));
});

router.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src', 'cadastro.html'));
});

router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src', 'index.html'));
}); 

router.get('/logout', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/src', 'logout.html'));
});
app.use('/', router)

const port = parseInt(process.env.PORT) || 3001;
app.listen(port, () => {
    console.log(`Rodando na porta ${port}`);
});
