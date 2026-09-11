// Mapeia dinamicamente a pasta de ícones para o Webpack processar os SVGs
const iconesContext = require.context('./icons', false, /\.svg$/);
//
const MAPA_ICONES = {
  "clear-day": iconesContext("./clear-day.svg"),
  "clear-night": iconesContext("./clear-night.svg"),
  "partly-cloudy-day": iconesContext("./partly-cloudy-day.svg"),
  "partly-cloudy-night": iconesContext("./partly-cloudy-night.svg"),
  cloudy: iconesContext("./cloudy.svg"),
  rain: iconesContext("./rain.svg"),
  "showers-day": iconesContext("./showers-day.svg"),
  "showers-night": iconesContext("./showers-night.svg"),
  "thunder-rain": iconesContext("./thunder-rain.svg"),
  "thunder-showers-day": iconesContext("./thunder-showers-day.svg"),
  "thunder-showers-night": iconesContext("./thunder-showers-night.svg"),
  snow: iconesContext("./snow.svg"),
  fog: iconesContext("./fog.svg"),
  wind: iconesContext("./wind.svg"),
};
//
const size1 = 48;
const size2 = 86;
//
class ClimaUI {
  //
  constructor() {
    // Seletores da busca no Header
    this.inptBuscaHeader = document.querySelector("#inpt-busca-header");
    this.btnBuscaHeader = document.querySelector("#botao-header");

    // Seletores da busca no Modal
    this.inptBuscaModal = document.querySelector("#inpt-busca-modal");
    this.btnBuscaModal = document.querySelector("#botao-modal");
    this.modalOverlay = document.querySelector(".modal");
    this.body = document.body;
    this.html = document.documentElement;

    // Overlay de carregamento
    this.loaderOverlay = document.querySelector(".conteiner");

    // Seletores do Dia Atual
    this.lblCidade = document.querySelector(".ttl-cidade");
    this.lblIcone = document.querySelector("#clima-icone");
    this.lblTemperatura = document.querySelector("#clima-temperatura");
    this.lblPrecipitacao = document.querySelector("#clima-precipitacao");
    this.lblHumidade = document.querySelector("#clima-humidade");
    this.lblVento = document.querySelector("#clima-vento");
    this.lblDiaSemana = document.querySelector("#clima-dia");
    this.lblData = document.querySelector("#clima-data");
    this.lblCondicao = document.querySelector("#clima-condicao");
    this.lblResumo = document.querySelector("#clima-resumo");
    this.lblUnidade = document.querySelector("#clima-unidade");
    [this.btnCelsius, this.btnFahrenheit] =
      document.querySelectorAll(".btn-temp");

    // Container dos 7 dias
    this.containerPrevisao = document.querySelector(".sessao-previsao");

    this.indexDiaSelecionado = 0;

    this.#botaoTempClique();
    this.#escutarCliqueSemana();
    this.#bodyEhtmlModalToggle();
  }
  //
  #bodyEhtmlModalToggle() {
    //adiciona o modal-aberto para aplicar o overflow hidden no css
    if (this.body && this.html) {
      this.body.classList.toggle("modal-aberto");
      this.html.classList.toggle("modal-aberto");
    }
  }
  // Método para ocultar o modal após uma busca bem-sucedida
  modalFechar() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add("oculto"); // ✅ Só adiciona, nunca remove
      this.body.classList.remove("modal-aberto");
      this.html.classList.remove("modal-aberto");
    }
  }
  // Método que pega a cidade no input
  buscainputCidade(funcao) {
    // Clique no Header
    this.btnBuscaHeader.addEventListener("click", () => {
      const cidadeBuscada = this.inptBuscaHeader.value.trim();
      if (cidadeBuscada !== "") funcao(cidadeBuscada);
    });

    // Clique no Modal
    this.btnBuscaModal.addEventListener("click", (event) => {
      event.preventDefault(); // Previne recarregamento se o botão estiver dentro de um <form>
      const cidadeBuscada = this.inptBuscaModal.value.trim();
      if (cidadeBuscada !== "") funcao(cidadeBuscada);
    });

    this.#teclaEnter(funcao);
  }
  // Método que vai receber o objeto pronto da ClimaAPI
  exibirDados(dadosProntos) {
    if (!dadosProntos) return;
    this.dadosAtuais = dadosProntos; // Salva o estado atual
    this.indexDiaSelecionado = 0;

    // 1. Atualiza a cidade e o resumo
    this.lblCidade.textContent = dadosProntos.localizacao;
    this.lblResumo.textContent = dadosProntos.resumoDeHoje;

    // 2. Preenche os dados do dia atual
    this.#renderizarHoje(dadosProntos.infoDiaAtual);

    // 3. Desenha os 7 cards da semana
    this.#renderizarSemana(dadosProntos.previsaoDias);
  }
  //
  rodaCarregando() {
    this.loaderOverlay.classList.toggle("escondido");
  }
  //
  #teclaEnter() {
    // 3. Evento do Enter no Input
    this.inptBuscaHeader.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.btnBuscaHeader.click();
      }
    });

    // Enter no Input do Modal
    this.inptBuscaModal.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.btnBuscaModal.click();
      }
    });
  }
  //
  #botaoTempClique() {
    this.btnCelsius.addEventListener("click", () => {
      this.btnCelsius.classList.add("active");
      this.btnFahrenheit.classList.remove("active");
      this.lblUnidade.textContent = "°C";
      //
      if (this.dadosAtuais) {
        this.#renderizarHoje(
          this.dadosAtuais.previsaoDias[this.indexDiaSelecionado],
        );
        this.#renderizarSemana(this.dadosAtuais.previsaoDias);
      }
    });
    this.btnFahrenheit.addEventListener("click", () => {
      this.btnFahrenheit.classList.add("active");
      this.btnCelsius.classList.remove("active");
      this.lblUnidade.textContent = "°F";
      if (this.dadosAtuais) {
        this.#renderizarHoje(
          this.dadosAtuais.previsaoDias[this.indexDiaSelecionado],
        );
        this.#renderizarSemana(this.dadosAtuais.previsaoDias);
      }
    });
  }
  //
  #escutarCliqueSemana() {
    this.containerPrevisao.addEventListener("click", (e) => {
      // 1. Identifica o card clicado primeiro
      const card = e.target.closest(".previsao-dia");

      // 2. Se não clicou em um card valido ou não há dados, encerra a execução
      if (!card || !this.dadosAtuais) return;

      // 3. Remove a classe 'ativo' de todos os cards
      this.containerPrevisao
        .querySelectorAll(".previsao-dia")
        .forEach((c) => c.classList.remove("ativo"));

      // 4. Aplica a classe 'ativo' apenas no card clicado
      card.classList.add("ativo");

      // 5. Resgata o índice e atualiza o painel principal
      const index = Number(card.dataset.index);
      const diaSelecionado = this.dadosAtuais.previsaoDias[index];
      this.indexDiaSelecionado = index;
      //
      this.#renderizarHoje(diaSelecionado);
    });
  }
  // Converte Celsius para Fahrenheit
  #celsiusParaFahrenheit(celsius) {
    return Math.round(celsius * 1.8 + 32);
  }
  // Retorna o valor formatado de acordo com o botão ativo
  #obterTempExibicao(valorCelsius) {
    if (typeof valorCelsius !== "number") return valorCelsius;

    const eFahrenheit = this.btnFahrenheit.classList.contains("active");

    if (eFahrenheit) {
      return this.#celsiusParaFahrenheit(valorCelsius);
    }

    return Math.round(valorCelsius);
  }
  //
#obterCaminhoIcone(nomeIconeAPI) {
    return MAPA_ICONES[nomeIconeAPI] || MAPA_ICONES.cloudy;
  }
  //
  #renderizarHoje(infoDiaAtual) {
    const caminho = this.#obterCaminhoIcone(infoDiaAtual.tempIcone);
    this.lblIcone.innerHTML = `<img src="${caminho}" alt="${infoDiaAtual.condicaoTempo}" width="${size2}" height="${size2}" />`;
    //
    this.lblTemperatura.textContent = this.#obterTempExibicao(
      infoDiaAtual.temperatura,
    );
    //
    this.lblPrecipitacao.textContent = infoDiaAtual.precipitacao;
    this.lblHumidade.textContent = infoDiaAtual.humidade;
    this.lblVento.textContent = infoDiaAtual.velocidadeVento;
    this.lblDiaSemana.textContent = infoDiaAtual.diaSemana;
    this.lblData.textContent = infoDiaAtual.dataHoje;
    this.lblCondicao.textContent = infoDiaAtual.condicaoTempo;
    //
    this.lblResumo.textContent = infoDiaAtual.resumoDia;
    //
    //Unidade atualiza de acordo com o botao temperatura pressionado.
    this.lblUnidade.textContent = this.btnCelsius.classList.contains("active")
      ? "°C"
      : "°F";
  }
  //
  #renderizarSemana(previsaoDias) {
    this.containerPrevisao.innerHTML = "";

    previsaoDias.forEach((dia, index) => {
      // 1. Cria a div principal e atribui o índice do dia
      const card = document.createElement("div");
      card.className = "previsao-dia";
      card.dataset.index = index;
      //
      if (index === this.indexDiaSelecionado) {
        card.classList.add("ativo");
      }

      // 2. Cria os elementos filhos
      const textoDiaSemana = document.createElement("span");
      textoDiaSemana.className = "ttl-previsao";
      textoDiaSemana.textContent = dia.dataSemana;

      const iconeDiaSemana = document.createElement("img");
      iconeDiaSemana.className = "previsao-icone";
      iconeDiaSemana.src = this.#obterCaminhoIcone(dia.icone);
      iconeDiaSemana.alt = "Ícone do clima";
      iconeDiaSemana.width = size1;
      iconeDiaSemana.height = size1;

      const tempMedio = document.createElement("div");
      tempMedio.className = "temp-media";

      const tempMaxDiaSemana = document.createElement("span");
      tempMaxDiaSemana.className = "previsao-temp-max";
      tempMaxDiaSemana.textContent = this.#obterTempExibicao(dia.tempMax) + "°";

      const tempMinDiaSemana = document.createElement("span");
      tempMinDiaSemana.className = "previsao-temp-min";
      tempMinDiaSemana.textContent = this.#obterTempExibicao(dia.tempMin) + "°";

      // 3. Coloca os filhos dentro da div
      card.appendChild(textoDiaSemana);
      card.appendChild(iconeDiaSemana);
      tempMedio.appendChild(tempMaxDiaSemana);
      tempMedio.appendChild(tempMinDiaSemana);
      card.appendChild(tempMedio);

      this.containerPrevisao.appendChild(card);
    });
  }
  //
}

export default ClimaUI;
