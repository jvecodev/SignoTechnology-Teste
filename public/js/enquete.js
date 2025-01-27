

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
        <p data-lang="pt"><i class="bi bi-check-circle"></i> Status: <strong>${enquete.status}</strong></p>
        <p style="display: none;" data-lang="en"><i class="bi bi-check-circle"></i> Status: <strong>${enquete.status === 'Não Iniciada' ? 'Not Started' : 'Ended'}</strong></p>

        <p data-lang="pt"><i class="bi bi-calendar-week"></i> Início: ${new Date(enquete.data_inicio).toLocaleString('pt-BR')}</p>
        <p style="display: none;" data-lang="en"><i class="bi bi-calendar-week"></i> Start: ${new Date(enquete.data_inicio).toLocaleString('en-US')}</p>

        <p data-lang="pt"><i class="bi bi-calendar-week"></i> Término: ${new Date(enquete.data_fim).toLocaleString('pt-BR')}</p>
        <p style="display: none;" data-lang="en"><i class="bi bi-calendar-week"></i> End: ${new Date(enquete.data_fim).toLocaleString('en-US')}</p>
        <div class="opcoes" id="opcoes-${enquete.id_enquete}">
          <h4 data-lang="pt">Opções:</h4>
          <h4 style="display: none;" data-lang="en">Options:</h4>
        </div>
      `;

      const opcoesContainer = enqueteCard.querySelector('.opcoes');
      enquete.opcoes.forEach((opcao) => {
        const opcaoButton = document.createElement('button');
        opcaoButton.classList.add('opcao-btn');
        opcaoButton.textContent = `${opcao.opcao} - Votos: 0`;
        opcaoButton.dataset.idOpcao = opcao.id_opcao;

        fetch(`/api/voto?id_enquete=${enquete.id_enquete}`)
          .then((response) => response.json())
          .then((votos) => {
            const opcaoVoto = votos.find((v) => v.id_opcao === opcao.id_opcao);
            if (opcaoVoto) {
              opcaoButton.textContent = `${opcao.opcao} - Votos: ${opcaoVoto.votos}`;
            }
          });

        opcaoButton.addEventListener('click', (event) => {
          opcoesContainer.querySelectorAll('.opcao-btn').forEach((btn) =>
            btn.classList.remove('selected')
          );
          event.target.classList.add('selected');

          const votarBtn = enqueteCard.querySelector('.btn-votar');
          if (votarBtn) {
            votarBtn.disabled = false;
            votarBtn.dataset.idOpcao = opcao.id_opcao;
          }
        });

        opcoesContainer.appendChild(opcaoButton);
      });

      
      if (enquete.status !== 'Não Iniciada' && enquete.status !== 'Encerrada') {
        const votarBtn = document.createElement('button');
        votarBtn.dataset.lang = 'pt';
        votarBtn.classList.add('btn-votar');
        votarBtn.dataset.enquete = enquete.id_enquete;
        votarBtn.disabled = true;
        votarBtn.textContent = 'Votar';
        

        const votarBtnEn = document.createElement('button');
        votarBtnEn.style.display = 'none';
        votarBtnEn.dataset.lang = 'en';
        votarBtnEn.classList.add('btn-votar');
        votarBtnEn.dataset.enquete = enquete.id_enquete;
        votarBtnEn.disabled = true;
        votarBtnEn.textContent = 'Vote';
        

        enqueteCard.appendChild(votarBtn);
        enqueteCard.appendChild(votarBtnEn);


      }

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


document.body.addEventListener('click', async (event) => {
  if (event.target.matches('.btn-votar')) {
    const idEnquete = event.target.dataset.enquete;
    const idOpcao = event.target.dataset.idOpcao;
    const opcoesContainer = event.target.closest('.enquete-card').querySelector('.opcoes');

    
    try {
      const response = await fetch(`/api/enquete/${idEnquete}`);
      const enquete = await response.json();

      if (response.ok) {
        if (enquete.status === 'Não Iniciada' || enquete.status === 'Encerrada') {
        enqueteCard.innerHTML = `
        <button style="display: none;" data-lang="pt" class="btn-votar" data-enquete="${enquete.id_enquete}" disabled>Votar</button>
        <button style="display: none;" data-lang="en" class="btn-votar" data-enquete="${enquete.id_enquete}" disabled>Vote</button>`
          
          alert(`Você não pode votar nesta enquete. Motivo: ${enquete.status}`);
          return; 
        }

        
        const voteResponse = await fetch('/api/voto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_enquete: idEnquete, id_opcao: idOpcao }),
        });

        const result = await voteResponse.json();
        if (voteResponse.ok) {
          alert('Voto computado com sucesso!');
          window.location.reload();
          
        
          const opcaoButton = opcoesContainer.querySelector(`button[data-id-opcao="${idOpcao}"]`);
          if (opcaoButton) {
            opcaoButton.textContent = `${opcaoButton.textContent.split(' - ')[0]} - Votos: ${result.votos}`;
          }
        } else {
          alert(`Erro: ${result.error}`);
        }
      } else {
        alert(`Erro: ${enquete.error}`);
      }
    } catch (error) {
      alert('Erro ao verificar status da enquete. Tente novamente mais tarde.');
    }
  }
});

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
