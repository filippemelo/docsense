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
Você é um assistente especializado em análise de documentos.
Use APENAS o conteúdo abaixo para responder.
Se a resposta não estiver no documento, diga que não encontrou a informação.

DOCUMENTO:
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
