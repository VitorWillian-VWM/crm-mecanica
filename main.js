const API_URL = "api.php";

let db = {
    clientes: [],
    estoque: [],
    ordensServico: [],
    historico: [],
    financeiro: []
};

async function carregarBanco() {
    const response = await fetch(API_URL);
    db = await response.json();

    if (!db.clientes) db.clientes = [];
    if (!db.estoque) db.estoque = [];
    if (!db.ordensServico) db.ordensServico = [];
    if (!db.historico) db.historico = [];
    if (!db.financeiro) db.financeiro = [];
}

const pageContent = document.getElementById("pageContent");
const pageTitle = document.getElementById("pageTitle");
const pageDescription = document.getElementById("pageDescription");

const pages = {
    dashboard: {
        title: "Dashboard",
        description: "Visão geral da oficina",
        file: null
    },
    clientes: {
        title: "Clientes",
        description: "Cadastro, consulta e informações gerais dos clientes.",
        file: "assets/pages/clientes.html"
    },
    patio: {
        title: "Pátio / O.S",
        description: "Controle de veículos no pátio e ordens de serviço.",
        file: "assets/pages/patio.html"
    },
    estoque: {
        title: "Estoque",
        description: "Controle de peças, entrada e saída de produtos.",
        file: "assets/pages/estoque.html"
    },
    financeiro: {
        title: "Financeiro",
        description: "Resumo de valores, serviços e faturamento.",
        file: "assets/pages/financeiro.html"
    },
    historico: {
        title: "Histórico",
        description: "Histórico de serviços, clientes e veículos.",
        file: "assets/pages/historico.html"
    }
};

const dashboardHTML = pageContent.innerHTML;

document.querySelectorAll(".menu-item").forEach(button => {
    button.addEventListener("click", () => {
        const page = button.dataset.page;

        document.querySelectorAll(".menu-item").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");
        loadPage(page);
    });
});

async function loadPage(page) {
    const selectedPage = pages[page];

    if (!selectedPage) {
        pageContent.innerHTML = `
            <div class="panel">
                <h3>Página não encontrada</h3>
                <p>Essa página ainda não foi configurada.</p>
            </div>
        `;
        return;
    }

    pageTitle.textContent = selectedPage.title;
    pageDescription.textContent = selectedPage.description;

    if (!selectedPage.file) {
        pageContent.innerHTML = dashboardHTML;
        return;
    }

    try {
        const response = await fetch(selectedPage.file);

        if (!response.ok) {
            throw new Error("Página não encontrada.");
        }

        pageContent.innerHTML = await response.text();

        if (page === "clientes") {
            iniciarPaginaClientes();
        }

    } catch (error) {
        pageContent.innerHTML = `
            <div class="panel">
                <h3>Erro ao carregar página</h3>
                <p>Não foi possível carregar: ${selectedPage.file}</p>
            </div>
        `;
    }
}

function iniciarPaginaClientes() {
    const clienteForm = document.getElementById("clienteForm");
    const clientesGrid = document.getElementById("clientesGrid");
    const buscaCliente = document.getElementById("buscaCliente");
    const totalClientes = document.getElementById("totalClientes");

    const modalCliente = document.getElementById("modalCliente");
    const abrirModalCliente = document.getElementById("abrirModalCliente");
    const fecharModalCliente = document.getElementById("fecharModalCliente");
    const cancelarModalCliente = document.getElementById("cancelarModalCliente");

    let clientes = [];

    function abrirModal() {
        modalCliente.classList.add("active");
    }

    function fecharModal() {
        modalCliente.classList.remove("active");
        clienteForm.reset();
    }

    abrirModalCliente.addEventListener("click", abrirModal);
    fecharModalCliente.addEventListener("click", fecharModal);
    cancelarModalCliente.addEventListener("click", fecharModal);

    modalCliente.addEventListener("click", (event) => {
        if (event.target === modalCliente) {
            fecharModal();
        }
    });

    setInterval(async () => {
        await carregarBanco();
        clientes = db.clientes || [];
        renderizarClientes();
    }, 3000);

    clienteForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const cliente = {
            id: Date.now(),
            nome: document.getElementById("cliNome").value.trim(),
            mae: document.getElementById("cliMae").value.trim(),
            pai: document.getElementById("cliPai").value.trim(),
            nascimento: document.getElementById("cliNascimento").value,
            telefone: document.getElementById("cliTelefone").value.trim(),
            qtdVeiculos: document.getElementById("cliQtdVeiculos").value.trim(),
            placa: document.getElementById("cliPlaca").value.trim().toUpperCase(),
            marca: document.getElementById("cliMarca").value.trim(),
            modelo: document.getElementById("cliModelo").value.trim(),
            ano: document.getElementById("cliAno").value.trim(),
            obs: document.getElementById("cliObs").value.trim()
        };

        clientes.push(cliente);

        fecharModal();
        renderizarClientes();
    });

    buscaCliente.addEventListener("input", renderizarClientes);

    function renderizarClientes() {
        const busca = buscaCliente.value.toLowerCase();

        const filtrados = clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(busca) ||
            cliente.telefone.toLowerCase().includes(busca) ||
            cliente.placa.toLowerCase().includes(busca)
        );

        totalClientes.textContent = `${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} cadastrado${clientes.length !== 1 ? "s" : ""}`;

        clientesGrid.innerHTML = filtrados.map(cliente => `
            <article class="client-card">
                <div class="client-info">
                    <h3>${cliente.nome}</h3>

                    <p>
                        <i class="ri-phone-line"></i>
                        ${cliente.telefone || "Sem telefone"}
                    </p>

                    <p>
                        <i class="ri-car-line"></i>
                        ${cliente.placa || "Sem placa"} - ${cliente.marca || "Sem marca"} ${cliente.modelo || ""}
                    </p>
                </div>

                <div class="client-actions">
                    <button class="btn-soft" type="button">
                        <i class="ri-eye-line"></i>
                        Ver detalhes
                    </button>

                    <button class="btn-soft" type="button">
                        <i class="ri-tools-line"></i>
                        Abrir O.S.
                    </button>
                </div>
            </article>
        `).join("") || `
            <p class="empty-message">Nenhum cliente cadastrado.</p>
        `;
    }

    renderizarClientes();
}

/* ===============================
   NOTIFICAÇÕES - MENU SUPERIOR
================================ */
const notificationBtn = document.getElementById("notificationBtn");
const notificationMenu = document.getElementById("notificationMenu");

if(notificationBtn && notificationMenu){
    notificationBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        notificationMenu.classList.toggle("active");
    });

    notificationMenu.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        notificationMenu.classList.remove("active");
    });
}

/* ===============================
   CONFIGURAÇÕES - MENU SUPERIOR
================================ */
const settingsBtn = document.getElementById("settingsBtn");
const settingsMenu = document.getElementById("settingsMenu");

if(settingsBtn && settingsMenu){
    settingsBtn.addEventListener("click", (event) => {
        event.stopPropagation();

        settingsMenu.classList.toggle("active");

        if(notificationMenu){
            notificationMenu.classList.remove("active");
        }
    });

    settingsMenu.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        settingsMenu.classList.remove("active");
    });
}