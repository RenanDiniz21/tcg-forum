const API_BASE = localStorage.getItem('apiBase')
  || (window.location.protocol === 'file:' ? 'http://localhost:3000/api' : '/api');

const state = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  mode: 'login',
  posts: []
};

const els = {
  sessionUser: document.querySelector('#session-user'),
  logoutBtn: document.querySelector('#logout-btn'),
  loginTab: document.querySelector('#login-tab'),
  registerTab: document.querySelector('#register-tab'),
  authForm: document.querySelector('#auth-form'),
  authPanelContent: document.querySelector('#auth-panel-content'),
  authLegend: document.querySelector('#auth-legend'),
  nameField: document.querySelector('#name-field'),
  nome: document.querySelector('#nome'),
  email: document.querySelector('#email'),
  senha: document.querySelector('#senha'),
  authSubmit: document.querySelector('#auth-submit'),
  postForm: document.querySelector('#post-form'),
  postTitle: document.querySelector('#post-title'),
  postTag: document.querySelector('#post-tag'),
  postContent: document.querySelector('#post-content'),
  postSubmit: document.querySelector('#post-submit'),
  refreshBtn: document.querySelector('#refresh-btn'),
  messages: document.querySelector('#messages'),
  feed: document.querySelector('#feed'),
  feedCount: document.querySelector('#feed-count')
};

async function api(url, opts = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${url}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...opts.headers
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ erro: 'Erro inesperado' }));
    throw new Error(err.erro || 'Erro inesperado');
  }

  if (res.status === 204) return undefined;
  return res.json();
}

function setLoading(button, loadingText, isLoading) {
  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }

  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : button.dataset.originalText;
}

function showMessage(text, type = 'success') {
  els.messages.replaceChildren();
  const box = document.createElement('div');
  box.className = `message ${type}`;
  box.setAttribute('role', type === 'error' ? 'alert' : 'status');
  box.textContent = text;
  els.messages.append(box);
  window.setTimeout(() => box.remove(), 3600);
}

function setAuthMode(mode) {
  state.mode = mode;
  const isRegister = mode === 'register';

  els.loginTab.classList.toggle('active', !isRegister);
  els.registerTab.classList.toggle('active', isRegister);
  els.loginTab.setAttribute('aria-selected', String(!isRegister));
  els.registerTab.setAttribute('aria-selected', String(isRegister));
  els.loginTab.tabIndex = isRegister ? -1 : 0;
  els.registerTab.tabIndex = isRegister ? 0 : -1;
  els.authPanelContent.setAttribute('aria-labelledby', isRegister ? 'register-tab' : 'login-tab');
  els.authLegend.textContent = isRegister ? 'Registro' : 'Login';
  els.nameField.classList.toggle('hidden', !isRegister);
  els.nome.required = isRegister;
  els.authSubmit.textContent = isRegister ? 'Criar conta' : 'Entrar';
  els.senha.autocomplete = isRegister ? 'new-password' : 'current-password';
}

function handleAuthTabsKeydown(event) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

  event.preventDefault();

  if (event.key === 'ArrowLeft' || event.key === 'Home') {
    setAuthMode('login');
    els.loginTab.focus();
    return;
  }

  setAuthMode('register');
  els.registerTab.focus();
}

function syncSession() {
  if (state.user) {
    els.sessionUser.textContent = state.user.nome;
    els.logoutBtn.classList.remove('hidden');
    els.postSubmit.disabled = false;
  } else {
    els.sessionUser.textContent = 'Visitante';
    els.logoutBtn.classList.add('hidden');
    els.postSubmit.disabled = true;
  }
}

function saveSession(payload) {
  state.user = payload.usuario;
  state.token = payload.token;
  localStorage.setItem('user', JSON.stringify(payload.usuario));
  localStorage.setItem('token', payload.token);
  syncSession();
}

function clearSession() {
  state.user = null;
  state.token = null;
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  syncSession();
  renderPosts();
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function getUserId(user) {
  return user?._id || user?.id;
}

function reactionCount(post, tipo) {
  return post.reacoes.filter((reacao) => reacao.tipo === tipo).length;
}

function userReacted(post, tipo) {
  if (!state.user) return false;
  return post.reacoes.some((reacao) => {
    return reacao.tipo === tipo && String(getUserId(reacao.usuario)) === String(state.user.id);
  });
}

function appendText(parent, text, tagName = 'span', className = '') {
  const el = document.createElement(tagName);
  el.className = className;
  el.textContent = text;
  parent.append(el);
  return el;
}

function safeDomId(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, '-');
}

function createPostCard(post) {
  const postId = safeDomId(post._id);
  const article = document.createElement('article');
  article.className = 'post';
  article.setAttribute('aria-labelledby', `post-title-${postId}`);

  const head = document.createElement('header');
  head.className = 'post-head';

  const titleWrap = document.createElement('div');
  const title = appendText(titleWrap, post.titulo, 'h3');
  title.id = `post-title-${postId}`;

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.append(document.createTextNode(`por ${post.autor?.nome || 'Usuario'} em `));
  const time = document.createElement('time');
  time.dateTime = post.createdAt;
  time.textContent = formatDate(post.createdAt);
  meta.append(time);
  titleWrap.append(meta);

  const tag = appendText(document.createElement('div'), post.tag, 'span', 'tag');
  head.append(titleWrap, tag.parentElement);

  const body = appendText(article, post.conteudo, 'p', 'post-body');

  article.prepend(head);
  article.append(createActions(post), createComments(post));

  return article;
}

function createActions(post) {
  const actions = document.createElement('footer');
  actions.className = 'actions';
  actions.setAttribute('aria-label', `Acoes da postagem ${post.titulo}`);

  [
    ['like', 'Curtir'],
    ['fire', 'Quente'],
    ['spark', 'Ideia']
  ].forEach(([tipo, label]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `action-btn ${userReacted(post, tipo) ? 'active' : ''}`;
    btn.textContent = `${label} (${reactionCount(post, tipo)})`;
    btn.setAttribute('aria-pressed', String(userReacted(post, tipo)));
    btn.addEventListener('click', () => handleReaction(post._id, tipo, btn));
    actions.append(btn);
  });

  if (state.user && String(getUserId(post.autor)) === String(state.user.id)) {
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'action-btn';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => handleEditPost(post));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'action-btn danger';
    deleteBtn.textContent = 'Excluir';
    deleteBtn.addEventListener('click', () => handleDeletePost(post._id, deleteBtn));

    actions.append(editBtn, deleteBtn);
  }

  return actions;
}

function createComments(post) {
  const wrap = document.createElement('section');
  wrap.className = 'comments';
  wrap.setAttribute('aria-label', `Comentarios da postagem ${post.titulo}`);

  appendText(wrap, `${post.comentarios.length} comentario(s)`, 'h4');

  const list = document.createElement('ol');
  list.className = 'comments-list';

  post.comentarios.forEach((comment) => {
    const item = document.createElement('li');
    item.className = 'comment';
    appendText(item, `${comment.autor?.nome || 'Usuario'} comentou`, 'strong', 'meta');
    appendText(item, comment.texto, 'p');
    list.append(item);
  });

  wrap.append(list);

  const form = document.createElement('form');
  form.className = 'comment-form';
  form.setAttribute('aria-label', `Comentar na postagem ${post.titulo}`);

  const input = document.createElement('input');
  input.name = 'comentario';
  input.placeholder = state.user ? 'Escreva um comentario...' : 'Entre para comentar';
  input.setAttribute('aria-label', 'Comentario');
  input.required = true;
  input.disabled = !state.user;

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.textContent = 'Comentar';
  btn.disabled = !state.user;

  form.append(input, btn);
  form.addEventListener('submit', (event) => handleComment(event, post._id, input, btn));
  wrap.append(form);

  return wrap;
}

function renderPosts() {
  els.feed.replaceChildren();
  els.feedCount.textContent = `${state.posts.length} postagem(ns)`;

  if (!state.posts.length) {
    appendText(els.feed, 'Ainda nao ha postagens. Seja a primeira pessoa a abrir uma discussao.', 'p', 'empty');
    return;
  }

  state.posts.forEach((post) => els.feed.append(createPostCard(post)));
}

async function loadPosts() {
  setLoading(els.refreshBtn, 'Atualizando...', true);
  els.feedCount.textContent = 'Carregando postagens...';

  try {
    state.posts = await api('/posts');
    renderPosts();
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    setLoading(els.refreshBtn, 'Atualizar', false);
  }
}

async function handleAuth(event) {
  event.preventDefault();
  setLoading(els.authSubmit, state.mode === 'register' ? 'Criando...' : 'Entrando...', true);

  const body = {
    email: els.email.value.trim(),
    senha: els.senha.value
  };

  if (state.mode === 'register') {
    body.nome = els.nome.value.trim();
  }

  try {
    const payload = await api(state.mode === 'register' ? '/auth/registrar' : '/auth/login', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    saveSession(payload);
    els.authForm.reset();
    showMessage(state.mode === 'register' ? 'Conta criada!' : 'Login realizado!');
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    setLoading(els.authSubmit, state.mode === 'register' ? 'Criar conta' : 'Entrar', false);
  }
}

async function handleCreatePost(event) {
  event.preventDefault();

  if (!state.user) {
    showMessage('Entre para publicar uma postagem', 'error');
    return;
  }

  setLoading(els.postSubmit, 'Publicando...', true);

  try {
    const post = await api('/posts', {
      method: 'POST',
      body: JSON.stringify({
        titulo: els.postTitle.value.trim(),
        tag: els.postTag.value,
        conteudo: els.postContent.value.trim()
      })
    });

    state.posts.unshift(post);
    els.postForm.reset();
    renderPosts();
    showMessage('Postagem publicada!');
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    setLoading(els.postSubmit, 'Publicar', false);
  }
}

async function handleReaction(postId, tipo, btn) {
  if (!state.user) {
    showMessage('Entre para reagir', 'error');
    return;
  }

  setLoading(btn, '...', true);

  try {
    const updated = await api(`/posts/${postId}/reacoes`, {
      method: 'POST',
      body: JSON.stringify({ tipo })
    });
    state.posts = state.posts.map((post) => (post._id === updated._id ? updated : post));
    renderPosts();
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    setLoading(btn, btn.dataset.originalText || 'Reagir', false);
  }
}

async function handleComment(event, postId, input, btn) {
  event.preventDefault();
  setLoading(btn, '...', true);

  try {
    const updated = await api(`/posts/${postId}/comentarios`, {
      method: 'POST',
      body: JSON.stringify({ texto: input.value.trim() })
    });
    state.posts = state.posts.map((post) => (post._id === updated._id ? updated : post));
    renderPosts();
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    setLoading(btn, 'Comentar', false);
  }
}

async function handleEditPost(post) {
  const titulo = window.prompt('Novo titulo', post.titulo);
  if (titulo === null) return;

  const conteudo = window.prompt('Novo conteudo', post.conteudo);
  if (conteudo === null) return;

  try {
    const updated = await api(`/posts/${post._id}`, {
      method: 'PUT',
      body: JSON.stringify({ titulo: titulo.trim(), conteudo: conteudo.trim(), tag: post.tag })
    });
    state.posts = state.posts.map((item) => (item._id === updated._id ? updated : item));
    renderPosts();
    showMessage('Postagem atualizada!');
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

async function handleDeletePost(postId, btn) {
  if (!window.confirm('Excluir esta postagem?')) return;

  setLoading(btn, 'Excluindo...', true);

  try {
    await api(`/posts/${postId}`, { method: 'DELETE' });
    state.posts = state.posts.filter((post) => post._id !== postId);
    renderPosts();
    showMessage('Postagem excluida!');
  } catch (err) {
    showMessage(err.message, 'error');
  } finally {
    setLoading(btn, 'Excluir', false);
  }
}

els.loginTab.addEventListener('click', () => setAuthMode('login'));
els.registerTab.addEventListener('click', () => setAuthMode('register'));
els.loginTab.addEventListener('keydown', handleAuthTabsKeydown);
els.registerTab.addEventListener('keydown', handleAuthTabsKeydown);
els.authForm.addEventListener('submit', handleAuth);
els.postForm.addEventListener('submit', handleCreatePost);
els.refreshBtn.addEventListener('click', loadPosts);
els.logoutBtn.addEventListener('click', clearSession);

syncSession();
loadPosts();
