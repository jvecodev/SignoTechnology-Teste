

CREATE TABLE Enquete (
    id_enquete INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    data_inicio DATETIME NOT NULL,
    data_fim DATETIME NOT NULL
);


CREATE TABLE Opcao (
    id_opcao INT AUTO_INCREMENT PRIMARY KEY,
    id_enquete INT NOT NULL,
    opcao varchar(50) not null,
    votos INT DEFAULT 0,
    FOREIGN KEY (id_enquete) REFERENCES Enquete(id_enquete) ON DELETE CASCADE
);


CREATE TABLE Voto (
    id_voto INT AUTO_INCREMENT PRIMARY KEY,
    id_opcao INT NOT NULL,
    data_voto DATETIME DEFAULT CURRENT_TIMESTAMP,
    quantidade_voto int not null, 
    FOREIGN KEY (id_opcao) REFERENCES Opcao(id_opcao) ON DELETE CASCADE
);




