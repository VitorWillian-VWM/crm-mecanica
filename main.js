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

        if (page === "patio") {
            iniciarPaginaPatio();
        }

        if (page === "estoque") {
            iniciarPaginaEstoque();
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

/* função para iniciar a página de pátio e ordens de serviço */
async function iniciarPaginaPatio() {
    const abrirModalOS = document.getElementById("abrirModalOS");
    const fecharModalOS = document.getElementById("fecharModalOS");
    const cancelarModalOS = document.getElementById("cancelarModalOS");
    const modalOS = document.getElementById("modalOS");
    const osForm = document.getElementById("osForm");

    const osClienteSelect = document.getElementById("osClienteSelect");
    const osTelefone = document.getElementById("osTelefone");
    const osPlaca = document.getElementById("osPlaca");
    const osMarca = document.getElementById("osMarca");
    const osModelo = document.getElementById("osModelo");
    const osAno = document.getElementById("osAno");

    const osPecaSelect = document.getElementById("osPecaSelect");
    const osPecaQtd = document.getElementById("osPecaQtd");
    const adicionarPecaOS = document.getElementById("adicionarPecaOS");
    const pecasOSLista = document.getElementById("pecasOSLista");

    const osMaoObra = document.getElementById("osMaoObra");
    const osTotalPecas = document.getElementById("osTotalPecas");
    const osTotalGeral = document.getElementById("osTotalGeral");

    if (!abrirModalOS || !modalOS || !osForm) return;

    let pecasSelecionadas = [];

    await carregarBanco();

    preencherClientesSelect();
    preencherPecasSelect();

    function abrirModal() {
        modalOS.classList.add("active");
    }

    function fecharModal() {
        modalOS.classList.remove("active");
        osForm.reset();
        pecasSelecionadas = [];
        renderizarPecasOS();
        calcularTotais();
    }

    function preencherClientesSelect() {
        osClienteSelect.innerHTML = `
            <option value="">Selecione um cliente...</option>
            ${db.clientes.map(cliente => `
                <option value="${cliente.id}">
                    ${cliente.nome} ${cliente.placa ? `- ${cliente.placa}` : ""}
                </option>
            `).join("")}
        `;
    }

    function preencherPecasSelect() {
        osPecaSelect.innerHTML = `
            <option value="">Selecione uma peça...</option>
            ${(db.estoque || []).map(peca => `
                <option value="${peca.id}">
                    ${peca.nome || peca.descricao} - R$ ${Number(peca.preco || 0).toFixed(2)}
                </option>
            `).join("")}
        `;
    }

    osClienteSelect.addEventListener("change", () => {
        const clienteId = Number(osClienteSelect.value);
        const cliente = db.clientes.find(item => Number(item.id) === clienteId);

        if (!cliente) {
            osTelefone.value = "";
            osPlaca.value = "";
            osMarca.value = "";
            osModelo.value = "";
            osAno.value = "";
            return;
        }

        osTelefone.value = cliente.telefone || "";
        osPlaca.value = cliente.placa || "";
        osMarca.value = cliente.marca || "";
        osModelo.value = cliente.modelo || "";
        osAno.value = cliente.ano || "";
    });

    adicionarPecaOS.addEventListener("click", () => {
        const pecaId = Number(osPecaSelect.value);
        const quantidade = Number(osPecaQtd.value);

        if (!pecaId || quantidade <= 0) {
            alert("Selecione uma peça e informe uma quantidade válida.");
            return;
        }

        const peca = db.estoque.find(item => Number(item.id) === pecaId);

        if (!peca) {
            alert("Peça não encontrada no estoque.");
            return;
        }

        const itemExistente = pecasSelecionadas.find(item => Number(item.id) === pecaId);

        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            pecasSelecionadas.push({
                id: peca.id,
                nome: peca.nome || peca.descricao,
                preco: Number(peca.preco || 0),
                quantidade
            });
        }

        osPecaSelect.value = "";
        osPecaQtd.value = "";

        renderizarPecasOS();
        calcularTotais();
    });

    function renderizarPecasOS() {
        pecasOSLista.innerHTML = pecasSelecionadas.length
            ? pecasSelecionadas.map((peca, index) => `
                <div class="peca-os-item">
                    <div>
                        <strong>${peca.nome}</strong>
                        <span>${peca.quantidade}x R$ ${peca.preco.toFixed(2)}</span>
                    </div>

                    <button type="button" class="btn-soft" onclick="removerPecaOS(${index})">
                        Remover
                    </button>
                </div>
            `).join("")
            : `<p class="empty-message">Nenhuma peça adicionada à O.S.</p>`;
    }

    window.removerPecaOS = function (index) {
        pecasSelecionadas.splice(index, 1);
        renderizarPecasOS();
        calcularTotais();
    };

    function calcularTotais() {
        const totalPecas = pecasSelecionadas.reduce((total, peca) => {
            return total + (peca.preco * peca.quantidade);
        }, 0);

        const maoObra = Number(osMaoObra.value || 0);
        const totalGeral = totalPecas + maoObra;

        osTotalPecas.value = totalPecas.toFixed(2);
        osTotalGeral.value = totalGeral.toFixed(2);
    }

    osMaoObra.addEventListener("input", calcularTotais);

    abrirModalOS.addEventListener("click", abrirModal);
    fecharModalOS.addEventListener("click", fecharModal);
    cancelarModalOS.addEventListener("click", fecharModal);

    modalOS.addEventListener("click", (event) => {
        if (event.target === modalOS) {
            fecharModal();
        }
    });

    osForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const clienteSelecionado = db.clientes.find(
            cliente => Number(cliente.id) === Number(osClienteSelect.value)
        );

        const ordemServico = {
            id: Date.now(),
            clienteId: clienteSelecionado?.id || null,
            clienteNome: clienteSelecionado?.nome || "",
            telefone: osTelefone.value.trim(),
            placa: osPlaca.value.trim().toUpperCase(),
            marca: osMarca.value.trim(),
            modelo: osModelo.value.trim(),
            ano: osAno.value.trim(),
            dataEntrada: document.getElementById("osDataEntrada").value,
            status: document.getElementById("osStatus").value,
            pagamento: document.getElementById("osPagamento").value,
            problema: document.getElementById("osProblema").value.trim(),
            servico: document.getElementById("osServico").value.trim(),
            pecas: pecasSelecionadas,
            maoObra: Number(osMaoObra.value || 0),
            totalPecas: Number(osTotalPecas.value || 0),
            totalGeral: Number(osTotalGeral.value || 0),
            observacoes: document.getElementById("osObs").value.trim(),
            criadoEm: new Date().toLocaleString("pt-BR")
        };

        console.log("Ordem de Serviço:", ordemServico);

        fecharModal();
    });

    renderizarPecasOS();
    calcularTotais();
}

/* ===============================
   NOTIFICAÇÕES - MENU SUPERIOR
================================ */
const notificationBtn = document.getElementById("notificationBtn");
const notificationMenu = document.getElementById("notificationMenu");

if (notificationBtn && notificationMenu) {
    notificationBtn.addEventListener("click", (event) => {
        event.stopPropagation();

        notificationMenu.classList.toggle("active");

        if (settingsMenu) {
            settingsMenu.classList.remove("active");
        }

        if (userMenu) {
            userMenu.classList.remove("active");
        }
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

if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener("click", (event) => {
        event.stopPropagation();

        settingsMenu.classList.toggle("active");

        if (notificationMenu) {
            notificationMenu.classList.remove("active");
        }

        if (userMenu) {
            userMenu.classList.remove("active");
        }
    });

    settingsMenu.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        settingsMenu.classList.remove("active");
    });
}

/* ===============================
   MENU DO USUÁRIO
================================ */
const userBtn = document.getElementById("userBtn");
const userMenu = document.getElementById("userMenu");

if (userBtn && userMenu) {
    userBtn.addEventListener("click", (event) => {
        event.stopPropagation();

        userMenu.classList.toggle("active");

        if (notificationMenu) {
            notificationMenu.classList.remove("active");
        }

        if (settingsMenu) {
            settingsMenu.classList.remove("active");
        }
    });

    userMenu.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    document.addEventListener("click", () => {
        userMenu.classList.remove("active");
    });
}

