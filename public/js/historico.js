const enqueteContainer = document.getElementById('enquete-container');

async function carregarEnquetes() {
    try {
        const response = await fetch('/api/enquete', { method: 'GET' });
        const enquetes = await response.json();

        enquetes.forEach(enquete => {
            const enqueteDiv = document.createElement('div');
            enqueteDiv.classList.add('enquete');

            let opcoesHtml = '';
            if (enquete.opcoes && enquete.opcoes.length > 0) {
                enquete.opcoes.forEach((opcao, index) => {
                    opcoesHtml += `
                        <div class="campo">
                            <label data-lang="pt" ><strong>Opção ${index + 1}:</strong></label>
                            <label  style="display: none;" data-lang="en" ><strong>Option ${index + 1}:</strong></label>
                            <input type="text" class="editable" data-key="opcoes[${index}]" value="${opcao.opcao}" />
                        </div>
                    `;
                });
            } else {
                opcoesHtml = '<p>Sem opções cadastradas</p>';
            }

            enqueteDiv.innerHTML = `
                <div class="campo">
                    <label data-lang="pt" ><strong>Título:</strong></label>
                    <label  style="display: none;" data-lang="en" ><strong>Title:</strong></label>
                    <input type="text" class="editable" data-key="titulo" value="${enquete.titulo}" />
                </div>
                <div class="campo">
                    <label data-lang="pt" ><strong>Início:</strong></label>
                    <label  style="display: none;" data-lang="en" ><strong>Start:</strong></label>
                    <input type="datetime-local" class="editable" data-key="data_inicio" value="${new Date(enquete.data_inicio).toISOString().slice(0, 16)}" />
                </div>
                <div class="campo">
                    <label data-lang="pt" ><strong>Fim:</strong></label>
                    <label  style="display: none;" data-lang="en" ><strong>End:</strong></label>
                    <input  type="datetime-local" class="editable" data-key="data_fim" value="${new Date(enquete.data_fim).toISOString().slice(0, 16)}" />

                </div>
                ${opcoesHtml}

                <div class="botoes">
                    <button data-lang="pt" class="save-btn" data-id="${enquete.id_enquete}" onclick="salvarAlteracoes(this)">Salvar</button>
                    <button style="display: none;" data-lang="en" class="save-btn" data-id="${enquete.id_enquete}" onclick="salvarAlteracoes(this)">Save</button>
                    <button data-lang="pt"  onclick="excluirEnquete(${enquete.id_enquete})">Excluir</button>
                    <button style="display: none;" data-lang="en"  onclick="excluirEnquete(${enquete.id_enquete})">Delete</button>
                </div>
            `;

            enqueteContainer.appendChild(enqueteDiv);
        });
    } catch (error) {
        console.error('Erro ao carregar enquetes:', error);
    }
}

async function salvarAlteracoes(button) {
    const container = button.closest('.enquete');
    const id_enquete = button.getAttribute('data-id');
    
    const titulo = container.querySelector('[data-key="titulo"]').value;
    const dataInicio = container.querySelector('[data-key="data_inicio"]').value;
    const dataFim = container.querySelector('[data-key="data_fim"]').value;

    const opcoesElements = container.querySelectorAll('[data-key^="opcoes"]');
    const opcoes = Array.from(opcoesElements).map((el, index) => ({
        index,
        opcao: el.value,
    }));

    const body = { titulo, dataInicio, dataFim, opcoes: opcoes.map(o => o.opcao) };

    try {
        const response = await fetch(`/api/enquete/${id_enquete}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            
            location.reload();
        } else {
            alert('Erro ao salvar alterações.');
        }
    } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        alert('Erro ao salvar alterações.');
    }
}

async function excluirEnquete(id_enquete) {
    if (confirm('Tem certeza que deseja excluir esta enquete?')) {
        try {
            const response = await fetch(`/api/enquete/${id_enquete}`, { method: 'DELETE' });

            if (response.ok) {
                alert('Enquete excluída com sucesso!');

                location.reload();
            } else {
                alert('Erro ao excluir enquete.');
            }
        } catch (error) {
            console.error('Erro ao excluir enquete:', error);
            alert('Erro ao excluir enquete.');
        }
    }
}

carregarEnquetes();
