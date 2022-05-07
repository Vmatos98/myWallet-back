import { Router } from "express";

import {New_Transaction, Get_All_Transactions} from '../controllers/TransactionsController.js';

const transactionsRouter = Router();

transactionsRouter.post("/new_transaction", New_Transaction);

transactionsRouter.get("/statement", Get_All_Transactions);

export default transactionsRouter;