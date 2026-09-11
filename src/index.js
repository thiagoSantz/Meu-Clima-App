import ClimaAPI from "./climaAPI.js";
import ClimaUI from "./climaUi.js";
import "./style.css";
import "./styleMobile.css";

const apiKey = "6N9CU2LQ82KU9KLT8ELWMTXDH";
const climaAPIObj = new ClimaAPI(apiKey);
const climaUi = new ClimaUI();

climaUi.buscainputCidade(async (cidade) => {
  climaUi.rodaCarregando();
  //
  try {
    const dadosBuscados = await climaAPIObj.buscarCidade(cidade);
    //
    if (dadosBuscados) {
      climaUi.exibirDados(dadosBuscados);
      climaUi.modalFechar(); // Fecha o modal inicial quando os dados carregarem
    }
  } catch (erro) {
    console.error("Erro ao buscar clima:", erro);
  } finally {
    climaUi.rodaCarregando();
  }
});

//
// Funciona direto no topo do arquivo em módulos ES6!
/* const dadosBusca = await climaAPIObj.buscarCidade('Belo Horizonte');
console.log('Dados recebidos:', dadosBusca); */
