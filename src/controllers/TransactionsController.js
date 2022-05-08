import Joi from "joi";
import chalk from "chalk";
import dayjs from 'dayjs'


import db from "./../DB.js";
let saldo = 0;
const checkSchema = Joi.object({
    value: Joi.number().required(),  
    description: Joi.string().required(),
    type: Joi.string().valid('entrada','saida').required()
});

export async function New_Transaction(req, res) {
    const data = req.body;
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer ', '');
    const validate = checkSchema.validate(data);
    if(validate.error) {
        res.status(400).send(validate.error.details[0].message);
    }
    if(data.value > saldo){
        console.log(chalk.bold.red("Saldo insuficiente"));
        res.status(400).send({error: "Saldo insuficiente"});
        return;
    }
    try{
        const session = await db.collection('sessions').findOne({token: token});
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
    console.log(chalk.bold.green("Get_All_Transactions"));
    const { authorization } = req.headers;
    const token = authorization.replace('Bearer ', '');
    try {
        saldo = 0;
        const session = await db.collection('sessions').findOne({token: token});
        const id = session.userId;
        const incomes = await db.collection('transactions').find( {$and:[{type:'entrada'},{userId:id}]}).toArray();
        if(!incomes){
            console.log(chalk.bold.red("Nenhuma entrada encontrada"));
        }
        const expenses = await db.collection('transactions').find({$and:[{type:'saida'},{userId:id}]}).toArray();
        if(!expenses){
            console.log(chalk.bold.red("Nenhuma saída encontrada"));
        }
        const all = await db.collection('transactions').find({userId:id}).toArray();
        const user= await db.collection('users').findOne({_id: id});
        const {name} = user;
        
        incomes.forEach(income => {
            saldo += parseInt(income.value);
        });
        expenses.forEach(expense => {
            saldo -= parseInt(expense.value);
        });
        all.forEach(transaction => {
            delete transaction.userId;
        });
        res.send({
            all,
            saldo,
            name
        })
    } catch (err) {
        console.log(chalk.bold.red(err));
        res.sendStatus(500);
    }
}