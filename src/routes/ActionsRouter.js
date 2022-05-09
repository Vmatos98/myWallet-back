import { Router } from "express";

import {DeleteValue} from './../controllers/ActionsController.js';

const actionsRouter = Router();

actionsRouter.delete("/delete_value", DeleteValue);

export default actionsRouter;