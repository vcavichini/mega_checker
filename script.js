const apostasPredefinidas = [
    ["03", "15", "18", "23", "40", "54"],
    ["01", "02", "12", "29", "46", "51"],
    ["04", "08", "22", "37", "41", "56"],
    ["02", "04", "07", "14", "25", "33"],
    ["04", "09", "13", "24", "30", "55"],
];

let concursoAtual = null; // Inicialmente, não há concurso selecionado

// Elementos da tela
const telaPrincipal = document.getElementById("tela-principal");
const telaErro = document.getElementById("tela-erro");

async function buscarResultado(concurso) {
    try {
        const url = concurso
            ? `https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${concurso}`
            : `https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/`; // Último concurso
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Concurso não disponível");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar resultado:', error);
        return null; // Retorna null em caso de erro
    }
}

function compararApostas(resultado, apostas) {
    const numerosSorteados = resultado.listaDezenas;
    const resultados = [];

    apostas.forEach((aposta) => {
        const acertos = aposta.filter(num => numerosSorteados.includes(num));
        resultados.push({ aposta, acertos });
    });

    return resultados;
}

function criarCirculo(numero, classe) {
    const div = document.createElement('div');
    div.className = `numero ${classe}`;
    div.textContent = numero;
    return div;
}

function exibirTelaErro() {
    telaPrincipal.classList.add("hidden"); // Oculta a tela principal
    telaErro.classList.remove("hidden"); // Exibe a tela de erro
}

function exibirTelaPrincipal() {
    telaErro.classList.add("hidden"); // Oculta a tela de erro
    telaPrincipal.classList.remove("hidden"); // Exibe a tela principal
}

function atualizarInterface(resultado, resultadosApostas) {
    document.getElementById('concurso-numero').textContent = resultado.numero;
    document.getElementById('concurso-data').textContent = resultado.dataApuracao;

    // Exibir números sorteados
    const numerosSorteadosContainer = document.getElementById('numeros-sorteados');
    numerosSorteadosContainer.innerHTML = '';
    resultado.listaDezenas.forEach(numero => {
        numerosSorteadosContainer.appendChild(criarCirculo(numero, 'sorteado')); // Números sorteados em verde
    });

    // Exibir apostas
    const listaApostas = document.getElementById('lista-apostas');
    listaApostas.innerHTML = '';

    resultadosApostas.forEach((resultadoAposta) => {
        const apostaContainer = document.createElement('div');
        apostaContainer.className = 'aposta-container';

        resultadoAposta.aposta.forEach(numero => {
            const classe = resultadoAposta.acertos.includes(numero) ? 'acerto' : '';
            apostaContainer.appendChild(criarCirculo(numero, classe));
        });

        listaApostas.appendChild(apostaContainer);
    });
}

async function carregarConcurso(concurso) {
    const resultado = await buscarResultado(concurso);
    if (resultado) {
        concursoAtual = resultado.numero; // Atualiza o concurso atual
        const resultadosApostas = compararApostas(resultado, apostasPredefinidas);
        atualizarInterface(resultado, resultadosApostas);

        // Atualiza os botões de navegação
        document.getElementById('anterior').textContent = `Anterior (${concursoAtual - 1})`;
        document.getElementById('proximo').textContent = `Próximo (${concursoAtual + 1})`;

        exibirTelaPrincipal(); // Garante que a tela principal esteja visível
    } else {
        exibirTelaErro(); // Exibe a tela de erro
    }
}

document.getElementById('anterior').addEventListener('click', () => {
    if (concursoAtual > 1) {
        carregarConcurso(concursoAtual - 1);
    }
});

document.getElementById('proximo').addEventListener('click', () => {
    carregarConcurso(concursoAtual + 1);
});

document.getElementById('voltar').addEventListener('click', () => {
    exibirTelaPrincipal(); // Volta para a tela principal
});

// Carregar o último concurso na primeira execução
carregarConcurso(null);
