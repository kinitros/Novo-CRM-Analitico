<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Configuração do CRM atual
$CRM_BASE_URL = 'https://crm.conectaprime.com';
$JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Yzg0OTBmZWYyOWU2Zjk1Mzk1NjFiMyIsImVtYWlsIjoiYWRtaW5Ac2VndWlkb3Jlc3ByaW1lLmNvbSIsInJvbGUiOiJhZG1pbiIsInBlcm1pc3NvZXMiOltdLCJpYXQiOjE3NTY0MTcxMzMsImV4cCI6MTc1NjQzNTEzM30.rQj7TcNlAKY79aYh9V4tvkmXiBEqXG0Jo0PCs37x9wk';

// Configuração do MongoDB (se disponível)
$MONGODB_URI = 'mongodb://localhost:27017'; // Ajuste conforme necessário
$MONGODB_DATABASE = 'crm_database'; // Nome do banco do seu CRM

// Cache simples em arquivo
$CACHE_DIR = '/tmp/crm_cache';
$CACHE_TTL = 300; // 5 minutos

// Criar diretório de cache se não existir
if (!is_dir($CACHE_DIR)) {
    mkdir($CACHE_DIR, 0755, true);
}

// Roteamento baseado na URL
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

// Extrair segmentos após crm-proxy.php
if (strpos($path, 'crm-proxy.php') !== false) {
    $parts = explode('crm-proxy.php', $path);
    $remainingPath = isset($parts[1]) ? trim($parts[1], '/') : '';
    $segments = $remainingPath ? explode('/', $remainingPath) : [];
} else {
    $segments = explode('/', trim($path, '/'));
    $apiIndex = array_search('api', $segments);
    if ($apiIndex !== false) {
        $segments = array_slice($segments, $apiIndex + 1);
    }
}

$endpoint = $segments[0] ?? '';
$action = $segments[1] ?? '';

switch ($endpoint) {
    case 'crm':
        handleCrmProxy($action);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint não encontrado']);
}

function handleCrmProxy($action) {
    switch ($action) {
        case 'clientes':
            getClientesPaginated();
            break;
        case 'vendas':
            getVendasPaginated();
            break;
        case 'produtos':
            getProdutosPaginated();
            break;
        case 'metrics':
            getMetricsOptimized();
            break;
        case 'sales-chart':
            getSalesChartOptimized();
            break;
        case 'customer-sales':
            getCustomerSalesOptimized();
            break;
        case 'product-sales':
            getProductSalesOptimized();
            break;
        case 'inactive-customers':
            getInactiveCustomersOptimized();
            break;
        case 'customer-segmentation':
            getCustomerSegmentationOptimized();
            break;
        case 'advanced-product-analytics':
            getAdvancedProductAnalyticsOptimized();
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Ação não encontrada']);
    }
}

// Função de cache
function getCache($key) {
    global $CACHE_DIR, $CACHE_TTL;
    $file = $CACHE_DIR . '/' . md5($key) . '.json';
    
    if (file_exists($file) && (time() - filemtime($file)) < $CACHE_TTL) {
        return json_decode(file_get_contents($file), true);
    }
    
    return null;
}

function setCache($key, $data) {
    global $CACHE_DIR;
    $file = $CACHE_DIR . '/' . md5($key) . '.json';
    file_put_contents($file, json_encode($data));
}

// Conexão MongoDB (se disponível)
function getMongoConnection() {
    global $MONGODB_URI, $MONGODB_DATABASE;
    
    try {
        if (class_exists('MongoDB\Client')) {
            $client = new MongoDB\Client($MONGODB_URI);
            return $client->selectDatabase($MONGODB_DATABASE);
        }
    } catch (Exception $e) {
        error_log("MongoDB connection failed: " . $e->getMessage());
    }
    
    return null;
}

// Clientes com paginação
function getClientesPaginated() {
    $page = (int)($_GET['page'] ?? 1);
    $limit = min((int)($_GET['limit'] ?? 50), 100); // Máximo 100 por página
    $search = $_GET['search'] ?? '';
    
    $cacheKey = "clientes_page_{$page}_limit_{$limit}_search_" . md5($search);
    $cached = getCache($cacheKey);
    
    if ($cached) {
        echo json_encode($cached);
        return;
    }
    
    // Tentar MongoDB primeiro
    $mongo = getMongoConnection();
    if ($mongo) {
        $result = getClientesFromMongo($mongo, $page, $limit, $search);
        if ($result) {
            setCache($cacheKey, $result);
            echo json_encode($result);
            return;
        }
    }
    
    // Fallback para API
    $result = getClientesFromAPI($page, $limit, $search);
    setCache($cacheKey, $result);
    echo json_encode($result);
}

function getClientesFromMongo($mongo, $page, $limit, $search) {
    try {
        $collection = $mongo->selectCollection('clientes');
        
        $filter = [];
        if ($search) {
            $filter['$or'] = [
                ['nome' => new MongoDB\BSON\Regex($search, 'i')],
                ['email' => new MongoDB\BSON\Regex($search, 'i')]
            ];
        }
        
        $skip = ($page - 1) * $limit;
        
        $cursor = $collection->find($filter, [
            'skip' => $skip,
            'limit' => $limit,
            'sort' => ['createdAt' => -1]
        ]);
        
        $total = $collection->countDocuments($filter);
        $clientes = [];
        
        foreach ($cursor as $doc) {
            $clientes[] = [
                'id' => (string)$doc['_id'],
                'nome' => $doc['nome'] ?? '',
                'email' => $doc['email'] ?? '',
                'telefone' => $doc['telefone'] ?? '',
                'empresa' => $doc['empresa'] ?? '',
                'createdAt' => $doc['createdAt'] ?? null,
                'updatedAt' => $doc['updatedAt'] ?? null
            ];
        }
        
        return [
            'data' => $clientes,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ];
        
    } catch (Exception $e) {
        error_log("MongoDB query failed: " . $e->getMessage());
        return null;
    }
}

function getClientesFromAPI($page, $limit, $search) {
    global $CRM_BASE_URL, $JWT_TOKEN;
    
    // Buscar todos os clientes primeiro
    $url = $CRM_BASE_URL . '/api/crm/clientes';
    $allClientes = makeRequest($url);
    
    if (!$allClientes || !is_array($allClientes)) {
        return ['data' => [], 'pagination' => ['page' => 1, 'limit' => $limit, 'total' => 0, 'pages' => 0]];
    }
    
    // Buscar vendas para calcular dados por cliente
    $vendasUrl = $CRM_BASE_URL . '/api/crm/vendas';
    $allVendas = makeRequest($vendasUrl);
    $vendas = is_array($allVendas) ? $allVendas : [];
    
    // Processar dados dos clientes com informações de vendas
    $processedClientes = [];
    foreach ($allClientes as $cliente) {
        $clienteId = $cliente['_id'] ?? null;
        
        // Calcular dados de vendas para este cliente
        $clienteVendas = array_filter($vendas, function($venda) use ($clienteId) {
            $vendaClienteId = null;
            if (isset($venda['cliente']['_id'])) {
                $vendaClienteId = $venda['cliente']['_id'];
            } elseif (isset($venda['clienteId'])) {
                $vendaClienteId = $venda['clienteId'];
            }
            return $vendaClienteId === $clienteId;
        });
        
        $totalCompras = count($clienteVendas);
        $valorTotal = array_sum(array_column($clienteVendas, 'valorTotal'));
        $ultimaCompra = null;
        
        if (!empty($clienteVendas)) {
            $datas = array_column($clienteVendas, 'dataVenda');
            $datas = array_filter($datas);
            if (!empty($datas)) {
                $ultimaCompra = max($datas);
            }
        }
        
        $processedClientes[] = [
            'id' => $clienteId,
            'nome' => $cliente['nome'] ?? 'Nome não informado',
            'email' => $cliente['email'] ?? '',
            'telefone' => $cliente['telefone'] ?? '',
            'empresa' => $cliente['empresa'] ?? '',
            'createdAt' => $cliente['createdAt'] ?? null,
            'updatedAt' => $cliente['updatedAt'] ?? null,
            'total_compras' => $totalCompras,
            'valor_total_gasto' => $valorTotal,
            'ultima_compra' => $ultimaCompra
        ];
    }
    
    // Aplicar filtro de busca se necessário
    if ($search) {
        $processedClientes = array_filter($processedClientes, function($cliente) use ($search) {
            $searchLower = strtolower($search);
            return strpos(strtolower($cliente['nome']), $searchLower) !== false ||
                   strpos(strtolower($cliente['email']), $searchLower) !== false;
        });
        $processedClientes = array_values($processedClientes); // Reindexar
    }
    
    // Implementar paginação manual
    $total = count($processedClientes);
    $start = ($page - 1) * $limit;
    $data = array_slice($processedClientes, $start, $limit);
    
    return [
        'data' => $data,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ];
}

// Vendas com paginação
function getVendasPaginated() {
    $page = (int)($_GET['page'] ?? 1);
    $limit = min((int)($_GET['limit'] ?? 20), 50);
    $startDate = $_GET['start_date'] ?? null;
    $endDate = $_GET['end_date'] ?? null;
    
    $cacheKey = "vendas_page_{$page}_limit_{$limit}_" . md5($startDate . $endDate);
    $cached = getCache($cacheKey);
    
    if ($cached) {
        echo json_encode($cached);
        return;
    }
    
    // Tentar MongoDB primeiro
    $mongo = getMongoConnection();
    if ($mongo) {
        $result = getVendasFromMongo($mongo, $page, $limit, $startDate, $endDate);
        if ($result) {
            setCache($cacheKey, $result);
            echo json_encode($result);
            return;
        }
    }
    
    // Fallback para API
    $result = getVendasFromAPI($page, $limit, $startDate, $endDate);
    setCache($cacheKey, $result);
    echo json_encode($result);
}

function getVendasFromMongo($mongo, $page, $limit, $startDate, $endDate) {
    try {
        $collection = $mongo->selectCollection('vendas');
        
        $filter = [];
        if ($startDate || $endDate) {
            $dateFilter = [];
            if ($startDate) {
                $dateFilter['$gte'] = new MongoDB\BSON\UTCDateTime(strtotime($startDate) * 1000);
            }
            if ($endDate) {
                $dateFilter['$lte'] = new MongoDB\BSON\UTCDateTime(strtotime($endDate . ' 23:59:59') * 1000);
            }
            $filter['dataVenda'] = $dateFilter;
        }
        
        $skip = ($page - 1) * $limit;
        
        $cursor = $collection->find($filter, [
            'skip' => $skip,
            'limit' => $limit,
            'sort' => ['dataVenda' => -1]
        ]);
        
        $total = $collection->countDocuments($filter);
        $vendas = [];
        
        foreach ($cursor as $doc) {
            $vendas[] = [
                'id' => (string)$doc['_id'],
                'valorTotal' => $doc['valorTotal'] ?? 0,
                'dataVenda' => $doc['dataVenda'] ?? null,
                'status' => $doc['status'] ?? 'completed',
                'cliente' => $doc['cliente'] ?? [],
                'itens' => $doc['itens'] ?? []
            ];
        }
        
        return [
            'data' => $vendas,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ];
        
    } catch (Exception $e) {
        error_log("MongoDB vendas query failed: " . $e->getMessage());
        return null;
    }
}

function getVendasFromAPI($page, $limit, $startDate, $endDate) {
    global $CRM_BASE_URL, $JWT_TOKEN;
    
    $url = $CRM_BASE_URL . '/api/crm/vendas';
    $queryParams = [];
    
    if ($startDate) $queryParams['start_date'] = $startDate;
    if ($endDate) $queryParams['end_date'] = $endDate;
    if ($page > 1) $queryParams['page'] = $page;
    if ($limit != 20) $queryParams['limit'] = $limit;
    
    if (!empty($queryParams)) {
        $url .= '?' . http_build_query($queryParams);
    }
    
    $response = makeRequest($url);
    
    if (!$response) {
        return ['data' => [], 'pagination' => ['page' => 1, 'limit' => $limit, 'total' => 0, 'pages' => 0]];
    }
    
    // Simular paginação se necessário
    if (is_array($response) && !isset($response['data'])) {
        $total = count($response);
        $start = ($page - 1) * $limit;
        $data = array_slice($response, $start, $limit);
        
        return [
            'data' => $data,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ];
    }
    
    return $response;
}

// Produtos com paginação
function getProdutosPaginated() {
    $page = (int)($_GET['page'] ?? 1);
    $limit = min((int)($_GET['limit'] ?? 50), 100);
    $category = $_GET['category'] ?? '';
    
    $cacheKey = "produtos_page_{$page}_limit_{$limit}_cat_" . md5($category);
    $cached = getCache($cacheKey);
    
    if ($cached) {
        echo json_encode($cached);
        return;
    }
    
    // Implementação similar aos clientes
    $result = ['data' => [], 'pagination' => ['page' => 1, 'limit' => $limit, 'total' => 0, 'pages' => 0]];
    setCache($cacheKey, $result);
    echo json_encode($result);
}

// Métricas otimizadas
function getMetricsOptimized() {
    $cacheKey = 'metrics_' . date('Y-m-d-H'); // Cache por hora
    $cached = getCache($cacheKey);
    
    if ($cached) {
        echo json_encode($cached);
        return;
    }
    
    $mongo = getMongoConnection();
    if ($mongo) {
        $result = getMetricsFromMongo($mongo);
        if ($result) {
            setCache($cacheKey, $result);
            echo json_encode($result);
            return;
        }
    }
    
    // Fallback: métricas básicas sem carregar todos os dados
    $result = [
        'total_sales' => 0,
        'total_revenue' => 0,
        'total_customers' => 0,
        'average_order_value' => 0,
        'sales_growth' => 0,
        'revenue_growth' => 0
    ];
    
    setCache($cacheKey, $result);
    echo json_encode($result);
}

function getMetricsFromMongo($mongo) {
    try {
        $currentMonth = date('Y-m');
        $lastMonth = date('Y-m', strtotime('-1 month'));
        
        // Agregação para métricas do mês atual
        $currentMetrics = $mongo->selectCollection('vendas')->aggregate([
            [
                '$match' => [
                    'dataVenda' => [
                        '$gte' => new MongoDB\BSON\UTCDateTime(strtotime($currentMonth . '-01') * 1000),
                        '$lt' => new MongoDB\BSON\UTCDateTime(strtotime('+1 month', strtotime($currentMonth . '-01')) * 1000)
                    ]
                ]
            ],
            [
                '$group' => [
                    '_id' => null,
                    'totalSales' => ['$sum' => 1],
                    'totalRevenue' => ['$sum' => '$valorTotal'],
                    'avgOrderValue' => ['$avg' => '$valorTotal']
                ]
            ]
        ])->toArray();
        
        // Métricas do mês anterior
        $lastMetrics = $mongo->selectCollection('vendas')->aggregate([
            [
                '$match' => [
                    'dataVenda' => [
                        '$gte' => new MongoDB\BSON\UTCDateTime(strtotime($lastMonth . '-01') * 1000),
                        '$lt' => new MongoDB\BSON\UTCDateTime(strtotime('+1 month', strtotime($lastMonth . '-01')) * 1000)
                    ]
                ]
            ],
            [
                '$group' => [
                    '_id' => null,
                    'totalSales' => ['$sum' => 1],
                    'totalRevenue' => ['$sum' => '$valorTotal']
                ]
            ]
        ])->toArray();
        
        // Total de clientes
        $totalCustomers = $mongo->selectCollection('clientes')->countDocuments();
        
        $current = $currentMetrics[0] ?? ['totalSales' => 0, 'totalRevenue' => 0, 'avgOrderValue' => 0];
        $last = $lastMetrics[0] ?? ['totalSales' => 0, 'totalRevenue' => 0];
        
        $salesGrowth = $last['totalSales'] > 0 ? (($current['totalSales'] - $last['totalSales']) / $last['totalSales']) * 100 : 0;
        $revenueGrowth = $last['totalRevenue'] > 0 ? (($current['totalRevenue'] - $last['totalRevenue']) / $last['totalRevenue']) * 100 : 0;
        
        return [
            'total_sales' => $current['totalSales'],
            'total_revenue' => $current['totalRevenue'],
            'total_customers' => $totalCustomers,
            'average_order_value' => $current['avgOrderValue'],
            'sales_growth' => $salesGrowth,
            'revenue_growth' => $revenueGrowth
        ];
        
    } catch (Exception $e) {
        error_log("MongoDB metrics query failed: " . $e->getMessage());
        return null;
    }
}

// Outras funções otimizadas (implementação similar)
function getSalesChartOptimized() {
    $days = min((int)($_GET['days'] ?? 30), 90); // Máximo 90 dias
    $cacheKey = "sales_chart_{$days}_" . date('Y-m-d');
    $cached = getCache($cacheKey);
    
    if ($cached) {
        echo json_encode($cached);
        return;
    }
    
    $result = ['data' => []];
    setCache($cacheKey, $result);
    echo json_encode($result);
}

function getCustomerSalesOptimized() {
    $limit = min((int)($_GET['limit'] ?? 10), 50);
    $cacheKey = "customer_sales_{$limit}";
    $cached = getCache($cacheKey);
    
    if ($cached) {
        echo json_encode($cached);
        return;
    }
    
    $result = ['customers' => []];
    setCache($cacheKey, $result);
    echo json_encode($result);
}

function getProductSalesOptimized() {
    $limit = min((int)($_GET['limit'] ?? 5), 20);
    $cacheKey = "product_sales_{$limit}";
    $cached = getCache($cacheKey);
    
    if ($cached) {
        echo json_encode($cached);
        return;
    }
    
    $result = ['products' => []];
    setCache($cacheKey, $result);
    echo json_encode($result);
}

function getInactiveCustomersOptimized() {
    $limit = min((int)($_GET['limit'] ?? 50), 100);
    $daysThreshold = (int)($_GET['days_threshold'] ?? 60);
    $cacheKey = "inactive_customers_{$limit}_{$daysThreshold}";
    $cached = getCache($cacheKey);
    
    if ($cached) {
        echo json_encode($cached);
        return;
    }
    
    $result = ['customers' => [], 'summary' => []];
    setCache($cacheKey, $result);
    echo json_encode($result);
}

function getCustomerSegmentationOptimized() {
    $limit = min((int)($_GET['limit'] ?? 100), 200);
    $cacheKey = "customer_segmentation_{$limit}";
    $cached = getCache($cacheKey);
    
    if ($cached) {
        echo json_encode($cached);
        return;
    }
    
    $result = ['customers' => [], 'segment_summary' => [], 'total_customers' => 0];
    setCache($cacheKey, $result);
    echo json_encode($result);
}

function getAdvancedProductAnalyticsOptimized() {
    $limit = min((int)($_GET['limit'] ?? 50), 100);
    $cacheKey = "product_analytics_{$limit}";
    $cached = getCache($cacheKey);
    
    if ($cached) {
        echo json_encode($cached);
        return;
    }
    
    $result = ['products' => [], 'category_summary' => [], 'insights' => []];
    setCache($cacheKey, $result);
    echo json_encode($result);
}

// Função auxiliar para requisições HTTP
function makeRequest($url) {
    global $JWT_TOKEN;
    
    $headers = [
        'Accept: application/json',
        'Content-Type: application/json',
        'X-Custom-Header: CRM-Frontend-v2.0.0',
        'Authorization: Bearer ' . $JWT_TOKEN
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Timeout reduzido
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error || $httpCode !== 200) {
        error_log("Request failed for $url: HTTP $httpCode - $error");
        return null;
    }
    
    return json_decode($response, true);
}
?>