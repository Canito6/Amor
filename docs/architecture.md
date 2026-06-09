# Documentação da Arquitetura do Sistema 💑

Este projeto foi reestruturado de uma disposição baseada em funcionalidades para uma arquitetura baseada em camadas (MVC) limpa e escalável.

---

## 📂 Estrutura de Pastas do Backend

A lógica de negócios no backend está agora dividida por responsabilidades nas seguintes pastas dentro de `backend/src/`:

- **`models/`**: Definições dos esquemas do Mongoose/MongoDB (ex: `userModel.js`, `coupleModel.js`, `memoryModel.js`).
- **`controllers/`**: Controladores que gerem os pedidos e respostas HTTP (ex: `adminController.js`, `coupleController.js`). Estendem o `baseController.js`.
- **`services/`**: Serviços que encapsulam regras de negócio, envio de emails (`mailer.js`) e integrações na cloud (`storageService.js`).
- **`repositories/`**: Abstração de persistência de dados. Acedem diretamente aos modelos e estendem o `baseRepository.js`.
- **`routes/`**: Definição de endpoints REST mapeados de forma limpa (ex: `authRoutes.js`, `memoryRoutes.js`).
- **`validations/`**: Esquemas de validação de dados para as rotas.
- **`jobs/`**: Listeners de eventos em tempo real (`notificationListener.js`) e trabalhadores agendados/background (`timeCapsuleWorker.js`).
- **`app.js`**: Configurações de middlewares globais (CORS, cookies, segurança) e registo inicial de rotas HTTP.
- **`server.js`**: Ponto de entrada do backend. Liga-se à base de dados, inicializa o Socket.io e escuta a porta HTTP.

---

## 📂 Estrutura de Pastas do Frontend

No frontend (`frontend/src/`):

- **`components/layout/`**: Componentes estruturais e de navegação global (`Header.jsx`, `Sidebar.jsx`, `MainLayout.jsx`).
- **`routes/AppRoutes.jsx`**: Lógica centralizada de roteamento do React Router, despoluindo a raiz da aplicação.
- **`assets/styles/`**: Centralização de folhas de estilo e gradientes globais (`index.css`).

---

## 🔒 Isolamento e Prevenção de Conflitos de Sessão

Para suportar múltiplos utilizadores e casais sem qualquer vazamento de dados em tempo real ou nos painéis:

1. **Gestão de Token e Sala de Casal (`coupleId`)**:
   - O `coupleId` da base de dados é guardado no `localStorage` após a autenticação.
   - Sempre que há alteração de estado (login, logout, vinculação de novo casal), é emitido um evento global `authChange`.

2. **Reconexão Dinâmica do Socket.io**:
   - O `SocketContext` escuta o evento `authChange`.
   - Se o utilizador sair, o socket anterior é explicitamente desconectado e o estado limpo.
   - Se o utilizador entrar com outra conta, é efetuada uma nova conexão ligando-se exclusivamente à sala do `coupleId` correto (eliminando conexões partilhadas à sala genérica `'default_couple'`).

3. **Isolamento de Estado em Memória**:
   - O `TabContext` monitoriza o evento `authChange` para limpar imediatamente abas customizadas da conta anterior e recarregar os dados corretos da conta ativa.
