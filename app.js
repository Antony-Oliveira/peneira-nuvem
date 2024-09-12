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


app.get('/', (req, res) => {
    const name = process.env.NAME || 'World';
    res.send(`Peneira!`);
});

const port = parseInt(process.env.PORT) || 3001;
app.listen(port, () => {
    console.log(`Rodando na porta ${port}`);
});
