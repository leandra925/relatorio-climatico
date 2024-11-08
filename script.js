const apiKey = 'e9840c0d976d4000b72170108240811';
const apiBase = 'https://api.weatherapi.com/v1/forecast.json?key=' + apiKey;


async function carregarEstados() {
    console.log('Carregando estados...');
    

    const resposta = await fetch('https://cors-anywhere.herokuapp.com/https://servicodados.ibge.gov.br/api/v2/cidades/estados');
    
    if (!resposta.ok) {
        console.error('Erro ao carregar estados', resposta);
        return;
    }

    const estados = await resposta.json();
    const selectEstado = document.getElementById('estado');

    console.log('Estados carregados:', estados);

    estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.sigla;
        option.textContent = estado.nome;
        selectEstado.appendChild(option);
    });
}

async function carregarCidades() {
    const estado = document.getElementById('estado').value;
    if (!estado) return;

    console.log(`Carregando cidades para o estado: ${estado}`);


    const selectCidade = document.getElementById('cidade');
    selectCidade.innerHTML = '<option value="">Selecione uma Cidade</option>';

    const resposta = await fetch(`https://servicodados.ibge.gov.br/api/v2/cidades/${estado}`);
    
    if (!resposta.ok) {
        console.error('Erro ao carregar cidades', resposta);
        return;
    }

    const cidades = await resposta.json();

    console.log('Cidades carregadas:', cidades);

    cidades.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade.nome;
        option.textContent = cidade.nome;
        selectCidade.appendChild(option);
    });
}

async function atualizarPrevisao() {
    const estado = document.getElementById('estado').value;
    const cidade = document.getElementById('cidade').value;

    if (!cidade) return;

    console.log(`Buscando previsão para ${cidade}, ${estado}`);

    const dataAtual = new Date().toLocaleDateString("pt-BR");

    document.getElementById('data-coleta').textContent = `Data de coleta: ${dataAtual}`;

    const resposta = await fetch(`${apiBase}&q=${cidade}&days=1&aqi=yes&alerts=yes&lang=pt`);
    
    if (!resposta.ok) {
        console.error('Erro ao carregar dados da previsão', resposta);
        return;
    }

    const dados = await resposta.json();

    console.log('Previsão carregada:', dados);

    const previsao = dados.forecast.forecastday[0].hour;
    const qualidadeAr = dados.current.air_quality;
    

    document.getElementById('qualidade-ar').textContent = `Índice de Qualidade do Ar: ${qualidadeAr.pm10}`;


    document.getElementById('paragrafo-informativo').textContent = `Dados coletados em ${cidade}, ${dataAtual}`;

    const tabela = document.getElementById('previsao').getElementsByTagName('tbody')[0];
    tabela.innerHTML = ''; 
    previsao.forEach(p => {
        const row = tabela.insertRow();
        row.innerHTML = `
            <td>${new Date(p.time).getHours()}:00</td>
            <td>${p.condition.text}</td>
            <td>${p.chance_of_rain}%</td>
            <td>${p.temp_c}°C</td>
            <td>${p.feelslike_c}°C</td>
            <td>${p.humidity}%</td>
            <td>${p.wind_kph} km/h</td>
        `;
    });
}

async function salvarPDF(elemento, filename) {
    const options = {
        margin: [10, 10, 10, 10],
        filename: `${filename}.pdf`,
        image: { type: 'png', quality: 1 },
        html2canvas: { scale: 1 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().set(options).from(elemento).save();
}

window.onload = () => {
    carregarEstados();
};
