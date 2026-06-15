import { useEffect, useRef, useState } from "react";
import api from "../services/api";

export default function Chat({ documento, onVoltar }) {
  const [mensagens, setMensagens] = useState([
    {
      tipo: "ia",
      texto: `Documento carregado! Pode me fazer perguntas sobre **${documento.nomeOriginal}**.`,
    },
  ]);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const fimRef = useRef(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviarPergunta() {
    const texto = pergunta.trim();
    if (!texto || carregando) return;

    setMensagens((prev) => [...prev, { tipo: "usuario", texto }]);
    setPergunta("");
    setCarregando(true);

    try {
      const { data } = await api.post("/ask", {
        documentoId: documento.documentoId,
        pergunta: texto,
      });

      setMensagens((prev) => [...prev, { tipo: "ia", texto: data.resposta }]);
    } catch {
      setMensagens((prev) => [
        ...prev,
        {
          tipo: "ia",
          texto: "Erro ao processar sua pergunta. Tente novamente.",
        },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  function aoApertarEnter(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarPergunta();
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <button
          onClick={onVoltar}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Voltar
        </button>
        <div>
          <p className="font-medium text-gray-800 text-sm">
            {documento.nomeOriginal}
          </p>
          <p className="text-gray-400 text-xs">
            {documento.totalPalavras.toLocaleString()} palavras ·{" "}
            {documento.totalChunks} partes
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.tipo === "usuario" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.tipo === "usuario"
                  ? "bg-blue-500 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.texto}
            </div>
          </div>
        ))}

        {carregando && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={fimRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            onKeyDown={aoApertarEnter}
            placeholder="Faça uma pergunta sobre o documento..."
            rows={1}
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-colors"
          />
          <button
            onClick={enviarPergunta}
            disabled={!pergunta.trim() || carregando}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl transition-colors"
          >
            Enviar
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2 text-center">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
