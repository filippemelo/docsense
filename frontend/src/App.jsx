import { useState } from "react";
import Chat from "./components/Chat";
import Upload from "./components/Upload";

export default function App() {
  const [documento, setDocumento] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      {documento ? (
        <Chat documento={documento} onVoltar={() => setDocumento(null)} />
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-16">
          <Upload onDocumentoEnviado={setDocumento} />
        </div>
      )}
    </div>
  );
}
