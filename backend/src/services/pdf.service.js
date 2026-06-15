import { createRequire } from "module";

const require = createRequire(import.meta.url);
const PDFParser = require("pdf2json");

function decodificarTexto(texto) {
  try {
    return decodeURIComponent(texto);
  } catch {
    return texto;
  }
}

export async function extrairTextoPDF(caminhoArquivo) {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (erro) => {
      reject(new Error(erro.parserError));
    });

    parser.on("pdfParser_dataReady", (dados) => {
      const texto = dados.Pages.flatMap((pagina) => pagina.Texts)
        .map((texto) => decodificarTexto(texto.R.map((r) => r.T).join("")))
        .join(" ");

      resolve(texto);
    });

    parser.loadPDF(caminhoArquivo);
  });
}

export function dividirEmChunks(texto, tamanho = 500) {
  const palavras = texto.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < palavras.length; i += tamanho) {
    const chunk = palavras.slice(i, i + tamanho).join(" ");
    chunks.push(chunk);
  }

  return chunks;
}
