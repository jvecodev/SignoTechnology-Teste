import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { connection } from './dbConnection.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static(path.join('../public')));

app.post('/api/enquete', async (req, res) => {
    const { titulo, dataInicio, dataFim, opcoes } = req.body;

    if (!titulo || !dataInicio || !dataFim || !Array.isArray(opcoes) || opcoes.length !== 3) {
        return res.status(400).json({ error: 'Dados inválidos' });
    }

    try {
        
        const queryEnquete = 'INSERT INTO Enquete (titulo, data_inicio, data_fim) VALUES (?, ?, ?)';
        const [resultEnquete] = await connection.execute(queryEnquete, [titulo, dataInicio, dataFim]);

        const id_enquete = resultEnquete.insertId;

        
        const queryOpcao = 'INSERT INTO Opcao (id_enquete, opcao) VALUES (?, ?)';
        const opcoesPromises = opcoes.map(opcao =>
            connection.execute(queryOpcao, [id_enquete, opcao])
        );
        await Promise.all(opcoesPromises);

       

        return res.status(201).json({ message: 'Enquete cadastrada com sucesso', id_enquete });
    } catch (error) {
        console.error('Erro ao cadastrar enquete:', error);
        return res.status(500).json({ error: 'Erro ao cadastrar enquete' });
    }
});




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
