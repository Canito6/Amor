# O Nosso Cantinho ❤️ | Portal Interativo para Casais

Uma aplicação web moderna, interativa e segura desenhada exclusivamente para casais partilharem memórias, jogarem, tomarem decisões juntos e manterem uma ligação única no dia a dia. Este repositório está dividido num backend robusto em **Node.js (Express)** e num frontend dinâmico em **React (Vite)**.

---

## 🌟 Principais Funcionalidades

O projeto oferece um ecossistema completo para interações a dois:

### 📸 Comunicação & Memórias
*   **Mensagens em Tempo Real:** Chat instantâneo integrado com *Socket.io* para comunicação direta.
*   **Álbuns e Galeria de Fotos:** Envio e organização de fotografias do casal com armazenamento na cloud via *Cloudinary*.
*   **Cápsulas do Tempo & Memórias:** Registo de momentos marcantes que podem ser agendados para reabrir no futuro.
*   **Calendário de Eventos:** Agenda partilhada para marcar aniversários, encontros e datas importantes.

### 🎮 Jogos & Dinâmicas
*   **Quizzes Personalizados:** Criação de questionários para testar o conhecimento mútuo com pontuação acumulada.
*   **Raspadinhas do Amor:** Raspadinhas virtuais interativas com surpresas ou prémios customizados.
*   **Roleta de Decisões:** Ajuda a resolver indecisões frequentes (ex: "Onde jantar?", "O que ver na TV?").
*   **Quem é Mais Provável?:** Jogo de votação interativo para descobrir quem tem mais probabilidade de fazer certas coisas.

### 💖 Mimos & Romantismo
*   **Vales de Amor (Coupons):** Vales virtuais resgatáveis (ex: "Vale um jantar romântico", "Vale uma massagem").
*   **Cartas "Abrir Quando...":** Mensagens especiais escritas por um parceiro para serem abertas pelo outro em estados emocionais específicos.
*   **Frasco de Mimos:** Um frasco digital onde é possível retirar notas de carinho aleatórias.
*   **Bucket List:** Lista de desejos conjunta para marcar objetivos alcançados e registá-los com fotos de recordação.
*   **Daily Check-In:** Monitorização diária do estado de espírito e partilha de sentimentos diários.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
*   **Framework:** React 19 (com Vite)
*   **Routing:** React Router v7
*   **Comunicação em Tempo Real:** Socket.io-client
*   **Estilização:** CSS Vanilla Moderno (responsivo e preparado para Dark Mode)

### Backend
*   **Runtime:** Node.js (com Express v5)
*   **Base de Dados:** MongoDB Atlas (Mongoose ODM)
*   **Autenticação:** JSON Web Tokens (JWT) e Cookies (Cookie-Parser)
*   **Segurança:** Helmet, HPP, XSS-clean, Express Rate Limit e Express Mongo Sanitize
*   **Uploads:** Multer & Cloudinary SDK
*   **E-mails:** Nodemailer para envio de notificações e recuperação de contas
*   **Validação de Dados:** Zod schemas
*   **Logs:** Winston Logger integrado com Morgan para acessos HTTP

---

## 📂 Estrutura do Projeto

```text
teste/
├── backend/                  # Servidor Express & API REST
│   ├── src/
│   │   ├── config/           # Configurações de base de dados e segurança
│   │   ├── controllers/      # Lógica de controlo das rotas
│   │   ├── middlewares/      # Filtros de autenticação, erros e validação
│   │   ├── models/           # Modelos de dados do Mongoose
│   │   ├── routes/           # Definição dos endpoints da API
│   │   ├── services/         # Serviços de e-mail, trabalhadores em background, etc.
│   │   ├── utils/            # Utilitários, loggers e schemas de validação
│   │   └── server.js         # Ponto de entrada do backend
│   ├── tests/                # Testes automáticos (Jest e Supertest)
│   ├── .env.example          # Modelo das variáveis de ambiente do backend
│   └── package.json
│
├── frontend/                 # Aplicação Cliente React + Vite
│   ├── src/
│   │   ├── components/       # Componentes React reutilizáveis
│   │   ├── context/          # Provedores de estado (Socket, Temas, Tabs)
│   │   ├── hooks/            # Custom hooks do React
│   │   ├── pages/            # Páginas e ecrãs da aplicação
│   │   ├── services/         # Clientes de API e comunicação
│   │   ├── utils/            # Funções auxiliares
│   │   └── main.jsx          # Ponto de entrada da aplicação React
│   ├── .env.example          # Modelo das variáveis de ambiente do frontend
│   └── package.json
│
└── .gitignore                # Regras globais de exclusão do Git
```

---

## 🚀 Instalação e Execução Local

### 1. Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd teste
```

### 2. Iniciar o Servidor (Backend)
```bash
cd backend
npm install
npm start
```
O servidor do backend estará a correr por omissão em: `http://localhost:5000`

---

### 3. Iniciar a Aplicação (Frontend)
Num outro terminal:
```bash
cd frontend
npm install
npm run dev
```
A aplicação do frontend estará a correr por omissão em: `http://localhost:5173`

---

## 🧪 Testes Automáticos
O backend conta com uma suite de testes unitários e de integração desenvolvidos com **Jest** e **Supertest**. Para correr os testes:
```bash
cd backend
npm test
```

---

## 🛡️ Práticas de Segurança Implementadas
1.  **Proteção contra Vulnerabilidades Comuns:** Utilização do `helmet` para cabeçalhos HTTP seguros e `hpp` contra poluição de parâmetros HTTP.
2.  **Prevenção contra XSS e SQL/NoSQL Injection:** Limpeza de strings com `xss` e sanitização de dados no MongoDB com `express-mongo-sanitize`.
3.  **Controlo de Fluxo (Rate Limiting):** Restrição de pedidos repetidos em endpoints críticos para evitar ataques de força bruta.
4.  **Autenticação Robusta:** Palavras-passe cifradas com `bcryptjs` e sessões geridas por tokens `JWT` enviados em cookies HttpOnly e Secure.
