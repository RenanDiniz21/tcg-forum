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
