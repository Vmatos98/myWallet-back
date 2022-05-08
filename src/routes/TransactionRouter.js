import { Router } from "express";

import {New_Transaction, Get_All_Transactions} from '../controllers/TransactionsController.js';
import {validToken} from './../middlewares/ValidTokenMiddleware.js';
const transactionsRouter = Router();

transactionsRouter.post("/new_transaction", validToken, New_Transaction);

transactionsRouter.get("/statement",validToken, Get_All_Transactions);

export default transactionsRouter;