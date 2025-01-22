import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DB_URL = process.env.DB_URL;

export const connection = await mysql.createConnection(DB_URL);

connection.connect()
    .then(() => console.log('Conexão com o banco de dados realizada com sucesso!'))
    .catch((error) => {
        console.error('Erro ao conectar com o banco de dados:', error);
        process.exit(1); 
    });


