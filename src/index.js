import express from 'express';  
import cors from 'cors';
import dotenv from 'dotenv';
import {MongoClient} from "mongodb";
import chalk from 'chalk';
import bcrypt from 'bcrypt';
import Joi from "joi";
import { v4 as uuid } from 'uuid';

dotenv.config();

const app = express().use(express.json()).use(cors());

const mongoClient = new MongoClient(process.env.Mongo_URL);
let db;

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(16).required(),
    name: Joi.string().required()
});

const entrySchema = Joi.object({
    value: Joi.number().required(),  
    description: Joi.string().required()
});

mongoClient.connect().then(() => {
	db = mongoClient.db(process.env.Mongo_DB);
    console.log(chalk.bold.blue("Banco de dados MongoDB conectado na porta", process.env.Mongo_PORT));
});
app.post("/sign-up", async (req, res) => {
    // nome, email, senha
const user = req.body;
const {name, email, password} = user;
const validate = signupSchema.validate({...user});
if(validate.error) {
    res.status(400).send(validate.error.details[0].message);
    return;
}
const checkUser = await db.collection('users').findOne({email});
if (checkUser) {
    res.status(400).send({error: "Usuário já cadastrado"});
    return;
}

const passwordHash = bcrypt.hashSync(password, 10);
await db.collection('users').insertOne({ 
    name:name,
    email:email,
    password: passwordHash
}) 
console.log(user,', ', passwordHash);
res.sendStatus(201);
});

app.post("/sig-in", async (req, res) => {//TODO: gerar token para o usuario
    const {email, password} = req.body;
    const validate = loginSchema.validate({email, password});
    if(validate.error) {
        res.status(400).send(validate.error.details[0].message);
    }
    const user = await db.collection('users').findOne({email});
    if(user && bcrypt.compareSync(password, user.password)){
        const token = uuid();
        await db.collection("sessions").insertOne({
            userId: user._id,
            token
        })
        console.log(chalk.bold.green("Usuário autenticado"));
        res.send(token).status(200);
    }else{
        console.log(chalk.bold.red("Usuário não autenticado"));
        res.sendStatus(401);
    }
});

app.post("/new-income", async (req, res) => {
    const income = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        res.sendStatus(401);
        console.log(chalk.bold.red("Não enviou token"));
        return;
    }
    const validate = entrySchema.validate(income);
    if(validate.error) {
        res.status(400).send(validate.error.details[0].message);
    }
    const session = await db.collection('sessions').findOne({token: authorization});
    if(!session){
        res.sendStatus(401);
        console.log(chalk.bold.red("Token inválido"));
        return;
    }
    const user = await db.collection('users').findOne({_id: session.userId});
    if(!user){
        res.sendStatus(401);
        console.log(chalk.bold.red("Usuário não encontrado"));
        return;
    }
    await db.collection('incomes').insertOne({
        userId: user._id,
        ...income
    });
    res.sendStatus(201);

});

app.post("/new-expense", async (req, res) => {
    const expense = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        res.sendStatus(401);
        console.log(chalk.bold.red("Não enviou token"));
        return;
    }
    const validate = entrySchema.validate(expense);
    if(validate.error) {
        console.log(chalk.bold.red("Erro na validação: ", validate.error.details[0].message));
        res.status(400).send(validate.error.details[0].message);
        return;
    }
    const session = await db.collection('sessions').findOne({token: authorization});
    if(!session){
        res.sendStatus(401);
        console.log(chalk.bold.red("Token inválido"));
        return;
    }
    const user = await db.collection('users').findOne({_id: session.userId});
    if(!user){
        res.sendStatus(401);
        console.log(chalk.bold.red("Usuário não encontrado"));
        return;
    }
    await db.collection('expenses').insertOne({
        userId: user._id,
        ...expense
    })
    res.sendStatus(201);
});

app.listen(process.env.Mongo_PORT);
