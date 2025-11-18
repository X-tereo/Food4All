// ia/motivacao.js
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const MODEL_NAME = "gemini-2.0-flash";
const API_KEY = "AIzaSyCoiFoq0xanSRrbrZzOaraiOnFFSSh4Ulg"; // coloque sua chave

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: MODEL_NAME,
  generationConfig: {
    temperature: 0.8,
    topK: 1,
    topP: 1,
    maxOutputTokens: 200,
  },
  safetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ],
});

// 🧠 cache simples em memória por usuário
const cacheMotivacional = new Map();

// 🧹 função para limpar manualmente o cache de um usuário
function limparCache(chave) {
  if (!chave) {
    console.warn("⚠️ Nenhuma chave informada para limpeza de cache.");
    return;
  }
  cacheMotivacional.delete(chave);
  console.log("🧹 Cache limpo manualmente para:", chave);
}

// 🎯 função principal que gera a frase motivacional
async function gerarFraseMotivacional(usuario) {
  try {
    const chave = usuario.email || usuario.nome || "desconhecido";

    // Verifica se há cache válido
    if (cacheMotivacional.has(chave)) {
      console.log("♻️ Retornando frase do cache para", chave);
      return cacheMotivacional.get(chave);
    }

    const diasEstimados = usuario.peso && usuario.pesoalvo
      ? Math.max(5, Math.round((usuario.peso - usuario.pesoalvo) * 4))
      : null;

    const prompt = `
      Gere uma frase curta de uma linha, educativa e motivacional em português.
      Baseie-se nos dados do usuário:
      - Nome: ${usuario.nome}
      - Peso atual: ${usuario.peso}kg
      - Peso alvo: ${usuario.pesoalvo}kg
      - Altura: ${usuario.altura}cm
      - Restrição alimentar: ${usuario.restricao || "nenhuma"}
      A frase deve soar positiva e humana, com no máximo 10 palavras.
      Inclua, se possível, o nome do usuário e uma estimativa de tempo para alcançar o peso alvo".
      Não inclua nada além da frase na sua resposta(ex.: Não inclua: Não achei os dados ou Não pude ler os dados, coisas desse tipo)
    `;

    const result = await model.generateContent(prompt);
    const resposta = result.response.text().trim();

    cacheMotivacional.set(chave, resposta);

    console.log("✨ Nova frase gerada para", chave, "->", resposta);
    return resposta;
  } catch (erro) {
    console.error("❌ Erro ao gerar frase motivacional:", erro);
    return "Continue firme! Seu progresso é resultado da sua dedicação. 💪";
  }
}

module.exports = { gerarFraseMotivacional, limparCache };
