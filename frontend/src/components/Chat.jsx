import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import api from "../services/api";

const PERGUNTAS_RAPIDAS = [
  { emoji: "📅", label: "Quais são as datas de inscrição e provas?" },
  { emoji: "📋", label: "Quais documentos preciso apresentar?" },
  { emoji: "✅", label: "Quais os requisitos para candidatura?" },
  { emoji: "🏷️", label: "Quantas vagas existem por cargo?" },
];

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
  const textareaRef = useRef(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviarComTexto(texto) {
    if (!texto || carregando) return;

    setMensagens((prev) => [...prev, { tipo: "usuario", texto }]);
    setPergunta("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
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
        { tipo: "ia", texto: "Erro ao processar sua pergunta. Tente novamente." },
      ]);
    } finally {
      setCarregando(false);
    }
  }

  function enviarPergunta() {
    enviarComTexto(pergunta.trim());
  }

  function aoApertarEnter(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarPergunta();
    }
  }

  function autoResize(e) {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shadow-sm bg-white shrink-0">
        <button
          onClick={onVoltar}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          Novo edital
        </button>

        <div className="h-4 w-px bg-gray-200 shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 tracking-wide">
              DocSense
            </span>
            <p className="font-medium text-gray-800 text-sm truncate">
              {documento.nomeOriginal}
            </p>
          </div>
          <p className="text-gray-400 text-xs mt-0.5">
            {documento.totalPalavras.toLocaleString()} palavras ·{" "}
            {documento.totalChunks} seções analisadas
          </p>
        </div>
      </header>

      {/* Área de mensagens */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {mensagens.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${msg.tipo === "usuario" ? "justify-end" : "justify-start items-start"}`}
          >
            {msg.tipo === "ia" && (
              <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
                DS
              </div>
            )}

            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.tipo === "usuario"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.tipo === "ia" ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">
                        {children}
                      </strong>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 my-2">
                        {children}
                      </ol>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 my-2">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-sm">{children}</li>
                    ),
                    hr: () => <hr className="border-gray-200 my-3" />,
                  }}
                >
                  {msg.texto}
                </ReactMarkdown>
              ) : (
                msg.texto
              )}
            </div>
          </div>
        ))}

        {carregando && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">
              DS
            </div>
            <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 mb-1.5">
                <span
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <p className="text-xs text-gray-400">DocSense está analisando...</p>
            </div>
          </div>
        )}

        <div ref={fimRef} />
      </main>

      {/* Área de input */}
      <footer className="px-4 py-4 border-t border-gray-100 bg-white shrink-0">
        {mensagens.length === 1 && !carregando && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {PERGUNTAS_RAPIDAS.map((q) => (
              <button
                key={q.label}
                onClick={() => enviarComTexto(q.label)}
                className="flex items-center gap-2 text-left text-sm text-gray-600 border border-gray-200 rounded-xl px-3 py-2.5 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <span className="text-base shrink-0">{q.emoji}</span>
                <span className="text-xs leading-tight">{q.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            onInput={autoResize}
            onKeyDown={aoApertarEnter}
            placeholder="Faça uma pergunta sobre o edital..."
            className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition-colors bg-gray-50 focus:bg-white"
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />
          <button
            onClick={enviarPergunta}
            disabled={!pergunta.trim() || carregando}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white p-3 rounded-xl transition-colors shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>

        <p className="text-gray-400 text-xs mt-2 text-center">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </footer>
    </div>
  );
}
