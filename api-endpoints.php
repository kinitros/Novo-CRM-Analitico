<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Configuração do banco de dados
$host = 'localhost';
$dbname = 'seu_usuario_crm_analytics';  // ← ALTERE AQUI
$username = 'seu_usuario';              // ← ALTERE AQUI
$password = 'sua_senha';                // ← ALTERE AQUI

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro de conexão com banco']);
    exit;
}

// Roteamento simples baseado na URL
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);
$segments = explode('/', trim($path, '/'));

// Remover segmentos até chegar na API
$apiIndex = array_search('api', $segments);
if ($apiIndex !== false) {
    $segments = array_slice($segments, $apiIndex + 1);
}

$endpoint = $segments[0] ?? '';
$action = $segments[1] ?? '';

switch ($endpoint) {
    case 'crm':
        handleCrmEndpoint($pdo, $action);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint não encontrado']);
}

function handleCrmEndpoint($pdo, $action) {
    switch ($action) {
        case 'metrics':
            getSalesMetrics($pdo);
            break;
        case 'customer-sales':
            getCustomerSales($pdo);
            break;
        case 'product-sales':
            getProductSales($pdo);
            break;
        case 'sales':
            getSales($pdo);
            break;
        case 'sales-chart':
            getSalesChartData($pdo);
            break;
        case 'inactive-customers':
            getInactiveCustomers($pdo);
            break;
        case 'customer-segmentation':
            getCustomerSegmentation($pdo);
            break;
        case 'advanced-product-analytics':
            getAdvancedProductAnalytics($pdo);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Ação não encontrada']);
    }
}

// Métricas de vendas
function getSalesMetrics($pdo) {
    $currentDate = date('Y-m-d');
    $lastMonth = date('Y-m-01', strtotime('-1 month'));
    $currentMonth = date('Y-m-01');
    
    // Métricas do mês atual
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_sales,
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COUNT(DISTINCT customer_id) as total_customers,
            COALESCE(AVG(total_amount), 0) as average_order_value
        FROM sales 
        WHERE sale_date >= ?
    ");
    $stmt->execute([$currentMonth]);
    $current = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Métricas do mês anterior
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_sales,
            COALESCE(SUM(total_amount), 0) as total_revenue
        FROM sales 
        WHERE sale_date >= ? AND sale_date < ?
    ");
    $stmt->execute([$lastMonth, $currentMonth]);
    $previous = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $salesGrowth = $previous['total_sales'] > 0 
        ? (($current['total_sales'] - $previous['total_sales']) / $previous['total_sales']) * 100 
        : 0;
        
    $revenueGrowth = $previous['total_revenue'] > 0 
        ? (($current['total_revenue'] - $previous['total_revenue']) / $previous['total_revenue']) * 100 
        : 0;
    
    echo json_encode([
        'total_sales' => (int)$current['total_sales'],
        'total_revenue' => (float)$current['total_revenue'],
        'total_customers' => (int)$current['total_customers'],
        'average_order_value' => (float)$current['average_order_value'],
        'sales_growth' => (float)$salesGrowth,
        'revenue_growth' => (float)$revenueGrowth
    ]);
}

// Top clientes
function getCustomerSales($pdo) {
    $limit = $_GET['limit'] ?? 10;
    
    $stmt = $pdo->prepare("
        SELECT 
            c.name as customer_name,
            COUNT(s.id) as total_purchases,
            SUM(s.total_amount) as total_spent,
            MAX(s.sale_date) as last_purchase
        FROM customers c
        JOIN sales s ON c.id = s.customer_id
        GROUP BY c.id, c.name
        ORDER BY total_spent DESC
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['customers' => $customers]);
}

// Top produtos
function getProductSales($pdo) {
    $limit = $_GET['limit'] ?? 5;
    
    $stmt = $pdo->prepare("
        SELECT 
            p.name as product_name,
            SUM(si.quantity) as total_quantity,
            SUM(si.total_price) as total_revenue,
            COUNT(DISTINCT si.sale_id) as sales_count
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        GROUP BY p.id, p.name
        ORDER BY total_revenue DESC
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['products' => $products]);
}

// Lista de vendas
function getSales($pdo) {
    $limit = $_GET['limit'] ?? 20;
    $offset = $_GET['offset'] ?? 0;
    
    // Total de vendas
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM sales");
    $total = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Vendas com detalhes
    $stmt = $pdo->prepare("
        SELECT 
            s.id, s.customer_id, s.total_amount, s.status, s.sale_date, s.created_at, s.updated_at,
            c.name as customer_name, c.email as customer_email
        FROM sales s
        JOIN customers c ON s.customer_id = c.id
        ORDER BY s.sale_date DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$limit, $offset]);
    $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Buscar itens para cada venda
    foreach ($sales as &$sale) {
        $stmt = $pdo->prepare("
            SELECT 
                p.name as product_name,
                si.quantity,
                si.unit_price,
                si.total_price
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = ?
        ");
        $stmt->execute([$sale['id']]);
        $sale['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'sales' => $sales,
        'total' => (int)$total
    ]);
}

// Dados do gráfico de vendas
function getSalesChartData($pdo) {
    $days = $_GET['days'] ?? 30;
    $startDate = date('Y-m-d', strtotime("-$days days"));
    
    $stmt = $pdo->prepare("
        SELECT 
            DATE(sale_date) as date,
            COUNT(*) as sales,
            COALESCE(SUM(total_amount), 0) as revenue
        FROM sales 
        WHERE sale_date >= ?
        GROUP BY DATE(sale_date)
        ORDER BY date ASC
    ");
    $stmt->execute([$startDate]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['data' => $data]);
}

// Clientes inativos
function getInactiveCustomers($pdo) {
    $daysThreshold = $_GET['days_threshold'] ?? 60;
    $limit = $_GET['limit'] ?? 50;
    $riskLevel = $_GET['risk_level'] ?? null;
    
    $sql = "
        SELECT 
            c.id as customer_id,
            c.name as customer_name,
            c.email as customer_email,
            c.company,
            MAX(s.sale_date) as last_purchase_date,
            DATEDIFF(NOW(), MAX(s.sale_date)) as days_since_last_purchase,
            SUM(s.total_amount) as total_lifetime_value,
            COUNT(s.id) as total_purchases,
            AVG(s.total_amount) as average_order_value
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id
        GROUP BY c.id, c.name, c.email, c.company
        HAVING MAX(s.sale_date) IS NOT NULL 
          AND DATEDIFF(NOW(), MAX(s.sale_date)) >= ?
        ORDER BY days_since_last_purchase DESC, total_lifetime_value DESC
        LIMIT ?
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$daysThreshold, $limit]);
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Adicionar nível de risco
    foreach ($customers as &$customer) {
        $days = $customer['days_since_last_purchase'];
        if ($days >= 180) {
            $customer['risk_level'] = 'critical';
        } elseif ($days >= 120) {
            $customer['risk_level'] = 'high';
        } elseif ($days >= 90) {
            $customer['risk_level'] = 'medium';
        } else {
            $customer['risk_level'] = 'low';
        }
    }
    
    // Filtrar por nível de risco se especificado
    if ($riskLevel) {
        $customers = array_filter($customers, function($c) use ($riskLevel) {
            return $c['risk_level'] === $riskLevel;
        });
        $customers = array_values($customers); // Reindexar
    }
    
    // Calcular resumo
    $summary = [
        'total_inactive' => count($customers),
        'low_risk' => count(array_filter($customers, fn($c) => $c['risk_level'] === 'low')),
        'medium_risk' => count(array_filter($customers, fn($c) => $c['risk_level'] === 'medium')),
        'high_risk' => count(array_filter($customers, fn($c) => $c['risk_level'] === 'high')),
        'critical_risk' => count(array_filter($customers, fn($c) => $c['risk_level'] === 'critical')),
        'potential_lost_revenue' => array_sum(array_column($customers, 'total_lifetime_value'))
    ];
    
    echo json_encode([
        'customers' => $customers,
        'summary' => $summary
    ]);
}

// Segmentação de clientes (RFM simplificado)
function getCustomerSegmentation($pdo) {
    $limit = $_GET['limit'] ?? 100;
    $segment = $_GET['segment'] ?? null;
    
    $stmt = $pdo->prepare("
        SELECT 
            c.id as customer_id,
            c.name as customer_name,
            c.email as customer_email,
            c.company,
            DATEDIFF(NOW(), MAX(s.sale_date)) as recency_days,
            COUNT(s.id) as frequency_score,
            SUM(s.total_amount) as monetary_value,
            SUM(s.total_amount) as lifetime_value,
            AVG(s.total_amount) as average_order_value,
            COUNT(s.id) as total_orders,
            MAX(s.sale_date) as last_purchase_date,
            c.created_at as customer_since
        FROM customers c
        LEFT JOIN sales s ON c.id = s.customer_id
        GROUP BY c.id, c.name, c.email, c.company, c.created_at
        HAVING COUNT(s.id) > 0
        ORDER BY monetary_value DESC
        LIMIT ?
    ");
    $stmt->execute([$limit]);
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Adicionar segmentação simples
    foreach ($customers as &$customer) {
        $recency = $customer['recency_days'];
        $frequency = $customer['frequency_score'];
        $monetary = $customer['monetary_value'];
        
        // Segmentação simplificada
        if ($monetary >= 5000 && $frequency >= 5 && $recency <= 30) {
            $customer['segment'] = 'Champions';
            $customer['recommended_action'] = 'Recompense-os. Podem se tornar early adopters e ajudar a promover sua marca.';
        } elseif ($monetary >= 2000 && $frequency >= 3 && $recency <= 60) {
            $customer['segment'] = 'Loyal Customers';
            $customer['recommended_action'] = 'Faça upsell de produtos de maior valor. Peça avaliações.';
        } elseif ($recency <= 30 && $frequency <= 2) {
            $customer['segment'] = 'New Customers';
            $customer['recommended_action'] = 'Forneça suporte de integração. Construa relacionamento.';
        } elseif ($recency > 90 && $monetary >= 2000) {
            $customer['segment'] = 'At Risk';
            $customer['recommended_action'] = 'Envie emails personalizados. Ofereça descontos.';
        } else {
            $customer['segment'] = 'Need Attention';
            $customer['recommended_action'] = 'Faça ofertas por tempo limitado. Reative-os.';
        }
        
        $customer['rfm_score'] = sprintf('%d%d%d', 
            min(5, max(1, 6 - ceil($recency / 30))),
            min(5, max(1, ceil($frequency / 2))),
            min(5, max(1, ceil($monetary / 1000)))
        );
    }
    
    // Filtrar por segmento se especificado
    if ($segment) {
        $customers = array_filter($customers, function($c) use ($segment) {
            return $c['segment'] === $segment;
        });
        $customers = array_values($customers);
    }
    
    // Calcular resumo por segmento
    $segments = array_unique(array_column($customers, 'segment'));
    $segmentSummary = [];
    
    foreach ($segments as $seg) {
        $segmentCustomers = array_filter($customers, fn($c) => $c['segment'] === $seg);
        $segmentSummary[$seg] = [
            'count' => count($segmentCustomers),
            'total_value' => array_sum(array_column($segmentCustomers, 'lifetime_value')),
            'avg_recency' => array_sum(array_column($segmentCustomers, 'recency_days')) / count($segmentCustomers),
            'avg_frequency' => array_sum(array_column($segmentCustomers, 'frequency_score')) / count($segmentCustomers),
            'avg_monetary' => array_sum(array_column($segmentCustomers, 'monetary_value')) / count($segmentCustomers)
        ];
    }
    
    echo json_encode([
        'customers' => $customers,
        'segment_summary' => $segmentSummary,
        'total_customers' => count($customers)
    ]);
}

// Análise avançada de produtos
function getAdvancedProductAnalytics($pdo) {
    $limit = $_GET['limit'] ?? 50;
    $timePeriod = $_GET['time_period'] ?? 365;
    $category = $_GET['category'] ?? null;
    $sortBy = $_GET['sort_by'] ?? 'total_revenue';
    
    $whereClause = "WHERE s.sale_date >= DATE_SUB(NOW(), INTERVAL ? DAY)";
    $params = [$timePeriod];
    
    if ($category) {
        $whereClause .= " AND p.category = ?";
        $params[] = $category;
    }
    
    $orderBy = $sortBy === 'total_quantity_sold' ? 'total_quantity_sold' : 'total_revenue';
    
    $stmt = $pdo->prepare("
        SELECT 
            p.id as product_id,
            p.name as product_name,
            COALESCE(p.category, 'Sem categoria') as category,
            p.sku,
            p.price,
            COALESCE(SUM(si.total_price), 0) as total_revenue,
            COALESCE(SUM(si.quantity), 0) as total_quantity_sold,
            COUNT(DISTINCT si.sale_id) as total_orders,
            COUNT(DISTINCT s.customer_id) as unique_customers,
            MAX(s.sale_date) as last_sale_date,
            MIN(s.sale_date) as first_sale_date
        FROM products p
        LEFT JOIN sale_items si ON p.id = si.product_id
        LEFT JOIN sales s ON si.sale_id = s.id
        $whereClause
        GROUP BY p.id, p.name, p.category, p.sku, p.price
        ORDER BY $orderBy DESC
        LIMIT ?
    ");
    $params[] = $limit;
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Adicionar métricas calculadas
    foreach ($products as &$product) {
        $product['average_order_quantity'] = $product['total_orders'] > 0 
            ? $product['total_quantity_sold'] / $product['total_orders'] : 0;
        $product['revenue_per_customer'] = $product['unique_customers'] > 0 
            ? $product['total_revenue'] / $product['unique_customers'] : 0;
        $product['days_since_last_sale'] = $product['last_sale_date'] 
            ? (new DateTime())->diff(new DateTime($product['last_sale_date']))->days : 999;
        $product['performance_trend'] = 'stable'; // Simplificado
        $product['growth_rate'] = 0; // Simplificado
        $product['profitability_score'] = min(100, ($product['total_revenue'] / max(1, $product['price'] * $product['total_quantity_sold'])) * 100);
        $product['seasonal_performance'] = [];
        $product['customer_segments'] = [];
        $product['conversion_rate'] = 0;
        $product['inventory_turnover'] = $product['total_quantity_sold'] / max(1, $timePeriod / 365);
    }
    
    // Resumo por categoria
    $categories = array_unique(array_column($products, 'category'));
    $categorySummary = [];
    
    foreach ($categories as $cat) {
        $categoryProducts = array_filter($products, fn($p) => $p['category'] === $cat);
        if (!empty($categoryProducts)) {
            $topPerformer = array_reduce($categoryProducts, fn($prev, $current) => 
                $prev['total_revenue'] > $current['total_revenue'] ? $prev : $current
            );
            
            $categorySummary[$cat] = [
                'total_products' => count($categoryProducts),
                'total_revenue' => array_sum(array_column($categoryProducts, 'total_revenue')),
                'avg_performance_score' => array_sum(array_column($categoryProducts, 'profitability_score')) / count($categoryProducts),
                'top_performer' => $topPerformer['product_name']
            ];
        }
    }
    
    // Insights simplificados
    $insights = [
        'top_growing_products' => array_slice(array_column($products, 'product_name'), 0, 5),
        'declining_products' => [],
        'seasonal_products' => [],
        'high_value_products' => array_slice(
            array_column(
                array_slice(
                    usort($products, fn($a, $b) => $b['revenue_per_customer'] <=> $a['revenue_per_customer']) ? $products : $products, 
                    0, 5
                ), 
                'product_name'
            ), 0, 5
        )
    ];
    
    echo json_encode([
        'products' => $products,
        'category_summary' => $categorySummary,
        'insights' => $insights
    ]);
}
?>