async function carregarEnquetes() {
  try {
    const response = await fetch('/api/enquete');
    if (!response.ok) throw new Error('Erro ao carregar enquetes');

    const enquetes = await response.json();

    const track = document.querySelector('.carousel-track');
    track.innerHTML = '';

    enquetes.forEach((enquete) => {
      const enqueteCard = document.createElement('div');
      enqueteCard.classList.add('enquete-card');

      enqueteCard.innerHTML = `
        <h3>${enquete.titulo}</h3>
        <p><i class="bi bi-check-circle"></i>  Status: <strong>${enquete.status}</strong></p>
        <p><i class="bi bi-calendar-week"></i>  Início: ${new Date(
          enquete.data_inicio
        ).toLocaleDateString('pt-BR')}</p>
        <p><i class="bi bi-calendar-week"></i>  Término: ${new Date(
          enquete.data_fim
        ).toLocaleDateString('pt-BR')}</p>
        <div class="opcoes">
          <h4>Opções:</h4>
          ${enquete.opcoes
            .map((opcao) => `<p class="opcao"> +  ${opcao.opcao}</p>`)
            .join('')}
        </div>
        <div class="btn-votar">
          <button>Votar</button>
        </div>
      `;

      track.appendChild(enqueteCard);
    });

    iniciarCarrossel();
  } catch (error) {
    console.error(error.message);
    const track = document.querySelector('.carousel-track');
    track.innerHTML =
      '<p>Não foi possível carregar as enquetes no momento.</p>';
  }
}


function iniciarCarrossel() {
  const track = document.querySelector('.carousel-track');
  const cards = Array.from(track.children);
  const prevButton = document.querySelector('.carousel-btn.prev');
  const nextButton = document.querySelector('.carousel-btn.next');
  let currentIndex = 0;

  function updateButtons() {
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === cards.length - 1;
  }

  function moveToSlide(index) {
    const cardWidth = cards[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${index * cardWidth}px)`;
    currentIndex = index;
    updateButtons();
  }

  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) moveToSlide(currentIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    if (currentIndex < cards.length - 1) moveToSlide(currentIndex + 1);
  });

  updateButtons();
}

document.addEventListener('DOMContentLoaded', carregarEnquetes);


function abrirModal(enquete) {
  const modal = document.querySelector('#modal-votar');
  const opcoesContainer = modal.querySelector('.modal-opcoes');
  opcoesContainer.innerHTML = ''; // Limpar opções anteriores

  // Criar opções no modal
  enquete.opcoes.forEach((opcao) => {
    const opcaoElement = document.createElement('div');
    opcaoElement.classList.add('opcao');
    opcaoElement.innerHTML = `
      <span>${opcao.opcao}</span>
      <input type="radio" name="opcao" value="${opcao.opcao}">
    `;
    opcoesContainer.appendChild(opcaoElement);
  });

  // Exibir modal
  modal.classList.add('mostrar');

  // Adicionar evento ao botão de fechar
  const fecharButton = document.querySelector('#fechar-modal');
  fecharButton.onclick = () => modal.classList.remove('mostrar');

  // Adicionar evento ao clique na opção
  opcoesContainer.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', async () => {
      const opcaoEscolhida = input.value;

      try {
        // Registrar voto no servidor
        const response = await fetch('/api/votar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enqueteId: enquete.id, opcao: opcaoEscolhida }),
        });

        if (!response.ok) throw new Error('Erro ao registrar voto');

        alert(`Voto registrado na opção: ${opcaoEscolhida}`);
        modal.classList.remove('mostrar');

        // Atualizar número de votos no front-end
        const votosAtualizados = await response.json();
        atualizarVotos(enquete.id, votosAtualizados);
      } catch (error) {
        console.error(error.message);
        alert('Erro ao registrar o voto. Tente novamente.');
      }
    });
  });
}

function atualizarVotos(enqueteId, votos) {
  const enqueteCard = document.querySelector(
    `.enquete-card[data-id="${enqueteId}"]`
  );
  const opcoesContainer = enqueteCard.querySelector('.opcoes');
  opcoesContainer.innerHTML = `
    <h4>Opções:</h4>
    ${votos
      .map(
        (opcao) =>
          `<p class="opcao"> + ${opcao.opcao} - ${opcao.votos} votos</p>`
      )
      .join('')}
  `;
}

// Adicionar evento de clique no botão "Votar"
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn-votar button').forEach((button) => {
    button.addEventListener('click', (event) => {
      const enqueteCard = event.target.closest('.enquete-card');
      const enqueteId = enqueteCard.dataset.id;

      
      fetch(`/api/enquete/${enqueteId}`)
        .then((res) => res.json())
        .then((enquete) => abrirModal(enquete))
        .catch((err) => console.error(err.message));
    });
  });
});
