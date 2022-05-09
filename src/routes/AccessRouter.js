import { Router } from "express";

import {signUp, signIn, signOut} from '../controllers/AccessController.js'; 
import {validToken} from './../middlewares/ValidTokenMiddleware.js';

const accessRouter = Router();


accessRouter.post("/sign-up", signUp);

accessRouter.post("/sig-in", signIn);

accessRouter.post("/sign-out", validToken, signOut);

export default accessRouter;