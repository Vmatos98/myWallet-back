import Joi from "joi";
import chalk from "chalk";
import dayjs from 'dayjs'


import db from "./../DB.js";

const checkSchema = Joi.object({
    value: Joi.number().required(),  
    description: Joi.string().required(),
    type: Joi.string().valid('entrada','saida').required()
});

export async function New_Transaction(req, res) {
    const data = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        res.sendStatus(401);
        console.log(chalk.bold.red("Não enviou token"));
        return;
    }
    const validate = checkSchema.validate(data);
    if(validate.error) {
        res.status(400).send(validate.error.details[0].message);
    }
    
    try{
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

        await db.collection('transactions').insertOne({
            userId: user._id,
            date: dayjs( ).format( 'DD/MM','pt'),
            ...data
        });
        res.sendStatus(201);
    }catch(err){
        console.log(chalk.bold.red(err));
        res.sendStatus(500);
    }
}

export async function Get_All_Transactions(req, res) {
    const data = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');
    if(!token){
        res.sendStatus(401);
        console.log(chalk.bold.red("Não enviou token"));
        return;
    }
    try {
        const session = await db.collection('sessions').findOne({token: authorization});
        const id = session.userId;
        console.log(chalk.bold.green(id));
        const incomes = await db.collection('transactions').find( {$and:[{type:'entrada'},{userId:id}]}).toArray();
        const expenses = await db.collection('transactions').find({$and:[{type:'esaida'},{userId:id}]}).toArray();
        const all = await db.collection('transactions').find({userId:id}).toArray();
        let saldo = 0;
        incomes.forEach(income => {
            saldo += income.value;
        });
        expenses.forEach(expense => {
            saldo -= expense.value;
        });
        all.forEach(transaction => {
            delete transaction.userId;
        });
        res.send({
            all,
            saldo
        })
    } catch (err) {
        console.log(chalk.bold.red(err));
        res.sendStatus(500);
    }
}