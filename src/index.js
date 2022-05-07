import express from 'express';  
import cors from 'cors';
import dotenv from 'dotenv';
import chalk from 'chalk';
import Joi from "joi";


import db from './DB.js';

import accessRouter from './routes/AccessRouter.js';
import transactionsRouter from './routes/TransactionRouter.js';

dotenv.config();
const app = express().use(express.json()).use(cors());
app.use(accessRouter);
app.use(transactionsRouter);





app.listen(process.env.Mongo_PORT);
