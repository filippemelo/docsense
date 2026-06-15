import { createRequire } from "module";
import { GEMINI_API_KEY } from "../config/env.js";

const require = createRequire(import.meta.url);
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function tentarComRetry(fn, tentativas = 3, espera = 5000) {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await fn();
    } catch (erro) {
      const ehTemporario = erro.status === 503 || erro.status === 429;
      const ehUltimaTentativa = i === tentativas - 1;

      if (ehTemporario && !ehUltimaTentativa) {
        console.log(
          `⏳ Tentativa ${i + 1} falhou (${erro.status}). Aguardando ${espera / 1000}s...`,
        );
        await new Promise((res) => setTimeout(res, espera));
      } else {
        throw erro;
      }
    }
  }
}

export async function perguntarSobreDocumento(pergunta, chunks) {
  const contexto = chunks.slice(0, 5).join("\n\n");

  const prompt = `
Você é um assistente especializado em editais de processos seletivos do Governo do Estado do Pará (SIPROS).
Seu papel é responder perguntas sobre o edital de forma clara, organizada e objetiva.

Regras:
- Use APENAS as informações do edital abaixo para responder
- Quando houver datas, liste-as em ordem cronológica
- Quando houver listas de documentos, apresente em tópicos numerados
- Quando houver requisitos, deixe bem destacados
- Se a informação não estiver no edital, responda: "Essa informação não foi encontrada no edital."
- Responda sempre em português brasileiro
- Seja direto e objetivo, sem rodeios

CONTEÚDO DO EDITAL:
${contexto}

PERGUNTA:
${pergunta}

RESPOSTA:
`;

  const resposta = await tentarComRetry(() =>
    model.generateContent(prompt).then((r) => r.response.text()),
  );

  return resposta;
}
