# DocSense 🏛️

Assistente inteligente para consulta de editais do **SIPROS** (Sistema Integrado de Processo Seletivo Simplificado) do Governo do Estado do Pará.

Envie o PDF de um edital e faça perguntas em linguagem natural sobre datas, documentos necessários, requisitos, vagas e qualquer informação do processo seletivo.

![DocSense Preview](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Node.js](https://img.shields.io/badge/Node.js-v24-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?logo=google&logoColor=white)

## ✨ Funcionalidades

- 📄 Upload de PDF por clique ou arrastar e soltar
- 🤖 Respostas geradas por IA (Google Gemini 2.5 Flash — gratuito)
- 📅 Consulta de datas de inscrição, provas e resultados
- 📋 Lista de documentos necessários em ordem
- ✅ Requisitos e critérios para candidatura
- 💼 Vagas disponíveis por cargo
- ⚡ Perguntas rápidas com atalhos na interface

## 🛠️ Stack

| Camada          | Tecnologia                         |
| --------------- | ---------------------------------- |
| Backend         | Node.js + Express                  |
| Frontend        | React + Vite + Tailwind CSS        |
| IA              | Google Gemini 2.5 Flash (gratuito) |
| Leitura de PDF  | pdf2json                           |
| Deploy Backend  | Railway                            |
| Deploy Frontend | Vercel                             |

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js v18+
- Chave de API do Google Gemini (gratuita em [aistudio.google.com](https://aistudio.google.com))

### Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` dentro de `backend/`:

```env
PORT=3001
GEMINI_API_KEY=sua_chave_aqui
```

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 🔒 Variáveis de ambiente

| Variável         | Descrição                                |
| ---------------- | ---------------------------------------- |
| `PORT`           | Porta do servidor backend (padrão: 3001) |
| `GEMINI_API_KEY` | Chave da API do Google Gemini            |

> ⚠️ Nunca commite o arquivo `.env` no repositório.
