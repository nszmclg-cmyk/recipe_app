<?php

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers/bedrock.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/handlers/ingredients.php';
require_once __DIR__ . '/handlers/recipes.php';
require_once __DIR__ . '/handlers/ai.php';

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

if ($method === 'GET' && $path === '/') {
    handleRoot();
    exit;
}

if ($method === 'GET' && $path === '/ingredients') {
    handleGetIngredient();
    exit;
}

if ($method === 'POST' && $path === '/ingredients') {
    handlePostIngredients();
    exit;
}

if ($method === 'DELETE' && preg_match('#^/ingredients/(\d+)$#', $path, $matches)) {
    handleDeleteIngredients((int) $matches[1]);
    exit;
}

if ($method === 'GET' && $path === '/recipes') {
    handleGetRecipes();
    exit;
}

if ($method === 'POST' && $path === '/recipes') {
    handlePostRecipe();
    exit;
}

if ($method === 'DELETE' && preg_match('#^/recipes/(\d+)$#', $path, $matches)) {
    handleDeleteRecipe((int) $matches[1]);
    exit;
}

if ($method === 'POST' && $path === '/classify-dish-type') {
    handleClassifyDishType();
    exit;
}

if ($method === 'POST' && $path === '/generate-dish-image') {
    handleGenerateDishImage();
    exit;
}

/*
|--------------------------------------------------------------------------
| Not Found
|--------------------------------------------------------------------------
*/

errorResponse('Not Found', 404);