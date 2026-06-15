import { Router } from "express";
import fs from "fs";
import { perguntarSobreDocumento } from "../services/gemini.service.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { documentoId, pergunta } = req.body;

    if (!documentoId || !pergunta) {
      return res.status(400).json({
        erro: "documentoId e pergunta são obrigatórios",
      });
    }

    const caminhoDocumento = `uploads/documentos/${documentoId}.json`;

    if (!fs.existsSync(caminhoDocumento)) {
      return res.status(404).json({ erro: "Documento não encontrado" });
    }

    const documento = JSON.parse(fs.readFileSync(caminhoDocumento, "utf-8"));
    const resposta = await perguntarSobreDocumento(pergunta, documento.chunks);

    res.json({
      documentoId,
      pergunta,
      resposta,
    });
  } catch (erro) {
    console.error("Erro ao perguntar:", erro);
    res.status(500).json({ erro: "Erro ao processar sua pergunta" });
  }
});

export default router;
