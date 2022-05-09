import Joi from "joi";
import chalk from "chalk";
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

import db from "./../DB.js";

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(16).required(),
    confirmPassword: Joi.string().min(8).max(16).required(),
    name: Joi.string().required()
});

export async function signUp(req, res) {
    console.log(chalk.bold.green("Signup"));
    const user = req.body;
    const {name, email, password} = user;
    const validate = signupSchema.validate({...user});
    if(validate.error) {
        console.log(chalk.bold.red("Erro ao criar usuário ",validate.error.details[0].message));
        res.status(400).send(validate.error.details[0].message);
        return;
    }
    try {
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
        console.log(chalk.bold.green("Usuário criado"));
        res.sendStatus(201);
    } catch (err) {
        console.log(chalk.bold.red("Erro ao criar usuário ",err));
        res.status(500).send(err);
    }
}

export async function signIn(req, res) {
    const {email, password} = req.body;
    const validate = loginSchema.validate({email, password});
    if(validate.error) {
        res.status(400).send(validate.error.details[0].message);
    }
    try{
    const user = await db.collection('users').findOne({email});
    if(user && bcrypt.compareSync(password, user.password)){
        const token = uuid();
        await db.collection("sessions").insertOne({
            userId: user._id,
            token,
            isValid: true
        })
        console.log(chalk.bold.green("Usuário autenticado"));
        res.send(token).status(200);
    }else{
        console.log(chalk.bold.red("Usuário não autenticado"));
        res.sendStatus(401);
    }
    }catch(err){
        console.log(chalk.bold.red("Erro ao autenticar usuário"));
        res.sendStatus(401);
    }
}

export async function signOut(req, res) {
    const {authorization} = req.headers;
    const token = authorization.replace('Bearer ', '');
    try {
        await db.collection('sessions').updateOne({token}, {$set: {isValid: false}});
        res.sendStatus(200);
        console.log(chalk.bold.green("Usuário desautenticado"));
    } catch (err) {
        console.log(chalk.bold.red("Erro ao desautenticar usuário"));
        res.sendStatus(401);
    }
}