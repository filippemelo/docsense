import { Router } from "express";
import fs from "fs";
import upload from "../config/multer.js";
import { dividirEmChunks, extrairTextoPDF } from "../services/pdf.service.js";

const router = Router();

router.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado" });
    }

    const texto = await extrairTextoPDF(req.file.path);

    if (!texto || texto.trim().length === 0) {
      fs.unlinkSync(req.file.path);
      return res
        .status(422)
        .json({ erro: "Não foi possível extrair texto deste PDF" });
    }

    const chunks = dividirEmChunks(texto);

    const documento = {
      id: Date.now().toString(),
      nomeOriginal: req.file.originalname,
      caminho: req.file.path,
      totalChunks: chunks.length,
      totalPalavras: texto.split(/\s+/).length,
      chunks,
    };

    const pastaDocumentos = "uploads/documentos";
    if (!fs.existsSync(pastaDocumentos)) {
      fs.mkdirSync(pastaDocumentos, { recursive: true });
    }

    fs.writeFileSync(
      `${pastaDocumentos}/${documento.id}.json`,
      JSON.stringify(documento, null, 2),
    );

    res.json({
      mensagem: "PDF processado com sucesso!",
      documentoId: documento.id,
      nomeOriginal: documento.nomeOriginal,
      totalPalavras: documento.totalPalavras,
      totalChunks: documento.totalChunks,
    });
  } catch (erro) {
    console.error("Erro no upload:", erro);
    res.status(500).json({ erro: "Erro ao processar o PDF" });
  }
});

router.get("/listar", (_req, res) => {
  try {
    const pastaDocumentos = "uploads/documentos";

    if (!fs.existsSync(pastaDocumentos)) {
      return res.json({ documentos: [] });
    }

    const arquivos = fs.readdirSync(pastaDocumentos);

    const documentos = arquivos.map((arquivo) => {
      const conteudo = JSON.parse(
        fs.readFileSync(`${pastaDocumentos}/${arquivo}`, "utf-8"),
      );
      return {
        id: conteudo.id,
        nomeOriginal: conteudo.nomeOriginal,
        totalPalavras: conteudo.totalPalavras,
        totalChunks: conteudo.totalChunks,
      };
    });

    res.json({ documentos });
  } catch (erro) {
    console.error("Erro ao listar:", erro);
    res.status(500).json({ erro: "Erro ao listar documentos" });
  }
});

export default router;
