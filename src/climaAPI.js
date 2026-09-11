class ClimaAPI {
  //
  #apiKey;
  #urlBase;
  //
  constructor(
    apikey,
    urlBase = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline",
  ) {
    this.#apiKey = apikey;
    this.#urlBase = urlBase;
  }
  //
  async buscarCidade(cidade) {
    //
    try {
      // Usamos unitGroup=metric para receber em Celsius
      const resposta = await fetch(
        `${this.#urlBase}/${cidade}?unitGroup=metric&key=${this.#apiKey}&lang=pt`,
      );
      //
      if (!resposta.ok) {
        throw new Error(`Erro na requisição: ${resposta.statusText}`);
      }
      //
      const dados = await resposta.json();
      const dadosProntos = this.#formatarDados(dados);
      return dadosProntos;
      //
    } catch (erro) {
      console.error("Falha ao buscar clima:", erro);
      return null;
    }
  }

  #formatarDados(dadosBrutos) {
    const localizacao = dadosBrutos.resolvedAddress;
    // Usa a descrição específica do primeiro dia (ou a geral como fallback)
    const resumoDeHoje =
      dadosBrutos.days[0]?.description || dadosBrutos.description;
    const infoDiaAtual = this.#objetoInfoAtual(dadosBrutos);
    const previsaoDias = this.#objetoArraySemana(dadosBrutos);
    //
    return {
      localizacao,
      resumoDeHoje,
      infoDiaAtual,
      previsaoDias,
    };
  }
  //
  #objetoInfoAtual(dadosBrutos) {
    const temperatura = dadosBrutos.days[0].temp;
    const tempIcone = dadosBrutos.days[0].icon;
    const precipitacao = dadosBrutos.days[0].precip + " %";
    const humidade = dadosBrutos.days[0].humidity + " %";
    const velocidadeVento = dadosBrutos.days[0].windspeed + " Km/h";
    const condicaoTempo = dadosBrutos.days[0].conditions;
    //
    const resumoDia = dadosBrutos.days[0].description; // <--- NOVO
    //
    const dataHojeBruta = dadosBrutos.days[0].datetime;
    //
    const [ano, mes, dia] = dataHojeBruta.split("-");
    const dataHoje = `${dia}/${mes}/${ano}`; // Ex: "26/08/2026"
    // O replace(/-/g, '/') evita que o JS interprete a data em UTC e volte um dia no fuso horário local
    const dataObjeto = new Date(dataHojeBruta.replace(/-/g, "/"));
    const diaDesformatadoSemana = dataObjeto
      .toLocaleDateString("pt-BR", { weekday: "long" })
      .replace("-feira", "");
    const diaSemana =
      diaDesformatadoSemana.charAt(0).toUpperCase() +
      diaDesformatadoSemana.slice(1);
    //
    return {
      temperatura,
      tempIcone,
      precipitacao,
      humidade,
      velocidadeVento,
      dataHoje,
      diaSemana,
      condicaoTempo,
      //
      resumoDia,
    };
  }
  //
  #objetoArraySemana(dadosBrutos) {
    //
    const arrayDias = [];
    //
    dadosBrutos.days.forEach((dadosBrutosDaysItem, indice) => {
      // Só processa e guarda se for um dos 7 primeiros dias (índices 0 a 6)
      if (indice < 7) {
        const [ano, mes, dia] = dadosBrutosDaysItem.datetime.split("-");
        const dataCorreta = `${dia}/${mes}/${ano}`;
        const dataObjeto = new Date(
          dadosBrutosDaysItem.datetime.replace(/-/g, "/"),
        );
        const diaDesformatadoSemana = dataObjeto
          .toLocaleDateString("pt-BR", { weekday: "long" })
          .replace("-feira", "");
        const dataSemana =
          diaDesformatadoSemana.charAt(0).toUpperCase() +
          diaDesformatadoSemana.slice(1);
        //
        arrayDias[indice] = {
          dataCorreta,
          dataSemana,
          icone: dadosBrutosDaysItem.icon,
          tempMax: dadosBrutosDaysItem.tempmax,
          tempMin: dadosBrutosDaysItem.tempmin,
          // Dados para renderizar o dia no painel principal:
          temperatura: dadosBrutosDaysItem.temp,
          tempIcone: dadosBrutosDaysItem.icon,
          precipitacao: dadosBrutosDaysItem.precip + " %",
          humidade: dadosBrutosDaysItem.humidity + " %",
          velocidadeVento: dadosBrutosDaysItem.windspeed + " Km/h",
          condicaoTempo: dadosBrutosDaysItem.conditions,
          //
          resumoDia: dadosBrutosDaysItem.description, // <--- NOVO
          //
          dataHoje: dataCorreta,
          diaSemana: dataSemana,
        };
      }
    });
    //
    return arrayDias;
  }
}
export default ClimaAPI;
