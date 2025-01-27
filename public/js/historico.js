const enqueteContainer = document.getElementById('enquete-container');

async function carregarEnquetes() {
    try {
        const response = await fetch('/api/enquete', { method: 'GET' });
        const enquetes = await response.json();

        console.log('Enquetes recebidas:', enquetes); 

        if (enquetes.length === 0) {
            console.log('Nenhuma enquete encontrada.');
        }

        enquetes.forEach(enquete => {
            const enqueteDiv = document.createElement('div');
            enqueteDiv.classList.add('enquete');

            let opcoesHtml = '';
            if (enquete.opcoes && enquete.opcoes.length > 0) {
                enquete.opcoes.forEach((opcao, index) => {
                    opcoesHtml += `
                        <div class="campo opcao" data-index="${index}">
                            <label data-lang="pt"><strong>Opção ${index + 1}:</strong></label>
                            <label style="display: none;" data-lang="en"><strong>Option ${index + 1}:</strong></label>
                            <input type="text" class="editable" data-key="opcao_${enquete.id_enquete}_opcoes_${index}" value="${opcao.opcao}" />
                        </div>
                    `;
                });
            } else {
                opcoesHtml = '<p>Sem opções cadastradas</p>';
            }

            const formatDateForBR = (data) => {
                const date = new Date(data);
                const offset = -3;
                date.setHours(date.getHours() + offset);
                return date.toISOString().slice(0, 16);
            };

            enqueteDiv.innerHTML = `
                <div class="campo">
                    <label data-lang="pt"><strong>Título:</strong></label>
                    <label style="display: none;" data-lang="en"><strong>Title:</strong></label>
                    <input type="text" class="editable" data-key="titulo_${enquete.id_enquete}" value="${enquete.titulo}" />
                </div>
                <div class="campo">
                    <label data-lang="pt"><strong>Início:</strong></label>
                    <label style="display: none;" data-lang="en"><strong>Start:</strong></label>
                    <input type="datetime-local" class="editable" data-key="data_inicio_${enquete.id_enquete}" value="${formatDateForBR(enquete.data_inicio)}" />
                </div>
                <div class="campo">
                    <label data-lang="pt"><strong>Fim:</strong></label>
                    <label style="display: none;" data-lang="en"><strong>End:</strong></label>
                    <input type="datetime-local" class="editable" data-key="data_fim_${enquete.id_enquete}" value="${formatDateForBR(enquete.data_fim)}" />
                </div>

                ${opcoesHtml}

                <div class="botoes">
                    <button data-lang="pt" class="save-btn" data-id="${enquete.id_enquete}" onclick="salvarAlteracoes(this)">Salvar</button>
                    <button style="display: none;" data-lang="en" class="save-btn" data-id="${enquete.id_enquete}" onclick="salvarAlteracoes(this)">Save</button>
                    <button data-lang="pt" onclick="excluirEnquete(${enquete.id_enquete})">Excluir</button>
                    <button style="display: none;" data-lang="en" onclick="excluirEnquete(${enquete.id_enquete})">Delete</button>
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
    
    const titulo = container.querySelector(`[data-key="titulo_${id_enquete}"]`).value;
    const dataInicio = container.querySelector(`[data-key="data_inicio_${id_enquete}"]`).value;
    const dataFim = container.querySelector(`[data-key="data_fim_${id_enquete}"]`).value;

    const opcoesElements = container.querySelectorAll(`[data-key^="opcao_${id_enquete}_"]`);
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
