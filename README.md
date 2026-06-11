# TCG Forum

Forum simples sobre Pokemon TCG com login, criacao de postagens, comentarios e reacoes.

## Estrutura

- `backend/`: API Express, MongoDB Atlas, JWT e models Mongoose.
- `frontend/`: HTML, CSS e JavaScript vanilla.

## Como rodar

1. Copie `backend/.env.example` para `backend/.env`.
2. Preencha `MONGODB_URI` e `JWT_SECRET`.
3. Instale dependencias:

```bash
npm install
```

4. Rode o servidor:

```bash
npm run dev
```

5. Abra `frontend/index.html` no navegador.

Por padrao a API roda em `http://localhost:3000/api`.

## Deploy na Vercel

O projeto inclui `vercel.json` e `index.js` na raiz para a Vercel importar o app Express.

1. Acesse a Vercel e importe o repositorio.
2. Adicione as variaveis de ambiente:

```text
MONGODB_URI=sua_url_do_mongodb_atlas
JWT_SECRET=seu_segredo_jwt
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

3. Confirme que o MongoDB Atlas permite conexoes do deploy.
4. Clique em Deploy.

Na Vercel, o app e exportado por `index.js` e a plataforma gerencia o servidor automaticamente.
