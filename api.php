<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

$dbFile = "db.json";

if (!file_exists($dbFile)) {
    file_put_contents($dbFile, json_encode([
        "clientes" => [],
        "estoque" => [],
        "ordensServico" => [],
        "historico" => [],
        "financeiro" => []
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    echo file_get_contents($dbFile);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = file_get_contents("php://input");

    if (!$data) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Nenhum dado recebido."]);
        exit;
    }

    file_put_contents($dbFile, $data);

    echo json_encode([
        "success" => true,
        "message" => "Banco de dados salvo com sucesso."
    ]);
    exit;
}

http_response_code(405);
echo json_encode([
    "success" => false,
    "message" => "Método não permitido."
]);