let nomes = [];

function load() {
  try {
    const raw = localStorage.getItem("nomes");
    nomes = raw ? JSON.parse(raw) : [];
  } catch {
    nomes = [];
  }
}
//utils
function save() {
  localStorage.setItem("nomes", JSON.stringify(nomes));
}

const byId = (id) => document.getElementById(id);
const msg = byId("msg");
const lista = byId("lista");
const tpl = byId("tpl-item");
const inputNome = byId("nome");
const inputBusca = byId("busca");
const btnLimpar = byId("btn-limpar");

function showMsg(text, isError = false) {
  msg.textContent = text || "";
  msg.classList.toggle("error", !!isError);
}

function normalize(s) {
  return (s ?? "").trim();
}

// retorna índice do nome (case-insensitive) ou -1
function indexOfName(nome, ignoreIndex = -1) {
  const alvo = nome.toLowerCase();
  for (let i = 0; i < nomes.length; i++) {
    if (i === ignoreIndex) continue;
    if (nomes[i].toLowerCase() === alvo) return i;
  }
  return -1;
}

// CRUD 
function addName(nome) {
  const n = normalize(nome);
  if (!n) {
    showMsg("Nome vazio não rola.", true);
    return false;
  }
  if (indexOfName(n) !== -1) {
    showMsg("Nome já cadastrado.", true);
    return false;
  }
  nomes.push(n);
  save();
  renderList(inputBusca.value);
  showMsg("Nome cadastrado com sucesso!");
  return true;
}

function removeName(index) {
  if (index < 0 || index >= nomes.length) return;
  const ok = confirm(`Remover "${nomes[index]}"?`);
  if (!ok) return;
  nomes.splice(index, 1);
  save();
  renderList(inputBusca.value);
}

function editName(index) {
  if (index < 0 || index >= nomes.length) return;
  const atual = nomes[index];
  const novo = prompt(`Editar nome (atual: "${atual}")`, atual);
  if (novo === null) return; // cancelado
  const nn = normalize(novo);
  if (!nn) {
    showMsg("Nome vazio não é permitido.", true);
    return;
  }
  if (indexOfName(nn, index) !== -1) {
    showMsg("Nome duplicado.", true);
    return;
  }
  nomes[index] = nn;
  save();
  renderList(inputBusca.value);
  showMsg("Nome atualizado!");
}

// Renderização
function renderList(filtro = "") {
  const f = normalize(filtro).toLowerCase();
  lista.innerHTML = "";

  const filtrados = f
    ? nomes
        .map((nome, idx) => ({ nome, idx }))
        .filter(({ nome }) => nome.toLowerCase().includes(f))
    : nomes.map((nome, idx) => ({ nome, idx }));

  if (filtrados.length === 0) {
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `<span class="texto">Nenhum nome ${f ? "encontrado para o filtro" : "cadastrado"}.</span>`;
    lista.appendChild(li);
    return;
  }

  for (const { nome, idx } of filtrados) {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector(".texto").textContent = nome;
    node.querySelector(".editar").addEventListener("click", () => editName(idx));
    node.querySelector(".remover").addEventListener("click", () => removeName(idx));
    lista.appendChild(node);
  }
}

// Bootstrap
load();
renderList();

// Form de inclusão
byId("form-add").addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = addName(inputNome.value);
  if (ok) inputNome.value = "";
  inputNome.focus();
});

// Busca ao digitar
inputBusca.addEventListener("input", (e) => {
  renderList(e.target.value);
});

// Limpar tudo
btnLimpar.addEventListener("click", () => {
  if (!nomes.length) return;
  const ok = confirm("Apagar TODOS os nomes?");
  if (!ok) return;
  nomes = [];
  save();
  renderList(inputBusca.value);
  showMsg("Lista zerada.");
});

//Tema (claro/escuro)
const THEME_KEY = "theme";
const root = document.documentElement;
const btnTheme = document.getElementById("btn-theme");

function systemPrefersDark() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return systemPrefersDark() ? "dark" : "light";
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  // atualiza estado acessível do botão
  if (btnTheme) btnTheme.setAttribute("aria-pressed", theme === "dark");
}

function toggleTheme() {
  const current = root.getAttribute("data-theme") || getInitialTheme();
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

// Bootstrap de tema
applyTheme(getInitialTheme());

// Listener do botão
if (btnTheme) btnTheme.addEventListener("click", toggleTheme);

//reatividade ao sistema
try {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener?.("change", (e) => {
    const stored = localStorage.getItem(THEME_KEY);
    if (!stored) applyTheme(e.matches ? "dark" : "light");
  });
} catch {}
