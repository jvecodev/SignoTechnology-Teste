document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('enquete-form');
    const btnAddOpcao = document.getElementById('add-opcao');
    const divErro = document.createElement('div');
    divErro.id = 'divErro';
    divErro.style.color = 'red';
    form.insertBefore(divErro, form.firstChild); 

    let opcaoCounter = 3;

    form.setAttribute('novalidate', 'true');

    btnAddOpcao.addEventListener('click', function () {
        opcaoCounter++;

        const newOptionPt = document.createElement('input');
        newOptionPt.type = 'text';
        newOptionPt.name = `opcao-${opcaoCounter}`;
        newOptionPt.required = true;
        newOptionPt.setAttribute('data-lang', 'pt');
        newOptionPt.placeholder = `Opção ${opcaoCounter}`;
        form.insertBefore(newOptionPt, btnAddOpcao.closest('.btn'));

        const newOptionEn = document.createElement('input');
        newOptionEn.type = 'text';
        newOptionEn.name = `opcao-${opcaoCounter}`;
        newOptionEn.required = true;
        newOptionEn.setAttribute('data-lang', 'en');
        newOptionEn.placeholder = `Option ${opcaoCounter}`;
        newOptionEn.style.display = 'none';
        form.insertBefore(newOptionEn, btnAddOpcao.closest('.btn'));
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        divErro.textContent = ''; 

        const titulo = document.querySelector('input[name="titulo"]:not([style*="display: none"])')?.value.trim();
        const dataInicio = document.querySelector('input[name="data-inicio"]:not([style*="display: none"])')?.value.trim();
        const dataFim = document.querySelector('input[name="data-fim"]:not([style*="display: none"])')?.value.trim();

        // Captura todas as opções, incluindo as dinâmicas
        const opcoes = Array.from(
            document.querySelectorAll('input[name^="opcao-"]')
        ).filter(input => input.style.display !== 'none') // Considera apenas os inputs visíveis
          .map(input => input.value.trim())
          .filter(opcao => opcao !== ''); // Remove opções vazias

        // Validação
        if (!titulo || !dataInicio || !dataFim || opcoes.length < 3) {
            divErro.textContent = 'Preencha todos os campos obrigatórios e pelo menos 3 opções.';
            return;
        }

        const enquete = { titulo, dataInicio, dataFim, opcoes };
        registrarEnquete(enquete);
    });

    function registrarEnquete(enquete) {
        fetch('/api/enquete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(enquete),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Erro ao cadastrar');
                    });
                }
                return response.json();
            })
            .then(() => {
                alert('Enquete cadastrada com sucesso!');
                location.href = 'enquetes.html';
            })
            .catch(error => {
                console.error(error.message);
                divErro.textContent = error.message || 'Erro ao cadastrar enquete';
            });
    }
});
