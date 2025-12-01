// -------------------------------
// FUNÇÕES DE STATUS DO CLIMA
// -------------------------------

function getWeatherStatus(temp, rain) {
  if (rain > 0.1) return "rainy";
  if (temp < 10) return "cold";
  if (temp >= 25) return "hot";
  return "normal";
}

function getCharacter(status) {
  const characters = {
    hot: "☀️😆",
    cold: "❄️🥶",
    rainy: "🌧️😢",
    normal: "🌤️😊",
  };
  return characters[status] || characters.normal;
}

function getStatusText(status) {
  const texts = {
    hot: "☀️ Passe protetor solar! Está muito sol!",
    cold: "❄️ Frio! Nao esqueça de se agasalhar!",
    rainy: "🌧️ Chuvoso! Pegue um guarda-chuva!",
    normal: "🌤️ Clima agradável! Aproveite o dia!",
  };
  return texts[status] || texts.normal;
}

// -------------------------------
// BUSCA MANUAL POR BAIRRO/CIDADE
// -------------------------------

async function getPrevisao() {
  const bairro = document.getElementById("bairro").value;

  if (!bairro) {
    alert("Por favor, preencha o nome do bairro!");
    return;
  }

  try {
    const geocodingResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${bairro}&count=1&language=pt&format=json`
    );
    const geocodingData = await geocodingResponse.json();

    if (!geocodingData.results || geocodingData.results.length === 0) {
      alert("Bairro não encontrado! Tente outro nome.");
      return;
    }

    const location = geocodingData.results[0];
    const lat = location.latitude;
    const long = location.longitude;

    const nomeLugar = `${location.name}, ${
      location.admin1 || location.country
    }`;

    document.getElementById("localName").innerText = `📍 ${nomeLugar}`;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,rain&timezone=auto`
    );
    const data = await response.json();

    mostrarPrevisaoNaTela(data);
  } catch (error) {
    alert("Erro ao obter previsão: " + error.message);
  }
}

// -------------------------------
// MOSTRAR PREVISÃO NA TELA
// -------------------------------

function mostrarPrevisaoNaTela(data) {
  const resposta = document.getElementById("resposta");
  resposta.innerHTML = "";

  const limit = Math.min(24, data.hourly.time.length);

  for (let index = 0; index < limit; index++) {
    const temp = data.hourly.temperature_2m[index];
    const rain = data.hourly.rain[index];
    const status = getWeatherStatus(temp, rain);
    const character = getCharacter(status);

    const time = new Date(data.hourly.time[index]).toLocaleTimeString(
      "pt-BR",
      { hour: "2-digit", minute: "2-digit" }
    );

    resposta.innerHTML += `
      <div class="weather-item ${status}">
        <div class="time">${time}</div>
        <div class="character" style="font-size: 60px; margin: 15px 0;">${character}</div>
        <div class="temp">${temp}°C</div>
        <div class="rain">🌧️ ${rain} mm</div>
      </div>
    `;
  }

  atualizarPersonagemPrincipal(data);
}

// -------------------------------
// ATUALIZAR PERSONAGEM PRINCIPAL
// -------------------------------

function atualizarPersonagemPrincipal(data) {
  const temp = data.hourly.temperature_2m[0];
  const rain = data.hourly.rain[0];

  const status = getWeatherStatus(temp, rain);
  const character = getCharacter(status);

  document.getElementById("mainCharacter").innerHTML = character;
  document.getElementById("mainCharacter").className = `character-display ${status}`;
  document.getElementById("statusText").innerText = getStatusText(status);
}

// -------------------------------
// BUSCA AUTOMÁTICA PELA LOCALIZAÇÃO DO USUÁRIO
// -------------------------------

async function getPrevisaoPorLocalizacao(lat, long) {
  try {
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${long}&language=pt&format=json`
    );
    const geoData = await geoResponse.json();

    let nomeLugar = "Localização Atual";

    if (geoData.results && geoData.results.length > 0) {
      const r = geoData.results[0];
      nomeLugar = `${r.name}, ${r.admin1 || r.country}`;
    }

    document.getElementById("localName").innerText = `📍 ${nomeLugar}`;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&hourly=temperature_2m,rain&timezone=auto`
    );
    const data = await response.json();

    mostrarPrevisaoNaTela(data);
  } catch (error) {
    alert("Erro ao buscar previsão automática!");
  }
}

function localizarAutomatico() {
  if (!navigator.geolocation) {
    alert("Seu navegador não permite geolocalização!");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const long = pos.coords.longitude;

      getPrevisaoPorLocalizacao(lat, long);
    },
    (err) => {
      alert("Ative a permissão de localização para usar previsão automática.");
      console.log(err);
    }
  );
}

// -------------------------------
// INICIAR AUTOMATICAMENTE AO ABRIR
// -------------------------------

window.addEventListener("load", localizarAutomatico);
