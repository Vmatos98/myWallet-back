export async function validToken(req, res, next) {
    const { authorization } = req.headers;
    
    if(!authorization){
        console.log(chalk.bold.red("Não enviou token"));
        res.send("token necessario para continuar").status(422);
    }
    next();
}