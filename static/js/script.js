// Seleciona elementos DOM
const listaPresentes = document.getElementById("lista-presentes");
const botaoSubmit = document.querySelector("form button");
const popup = document.getElementById("popup");
const imagePopup = document.getElementById("image-popup");
const locationPopup = document.getElementById("location-popup");
const confirmacaoWhatsapp = document.getElementById("confirmacao-whatsapp");
const linkWhatsapp = document.getElementById("link-whatsapp");

// A lista de presentes será gerada diretamente do template Django
function carregarPresentes() {
  // Pega a lista de presentes que já está no HTML gerado pelo Django
  const presentesHTML = document.querySelectorAll("#lista-presentes li");
  
  // Vamos extrair os dados diretamente dos itens da lista
  const presentes = Array.from(presentesHTML).map((li) => {
    const id = li.querySelector("input").id.split("-")[1];  // Pega o ID do presente
    const gift = li.querySelector("label").childNodes[0].textContent.trim();  // Pega o nome do presente
    const available = !li.querySelector("input").disabled;  // Verifica se está disponível
    return { id, gift, available };
  });

  // Atualiza a lista de presentes com os dados extraídos
  atualizarListaPresentes(presentes);
}

// Atualiza a lista de presentes no DOM
function atualizarListaPresentes(presentes) {
  const fragmento = document.createDocumentFragment();

  listaPresentes.innerHTML = ""; // Limpa a lista antes de adicionar os novos presentes

  presentes.forEach((presente) => {
    const li = document.createElement("li");
    li.className = presente.available ? "" : "indisponivel"; // Marca como indisponível se o presente não estiver disponível
    li.innerHTML = `
      <input type="checkbox" id="presente-${presente.id}" ${!presente.available ? "disabled" : ""} />
      <label for="presente-${presente.id}">
        ${presente.gift} <span class="disponivel">${presente.available ? "Disponível" : "Indisponível"}</span>
      </label>
    `;
    fragmento.appendChild(li); // Adiciona ao fragmento, não ao DOM direto
  });

  listaPresentes.appendChild(fragmento); // Adiciona tudo de uma vez ao DOM
  adicionarEventosCheckbox();
}

// Adiciona eventos aos checkboxes
function adicionarEventosCheckbox() {
  const checkboxes = listaPresentes.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) =>
    checkbox.addEventListener("change", verificarCheckboxes)
  );
}

// Verifica se algum checkbox foi marcado
function verificarCheckboxes() {
  const algumMarcado = Array.from(listaPresentes.querySelectorAll('input[type="checkbox"]'))
    .some((checkbox) => checkbox.checked);
  botaoSubmit.style.display = algumMarcado ? "block" : "none";
}

// Obtém os itens selecionados
function obterItensSelecionados() {
  return Array.from(listaPresentes.querySelectorAll('input[type="checkbox"]:checked')).map(
    (checkbox) => checkbox.nextElementSibling.innerText
  );
}

// Gera a URL do WhatsApp com a mensagem
function gerarMensagemWhatsapp(itens) {
  const numeroWhatsapp = "5573998401801";
  const mensagem = "Olá, gostaria de confirmar minha presença no Chá de Panela.";
  return `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
}

// Marca os presentes selecionados como indisponíveis no backend (Django)
async function marcarPresentesIndisponiveis(itens) {
  const checkboxes = listaPresentes.querySelectorAll('input[type="checkbox"]:checked');
  const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;  // Obtém o token CSRF do DOM

  for (const checkbox of checkboxes) {
    const presenteId = checkbox.id.split("-")[1];
    try {
      const response = await fetch(`/unavailable/${presenteId}/`, {
        method: "PATCH",  // Método PATCH para atualizar
        headers: {
          'X-CSRFToken': csrftoken, // Envia o token CSRF
        }
      });

      const data = await response.json();  // Espera pela resposta JSON do Django

      if (response.ok && data.status === "sucesso") {
        // Se a resposta for ok, marcamos o presente como indisponível no front-end
        const li = checkbox.closest("li");
        li.classList.add("indisponivel");
        li.querySelector(".disponivel").innerText = "Indisponível";
        checkbox.disabled = true;
      } else {
        // Caso contrário, mostramos o erro
        console.error("Erro ao atualizar presente:", data.message);
      }
    } catch (error) {
      console.error("Erro ao atualizar presente:", error);
    }
  }
}





// Manipula o envio do formulário
document.getElementById("form-presentes").addEventListener("submit", async (event) => {
  event.preventDefault();
  const itensSelecionados = obterItensSelecionados();

  if (itensSelecionados.length > 0) {
    const link = gerarMensagemWhatsapp(itensSelecionados);
    linkWhatsapp.href = link;
    confirmacaoWhatsapp.classList.remove('hidden');  // Exibe o popup
    confirmacaoWhatsapp.classList.add('show');
    await marcarPresentesIndisponiveis(itensSelecionados);
  } else {
    alert("Por favor, selecione um item para continuar.");
  }
});

// Manipula os popups
function configurarPopup(popup, abrirBtn, fecharBtn) {
  abrirBtn.addEventListener("click", () => popup.classList.remove("hidden"));
  fecharBtn.addEventListener("click", () => popup.classList.add("hidden"));
  popup.addEventListener("click", (event) => {
    if (event.target === popup) popup.classList.add("hidden");
  });
}

// Configuração dos eventos de popups
document.addEventListener("DOMContentLoaded", () => {
  carregarPresentes(); // Carrega a lista de presentes ao carregar a página
  configurarPopup(popup, document.getElementById("open-popup"), document.getElementById("close-popup"));
  configurarPopup(imagePopup, document.getElementById("open-image-popup"), document.getElementById("close-image-popup"));
  configurarPopup(locationPopup, document.getElementById("open-location-popup"), document.getElementById("close-location-popup"));
});
