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

        const status =
            new Date(dataInicio) > new Date()
                ? 'Não Iniciada'
                : new Date(dataFim) < new Date()
                ? 'Encerrada'
                : 'Em Andamento';

        const queryEnquete = 'INSERT INTO Enquete (titulo, data_inicio, data_fim, status) VALUES (?, ?, ?, ?)';
        const [resultEnquete] = await connection.execute(queryEnquete, [titulo, dataInicio, dataFim, status]);

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

app.get('/api/enquete', async (req, res) => {
    try {
        const queryEnquetes = 'SELECT * FROM Enquete';
        const [enquetes] = await connection.execute(queryEnquetes);

        if (enquetes.length === 0) {
            return res.status(404).json({ message: 'Nenhuma enquete encontrada' });
        }

        const queryOpcoes = 'SELECT * FROM Opcao WHERE id_enquete = ?';
        const enquetesComOpcoes = await Promise.all(
            enquetes.map(async (enquete) => {
                const [opcoes] = await connection.execute(queryOpcoes, [enquete.id_enquete]);

                // Atualizar status com base nas datas
                const now = new Date();
                if (now < new Date(enquete.data_inicio)) {
                    enquete.status = 'Não Iniciada';
                } else if (now > new Date(enquete.data_fim)) {
                    enquete.status = 'Encerrada';
                } else {
                    enquete.status = 'Em Andamento';
                }

                return { ...enquete, opcoes };
            })
        );

        return res.status(200).json(enquetesComOpcoes);
    } catch (error) {
        console.error('Erro ao buscar enquetes:', error);
        return res.status(500).json({ error: 'Erro ao buscar enquetes' });
    }
});

app.put('/api/enquete/:id_enquete', async (req, res) => {
    const { id_enquete } = req.params;
    const { titulo, dataInicio, dataFim, opcoes } = req.body;

    if (!titulo || !dataInicio || !dataFim) {
        return res.status(400).json({ error: 'Dados inválidos para atualização' });
    }

    try {
        const status =
            new Date(dataInicio) > new Date()
                ? 'Não Iniciada'
                : new Date(dataFim) < new Date()
                ? 'Encerrada'
                : 'Em Andamento';

        const queryUpdateEnquete =
            'UPDATE Enquete SET titulo = ?, data_inicio = ?, data_fim = ?, status = ? WHERE id_enquete = ?';
        const [result] = await connection.execute(queryUpdateEnquete, [
            titulo,
            dataInicio,
            dataFim,
            status,
            id_enquete,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Enquete não encontrada para atualizar' });
        }

        // Atualizar as opções se forem enviadas
        if (opcoes && Array.isArray(opcoes)) {
            const queryDeleteOpcoes = 'DELETE FROM Opcao WHERE id_enquete = ?';
            await connection.execute(queryDeleteOpcoes, [id_enquete]);

            const queryOpcao = 'INSERT INTO Opcao (id_enquete, opcao) VALUES (?, ?)';
            const opcoesPromises = opcoes.map((opcao) =>
                connection.execute(queryOpcao, [id_enquete, opcao])
            );
            await Promise.all(opcoesPromises);
        }

        return res.status(200).json({ message: 'Enquete atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar enquete:', error.message);
        return res.status(500).json({ error: 'Erro ao atualizar enquete' });
    }
});

app.delete('/api/enquete/:id_enquete', async (req, res) => {
    const { id_enquete } = req.params;

    try {
        const queryDeleteOpcoes = 'DELETE FROM Opcao WHERE id_enquete = ?';
        await connection.execute(queryDeleteOpcoes, [id_enquete]);

        const queryDeleteEnquete = 'DELETE FROM Enquete WHERE id_enquete = ?';
        const [result] = await connection.execute(queryDeleteEnquete, [id_enquete]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Enquete não encontrada para exclusão' });
        }

        return res.status(200).json({ message: 'Enquete e opções excluídas com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir enquete:', error.message);
        return res.status(500).json({ error: 'Erro ao excluir enquete' });
    }
});




const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
