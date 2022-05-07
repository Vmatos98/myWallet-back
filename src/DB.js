import {MongoClient} from "mongodb";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

let db = null;

try{
    const mongoClient = new MongoClient(process.env.Mongo_URL);
    await mongoClient.connect();
    db = mongoClient.db(process.env.Mongo_DB);
    console.log(chalk.bold.blue("Banco de dados MongoDB conectado na porta", process.env.Mongo_PORT));
}catch(err){
    console.log(chalk.bold.red("Erro ao conectar no banco de dados", err));
}

export default db;