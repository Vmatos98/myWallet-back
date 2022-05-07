import express from 'express';  
import cors from 'cors';
import dotenv from 'dotenv';
import chalk from 'chalk';
import Joi from "joi";


import db from './DB.js';
import {signUp, signIn} from './controllers/AccessController.js'; 
import {New_Transaction, Get_All_Transactions} from './controllers/TransactionsController.js';
dotenv.config();
const app = express().use(express.json()).use(cors());


app.post("/sign-up", signUp);

app.post("/sig-in", signIn);

app.post("/new_transaction", New_Transaction);

app.get("/statement", Get_All_Transactions);


app.listen(process.env.Mongo_PORT);
