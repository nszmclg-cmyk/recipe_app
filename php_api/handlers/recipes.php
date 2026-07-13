<?php

function handleGetRecipes(): void
{
    try {
        $pdo = getPdo();
        $stmt = $pdo->query('SELECT * FROM recipes');
        $rows = $stmt->fetchAll();

        $recipes = [];

        foreach ($rows as $row) {
            $recipes[] = [
                'id' => (int) $row['id'],
                'name' => $row['name'],
                'ingredients' => json_decode($row['ingredients'], true),
                'dishType' => $row['dish_type']
            ];
        }

        jsonResponse($recipes);
    } catch (Throwable $e) {
        errorResponse('DBの読み込みに失敗しました', 500);
    }
}

function handlePostRecipe(): void
{
    try {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        $name = trim($data['name'] ?? '');
        $ingredients = $data['ingredients'] ?? [];
        $dishType = trim($data['dishType'] ?? '');

        if ($name === '' || !is_array($ingredients) || count($ingredients) === 0 || $dishType === '') {
            errorResponse('name と ingredients と dishType は必須です', 400);
            return;
        }

        $pdo = getPdo();
        $stmt = $pdo->prepare(
            'INSERT INTO recipes (name, ingredients, dish_type) VALUES (:name, :ingredients, :dish_type)'
        );
        $stmt->execute([
            ':name' => $name,
            ':ingredients' => json_encode($ingredients, JSON_UNESCAPED_UNICODE),
            ':dish_type' => $dishType
        ]);

        jsonResponse(
            [
                'id' => (int) $pdo->lastInsertId(),
                'name' => $name,
                'ingredients' => $ingredients,
                'dishType' => $dishType
            ],
            201
        );
    } catch (Throwable $e) {
        errorResponse('DBへの保存に失敗しました', 500);
    }
}

function handleDeleteRecipe(int $id): void
{
    try {
        $pdo = getPdo();
        $stmt = $pdo->prepare('DELETE FROM recipes WHERE id = :id');
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            errorResponse('レシピが見つかりません', 404);
            return;
        }

        jsonResponse(['message' => '削除しました']);
    } catch (Throwable $e) {
        errorResponse('DBからの削除に失敗しました', 500);
    }
}
