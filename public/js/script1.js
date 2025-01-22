const inputTitle = document.getElementById('titulo');
const dataInicio = document.getElementById('data-inicio');
const dataFim = document.getElementById('data-fim');
const opcao1 = document.getElementById('opcao-1');
const opcao2 = document.getElementById('opcao-2');
const opcao3 = document.getElementById('opcao-3');
const divErro = document.getElementById('erro');
  
function cadastrarEnquete(){
    if (inputTitle && dataInicio && dataFim && opcao1 && opcao2 && opcao3) {
        const enquete = { inputTitle, dataInicio, dataFim, opcao1, opcao2, opcao3 };

        fetch('api/enquete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(enquete),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => { throw new Error(data.message || 'Erro ao cadastrar'); });
            } 
            return response.json();
        })
        .then(data => {
            alert('Enquete cadastrada com sucesso', data);
            location.href = 'votacao.html';
        })
        .catch(error => {
            console.error(error.message);
            divErro.innerHTML = 'Erro ao cadastrar enquete';
            divErro.style.color = 'red';
        });
    }
}

