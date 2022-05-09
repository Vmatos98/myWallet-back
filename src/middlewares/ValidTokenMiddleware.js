import chalk from "chalk";

import db from "./../DB.js";

export async function validToken(req, res, next) {
    const { authorization } = req.headers;
    
    if(!authorization){
        console.log(chalk.bold.red("Não enviou token"));
        res.send("token necessario para continuar").status(422);
    }
    const token = authorization.replace('Bearer ', '');
    try {
        const session = await db.collection('sessions').findOne({token: token});
        if(!session){
            console.log(chalk.bold.red("Token inválido"));
            res.send("token inválido").status(401);
            return;
        }
        if(!session.isValid){
            console.log(chalk.bold.red("Token expirado!"));
            res.send("token expirado").status(401);
            return;
        }
    } catch (error) {
        console.log(chalk.bold.red(error));
        res.send("erro na leitura do token: ",error).status(500);
    }
    next();
}