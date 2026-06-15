import { useState } from "react";
import api from "../services/api";

export default function Upload({ onDocumentoEnviado }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [arrastando, setArrastando] = useState(false);

  async function processarArquivo(arquivo) {
    if (!arquivo || arquivo.type !== "application/pdf") {
      setErro("Selecione um arquivo PDF válido");
      return;
    }

    setCarregando(true);
    setErro("");

    const formData = new FormData();
    formData.append("pdf", arquivo);

    try {
      const { data } = await api.post("/documents/upload", formData);
      onDocumentoEnviado(data);
    } catch {
      setErro(
        "Erro ao enviar o PDF. Verifique se é um edital válido e tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  function aoSoltar(e) {
    e.preventDefault();
    setArrastando(false);
    processarArquivo(e.dataTransfer.files[0]);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            🏛️ SIPROS
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Assistente de Editais
          </h1>
          <p className="text-gray-500 text-sm">
            Governo do Estado do Pará · Processo Seletivo Simplificado
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { emoji: "📅", titulo: "Datas", desc: "Inscrição e provas" },
            { emoji: "📋", titulo: "Documentos", desc: "Lista completa" },
            { emoji: "✅", titulo: "Requisitos", desc: "Critérios e vagas" },
          ].map((card) => (
            <div
              key={card.titulo}
              className="bg-white border border-gray-200 rounded-xl p-3 text-center"
            >
              <div className="text-xl mb-1">{card.emoji}</div>
              <p className="text-xs font-semibold text-gray-700">
                {card.titulo}
              </p>
              <p className="text-xs text-gray-400">{card.desc}</p>
            </div>
          ))}
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={aoSoltar}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            arrastando
              ? "border-blue-500 bg-blue-50 scale-[1.01]"
              : "border-gray-300 hover:border-blue-400 bg-gray-50"
          }`}
        >
          {carregando ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-700 font-medium">Processando edital...</p>
              <p className="text-gray-400 text-sm">
                Extraindo informações do PDF
              </p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                📄
              </div>
              <p className="text-gray-700 font-medium mb-1">
                Arraste o edital do SIPROS aqui
              </p>
              <p className="text-gray-400 text-sm mb-5">
                ou selecione o arquivo PDF
              </p>
              <label className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
                Selecionar edital
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => processarArquivo(e.target.files[0])}
                />
              </label>
              <div className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-400">
                <span>✓ Apenas PDF</span>
                <span>✓ Até 10MB</span>
                <span>✓ Gratuito</span>
              </div>
            </>
          )}
        </div>

        {erro && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm text-center">⚠️ {erro}</p>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">
          Respostas geradas por IA · Confirme sempre no edital oficial
        </p>
      </div>
    </div>
  );
}
