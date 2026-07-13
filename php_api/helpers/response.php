<?php

function jsonResponse(mixed $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}

function errorResponse(string $message, int $statusCode): void
{
    jsonResponse(['error' => $message], $statusCode);
}
