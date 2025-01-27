import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { connection } from './dbConnection.js';
import moment from 'moment-timezone';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static(path.join('../public')));

app.post('/api/enquete', async (req, res) => {
    const { titulo, dataInicio, dataFim, opcoes } = req.body;

    if (!titulo || !dataInicio || !dataFim || !Array.isArray(opcoes) || opcoes.length < 3) {
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

  console.log('Recebido no backend:', req.body); // Log para debugar

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

    if (opcoes && Array.isArray(opcoes)) {
      const queryDeleteOpcoes = 'DELETE FROM Opcao WHERE id_enquete = ?';
      await connection.execute(queryDeleteOpcoes, [id_enquete]);

      
      const queryOpcaoInsert = 'INSERT INTO Opcao (id_enquete, opcao) VALUES (?, ?)';
      const opcoesPromises = opcoes.map((opcao, index) =>
        connection.execute(queryOpcaoInsert, [id_enquete, opcao])
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


app.post('/api/voto', async (req, res) => {
  const { id_enquete, id_opcao } = req.body;

  if (!id_enquete || !id_opcao) {
    return res.status(400).json({ error: 'Campos id_enquete e id_opcao são obrigatórios.' });
  }

  try {
    
    const dataVoto = moment().tz('America/Sao_Paulo').format('YYYY-MM-DD HH:mm:ss');

    const query = `
      INSERT INTO Voto (id_opcao, id_enquete, quantidade_voto, data_voto)
      VALUES (?, ?, 1, ?)
      ON DUPLICATE KEY UPDATE
        quantidade_voto = quantidade_voto + 1,
        data_voto = ?
    `;
    await connection.execute(query, [id_opcao, id_enquete, dataVoto, dataVoto]);

    const votosQuery = `
      SELECT SUM(quantidade_voto) AS votos
      FROM Voto
      WHERE id_opcao = ? AND id_enquete = ?
    `;
    const [result] = await connection.execute(votosQuery, [id_opcao, id_enquete]);

    return res.status(200).json({ votos: result[0].votos });
  } catch (error) {
    console.error('Erro ao registrar voto:', error);
    return res.status(500).json({ error: 'Erro ao registrar voto.' });
  }
});
  
  app.get('/api/voto', async (req, res) => {
  const { id_enquete } = req.query;

  if (!id_enquete) {
    return res.status(400).json({ error: 'É necessário informar o id_enquete.' });
  }

  try {
    const query = `
      SELECT o.id_opcao, o.opcao, 
             COALESCE(COUNT(v.id_voto), 0) AS votos
      FROM Opcao o
      LEFT JOIN Voto v ON v.id_opcao = o.id_opcao
      WHERE o.id_enquete = ?
      GROUP BY o.id_opcao
    `;

    const [opcoes] = await connection.execute(query, [id_enquete]);

    if (opcoes.length === 0) {
      return res.status(404).json({ error: 'Nenhuma opção encontrada para essa enquete.' });
    }

    return res.status(200).json(opcoes);
  } catch (error) {
    console.error('Erro ao buscar votos:', error);
    return res.status(500).json({ error: 'Erro ao buscar votos.' });
  }
});


app.get('/api/enquete/:id_enquete', async (req, res) => {
    const { id_enquete } = req.params;
  
    try {
      const queryEnquete = 'SELECT * FROM Enquete WHERE id_enquete = ?';
      const [enquete] = await connection.execute(queryEnquete, [id_enquete]);
  
      if (enquete.length === 0) {
        return res.status(404).json({ error: 'Enquete não encontrada.' });
      }
  
      const queryOpcoes = 'SELECT * FROM Opcao WHERE id_enquete = ?';
      const [opcoes] = await connection.execute(queryOpcoes, [id_enquete]);
  
      
      const now = new Date();
      if (now < new Date(enquete[0].data_inicio)) {
        enquete[0].status = 'Não Iniciada';
      } else if (now > new Date(enquete[0].data_fim)) {
        enquete[0].status = 'Encerrada';
      } else {
        enquete[0].status = 'Em Andamento';
      }
  
      return res.status(200).json({ ...enquete[0], opcoes });
    } catch (error) {
      console.error('Erro ao buscar enquete:', error);
      return res.status(500).json({ error: 'Erro ao buscar enquete' });
    }
  });
  

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
