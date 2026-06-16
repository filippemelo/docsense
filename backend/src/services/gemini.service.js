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

function selecionarChunksRelevantes(pergunta, chunks, maxChars = 12000) {
  const palavras = pergunta
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => p.length > 3);

  const scored = chunks.map((chunk, i) => {
    const texto = chunk.toLowerCase();
    const score = palavras.reduce(
      (acc, palavra) => acc + (texto.includes(palavra) ? 1 : 0),
      0,
    );
    return { chunk, score, index: i };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);

  let resultado = "";
  for (const { chunk } of scored) {
    if (resultado.length + chunk.length > maxChars) break;
    resultado += (resultado ? "\n\n" : "") + chunk;
  }

  return resultado || chunks.slice(0, 5).join("\n\n");
}

export async function perguntarSobreDocumento(pergunta, chunks) {
  const contexto = selecionarChunksRelevantes(pergunta, chunks);

  const prompt = `
Você é o DocSense, um assistente especializado exclusivamente em análise de editais do SIPROS (Sistema Integrado de Processo Seletivo Simplificado) do Governo do Estado do Pará.

Seu único papel é responder perguntas sobre o conteúdo do edital fornecido abaixo.
Você NÃO deve responder perguntas que fujam do conteúdo do edital ou do contexto de processos seletivos públicos.

━━━━━━━━━━━━━━━━━━━━━━━
REGRAS DE COMPORTAMENTO
━━━━━━━━━━━━━━━━━━━━━━━
1. Use SOMENTE as informações contidas no edital abaixo. Nunca invente ou infira dados.
2. Se a informação não estiver no edital, responda exatamente:
   "Essa informação não foi encontrada no edital."
3. Se a pergunta for completamente fora do contexto de editais/processos seletivos, responda:
   "Só posso responder perguntas relacionadas ao edital carregado."
4. Responda sempre em português brasileiro, de forma clara e objetiva.
5. Quando possível, indique de qual seção ou artigo do edital a informação foi retirada.

━━━━━━━━━━━━━━━━━━━━━━━
REGRAS DE FORMATAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━
- DATAS: sempre no formato **DD/MM/AAAA**, listadas em ordem cronológica
- DOCUMENTOS EXIGIDOS: lista numerada com descrição de cada item
- REQUISITOS: separar claramente entre obrigatórios e desejáveis
- VAGAS E CARGOS: apresentar em tabela ou lista estruturada com cargo, nº de vagas e salário
- SALÁRIOS E VALORES: sempre com símbolo R$ e formatação **R$ X.XXX,XX**
- Para respostas longas, use subtítulos em negrito para organizar seções

━━━━━━━━━━━━━━━━━━━━━━━
TIPOS DE PERGUNTA COMUNS (orientação de resposta)
━━━━━━━━━━━━━━━━━━━━━━━
- Datas → Liste todas as etapas em ordem: inscrição, prova, resultado, recurso, convocação
- Documentos → Liste numerado; se houver documentos diferentes por cargo, agrupe por cargo
- Requisitos de candidatura → Separe: escolaridade, experiência, idade, outros
- Vagas por cargo → Liste cargo, número de vagas, carga horária e remuneração

━━━━━━━━━━━━━━━━━━━━━━━
CONTEÚDO DO EDITAL
━━━━━━━━━━━━━━━━━━━━━━━
${contexto}

━━━━━━━━━━━━━━━━━━━━━━━
PERGUNTA DO USUÁRIO
━━━━━━━━━━━━━━━━━━━━━━━
${pergunta}

━━━━━━━━━━━━━━━━━━━━━━━
RESPOSTA
━━━━━━━━━━━━━━━━━━━━━━━
`;

  const resposta = await tentarComRetry(() =>
    model.generateContent(prompt).then((r) => r.response.text()),
  );

  return resposta;
}
