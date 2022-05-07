import { Router } from "express";

import {signUp, signIn} from '../controllers/AccessController.js'; 

const accessRouter = Router();


accessRouter.post("/sign-up", signUp);

accessRouter.post("/sig-in", signIn);

export default accessRouter;