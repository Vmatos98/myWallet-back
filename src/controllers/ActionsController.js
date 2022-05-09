import chalk from "chalk";
import {ObjectId} from "mongodb";

import db from "./../DB.js";

export async function DeleteValue(req, res) {
    const { authorization, id } = req.headers;  
    const token = authorization.replace('Bearer ', '');
    console.log("id:", id);
    try {
        await db.collection('transactions').deleteOne({ _id: new ObjectId(id) });
        res.send("Deleted").status(200);
        console.log(chalk.bold.blue("Deleted"));
    } catch (err) {
        console.log(chalk.bold.red(err));
        res.send(err).status(500);
    }
}    