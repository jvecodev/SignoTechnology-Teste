
CREATE TABLE Enquete (
    id_enquete INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL,
    status ENUM('Não Iniciada', 'Em Andamento', 'Encerrada') DEFAULT 'Não Iniciada'
);



CREATE TABLE Opcao (
    id_opcao INT AUTO_INCREMENT PRIMARY KEY,
    id_enquete INT NOT NULL,
    opcao varchar(50) not null,
    FOREIGN KEY (id_enquete) REFERENCES Enquete(id_enquete) ON DELETE CASCADE
);



CREATE TABLE Voto (
  id_voto INT AUTO_INCREMENT PRIMARY KEY,
  id_opcao INT NOT NULL,
  data_voto DATETIME DEFAULT CURRENT_TIMESTAMP,
  quantidade_voto INT NOT NULL, 
  FOREIGN KEY (id_opcao) REFERENCES Opcao(id_opcao) ON DELETE CASCADE
);

ALTER TABLE Voto
ADD COLUMN id_enquete INT NOT NULL,
ADD CONSTRAINT FK_Voto_Enquete FOREIGN KEY (id_enquete) REFERENCES Enquete(id_enquete) ON DELETE CASCADE;












