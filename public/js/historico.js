const enqueteContainer = document.getElementById('enquete-container');

async function carregarEnquetes() {
    try {
        const response = await fetch('/api/enquete', {
            method: 'GET', 
        });
        const enquetes = await response.json();

        enquetes.forEach(enquete => {
            const enqueteDiv = document.createElement('div');
            enqueteDiv.classList.add('enquete');
            enqueteDiv.innerHTML = `
                <p><strong>Título:</strong> ${enquete.titulo}</p>
                <p><strong>Início:</strong> ${new Date(enquete.data_inicio).toLocaleString()}</p>
                <p><strong>Fim:</strong> ${new Date(enquete.data_fim).toLocaleString()}</p>
                <button onclick="editarEnquete(${enquete.id_enquete})">Editar</button>
                <button onclick="excluirEnquete(${enquete.id_enquete})">Excluir</button>
            `;
            enqueteContainer.appendChild(enqueteDiv);
        });
    } catch (error) {
        console.error('Erro ao carregar enquetes:', error);
    }
}



function editarEnquete(id) {
    const novoTitulo = prompt('Digite o novo título:');
    if (novoTitulo) {
        fetch(`/api/enquete/${id_enquete}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ titulo: novoTitulo })
        }).then(() => {
            alert('Enquete atualizada com sucesso!');
            location.reload();
        }).catch(error => console.error('Erro ao editar enquete:', error));
    }
}


function excluirEnquete(id) {
    if (confirm('Tem certeza que deseja excluir esta enquete?')) {
        fetch(`/api/enquete/${id_enquete}`, {
            method: 'DELETE'
        }).then(() => {
            alert('Enquete excluída com sucesso!');
            location.reload();
        }).catch(error => console.error('Erro ao excluir enquete:', error));
    }
}

carregarEnquetes();
