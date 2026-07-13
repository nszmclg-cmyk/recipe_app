<?php

function handleGetIngredient(): void
{
    try {
        $pdo = getPdo();
        $stmt = $pdo->query('SELECT * FROM ingredients ORDER BY id');
        $ingredients = $stmt->fetchAll();

        jsonResponse($ingredients);
    } catch (Throwable $e) {
        errorResponse('食材の読み込みに失敗しました', 500);
    }
}

function handlePostIngredients(): void
{
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        $name = trim($data['name'] ?? '');

        if ($name === '') {
            errorResponse('name は必須です', 400);
            return;
        }

        $pdo = getPdo();
        $stmt = $pdo->prepare('INSERT INTO ingredients (name) VALUES (:name)');
        $stmt->execute([':name' => $name]);

        jsonResponse(
            [
                'id' => (int) $pdo->lastInsertId(),
                'name' => $name
            ],
            201
        );
    } catch (PDOException $e) {
        if (str_contains($e->getMessage(), 'UNIQUE')) {
            errorResponse('同じ食材はすでに登録されています', 400);
            return;
        }

        errorResponse('食材の保存に失敗しました', 500);
    } catch (Throwable $e) {
        errorResponse('食材の保存に失敗しました', 500);
    }
}

function handleDeleteIngredients(int $id): void
{
    try {
        $pdo = getPdo();
        $stmt = $pdo->prepare('DELETE FROM ingredients WHERE id = :id');
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            errorResponse('食材が見つかりません', 404);
            return;
        }

        jsonResponse(['message' => '削除しました']);
    } catch (Throwable $e) {
        errorResponse('食材の削除に失敗しました', 500);
    }
}
