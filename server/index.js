import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import path from 'path';

const app = express();

app.use(express.static(path.join('../public')));

dotenv.config();

const DB_URL = process.env.DB_URL;




async function verificarConexao() {
    try {
        const connection = await mysql.createConnection(DB_URL);
        console.log('Conexão com o banco de dados realizada com sucesso!');
        return connection;
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados: ', error);
    }
}

const connection =  await verificarConexao();

function autenticarToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token não fornecido ou malformado' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        return res.status(403).json({ error: 'Token inválido' });
    }
}


app.post('/api/enquete', autenticarToken, async (req, res) => {
    const {titulo, dataInicio, dataFim} = req.body;
    if (!titulo || !dataInicio || !dataFim || !opcao1 || !opcao2 || !opcao3) {
        return res.status(400).json({ error: 'Dados inválidos' });
    }
    try{
        const query = 'INSERT INTO enquete (titulo, data_inicio, data_fim) VALUES (?, ?, ?)';
        const [result] = await connection.execute(query, [titulo, dataInicio, dataFim]);
        const token = jwt.sign(
            {id_enquete: result.insertId},
            process.env.JWT_SECRET,
            {expiresIn: '30d'}
            
        );
        return res.status(201).json({ message: 'Enquete cadastrada com sucesso', token });
    }catch(error){
        console.error('Erro ao cadastrar enquete: ', error);
        return res.status(500).json({ error: 'Erro ao cadastrar enquete' });
    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});





